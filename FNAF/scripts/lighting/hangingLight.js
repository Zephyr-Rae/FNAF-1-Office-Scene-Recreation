import * as THREE from 'three';
import { scene } from '../core.js';
import { H, FAR_Z, BTN_Z, DOOR_Z, OFFICE_LIGHT_COLOR } from '../config.js';
import { cyl } from '../helpers.js';
import { darkMat } from '../materials.js';

const LIGHT_Z = -1.6;
const cordLen = 0.6;

function makeGlowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0.0, 'rgba(255,240,200,1)');
  grad.addColorStop(0.18, 'rgba(255,170,70,0.85)');
  grad.addColorStop(0.45, 'rgba(255,90,30,0.35)');
  grad.addColorStop(1.0, 'rgba(120,20,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function buildHangingLight() {
  // ---------- Hanging ceiling light ----------
  cyl(0.008, 0.008, cordLen, 0, H - cordLen / 2, LIGHT_Z, darkMat, { seg: 5 });

  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.3, 0.2, 24, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5, metalness: 0.4, side: THREE.DoubleSide })
  );
  shade.position.set(0, H - cordLen - 0.08, LIGHT_Z);
  scene.add(shade);

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 16, 16),
    new THREE.MeshStandardMaterial({ color: OFFICE_LIGHT_COLOR, emissive: OFFICE_LIGHT_COLOR, emissiveIntensity: 1.5 })
  );
  bulb.position.set(0, H - cordLen - 0.14, LIGHT_Z);
  scene.add(bulb);

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeGlowTexture(),
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  }));
  glow.scale.setScalar(0.9);
  glow.position.copy(bulb.position);
  scene.add(glow);

  const hangingLight = new THREE.SpotLight(
    OFFICE_LIGHT_COLOR,
    38,
    8,
    THREE.MathUtils.degToRad(65),
    0.7,
    2
  );
  hangingLight.position.copy(bulb.position);
  hangingLight.target.position.set(0, 0.9, FAR_Z + 0.4);
  hangingLight.angle = THREE.MathUtils.degToRad(50);
  hangingLight.penumbra = 1;
  hangingLight.castShadow = true;
  hangingLight.shadow.mapSize.set(1024, 1024);
  hangingLight.shadow.bias = -0.0001;
  scene.add(hangingLight);
  scene.add(hangingLight.target);

  const doorFillLight = new THREE.SpotLight(
    0xaabbdc,
    8,
    7,
    THREE.MathUtils.degToRad(65),
    1,
    2
  );
  doorFillLight.position.set(0, 2.1, BTN_Z + 0.8);
  doorFillLight.target.position.set(0, 1, DOOR_Z);
  scene.add(doorFillLight);
  scene.add(doorFillLight.target);
}
