import * as THREE from 'three';
import { scene } from '../core.js';
import { W, H, ROOM_FRONT_Z, ROOM_BACK_Z } from '../config.js';

const dustGeometry = new THREE.SphereGeometry(1, 6, 4);
const LIGHT_Z = -1.0;
const cordLen = 0.6;

function createDustMote(bounds, age = 0) {
  const lifetime = THREE.MathUtils.randFloat(3, 10);
  return {
    position: new THREE.Vector3(
      THREE.MathUtils.randFloat(bounds.minX, bounds.maxX),
      THREE.MathUtils.randFloat(bounds.minY, bounds.maxY),
      THREE.MathUtils.randFloat(bounds.minZ, bounds.maxZ)
    ),
    drift: new THREE.Vector3(
      THREE.MathUtils.randFloat(-0.012, 0.012),
      THREE.MathUtils.randFloat(-0.012, 0.012),
      THREE.MathUtils.randFloat(-0.012, 0.012)
    ),
    scale: THREE.MathUtils.randFloat(0.0015, 0.003),
    age,
    lifetime,
    fadeIn: lifetime * THREE.MathUtils.randFloat(0.08, 0.2),
    fadeOut: lifetime * THREE.MathUtils.randFloat(0.15, 0.35),
    opacity: THREE.MathUtils.randFloat(0.35, 1),
  };
}

function dustOpacity(mote) {
  const fadeIn = THREE.MathUtils.smoothstep(mote.age, 0, mote.fadeIn);
  const fadeOut = 1 - THREE.MathUtils.smoothstep(mote.age, mote.lifetime - mote.fadeOut, mote.lifetime);
  return Math.min(fadeIn, fadeOut) * mote.opacity;
}

function createDustField(count, bounds, opacity) {
  const geometry = dustGeometry.clone();
  const alphas = new Float32Array(count);
  geometry.setAttribute('instanceAlpha', new THREE.InstancedBufferAttribute(alphas, 1));
  const material = new THREE.MeshBasicMaterial({ color: 0xffe7bd, transparent: true, opacity, depthWrite: false });
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float instanceAlpha;\nvarying float vInstanceAlpha;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvInstanceAlpha = instanceAlpha;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vInstanceAlpha;')
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.a *= vInstanceAlpha;');
  };
  material.customProgramCacheKey = () => 'dust-instance-alpha';

  const particles = new THREE.InstancedMesh(geometry, material, count);
  particles.frustumCulled = false;
  const transform = new THREE.Object3D();
  const motes = Array.from({ length: count }, () => createDustMote(bounds, Math.random() * 10));
  return { particles, motes, alphas, bounds, transform };
}

function updateDustInstance(field, mote, index) {
  field.transform.position.copy(mote.position);
  field.transform.scale.setScalar(mote.scale);
  field.transform.updateMatrix();
  field.particles.setMatrixAt(index, field.transform.matrix);
  field.alphas[index] = dustOpacity(mote);
}

export function buildDust() {
  const roomDust = createDustField(120, {
    minX: -W / 2 + 0.15, maxX: W / 2 - 0.15,
    minY: 0.25, maxY: H - 0.25,
    minZ: ROOM_FRONT_Z + 0.15, maxZ: ROOM_BACK_Z - 0.15,
  }, 0.16);
  const litDust = createDustField(260, {
    minX: -0.8, maxX: 0.8,
    minY: 0.35, maxY: H - cordLen - 0.25,
    minZ: LIGHT_Z - 1.0, maxZ: LIGHT_Z + 1.0,
  }, 0.42);
  roomDust.particles.castShadow = false;
  litDust.particles.castShadow = false;
  scene.add(roomDust.particles);
  scene.add(litDust.particles);
  return { roomDust, litDust };
}

export function updateDustField(field, dt) {
  const { particles, motes, bounds } = field;
  motes.forEach((mote, i) => {
    mote.age += dt;
    if (mote.age >= mote.lifetime) {
      mote = motes[i] = createDustMote(bounds);
    }
    mote.position.addScaledVector(mote.drift, dt);
    if (mote.position.x < bounds.minX) mote.position.x = bounds.maxX;
    else if (mote.position.x > bounds.maxX) mote.position.x = bounds.minX;
    if (mote.position.y > bounds.maxY) mote.position.y = bounds.minY;
    if (mote.position.z < bounds.minZ) mote.position.z = bounds.maxZ;
    else if (mote.position.z > bounds.maxZ) mote.position.z = bounds.minZ;
    updateDustInstance(field, mote, i);
  });
  particles.instanceMatrix.needsUpdate = true;
  particles.geometry.attributes.instanceAlpha.needsUpdate = true;
}
