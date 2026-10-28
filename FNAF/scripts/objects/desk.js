import * as THREE from 'three';
import { scene } from '../core.js';
import { DESK_W, DESK_D, DESK_TOP, DESK_T, DESK_Z, DESK_SCALE } from '../config.js';
import { box, cyl } from '../helpers.js';
import { deskMat, drawerFrontMat, handleSlotMat, metalMat, frameMat } from '../materials.js';

export const deskGroup = new THREE.Group();
const speakerMat = new THREE.MeshStandardMaterial({
  color: 0x111111,
  roughness: 0.58,
  metalness: 0.6,
});

// ---------- Desk (pushed against the far wall) ----------
export function buildDesk() {
  scene.add(deskGroup);
  box(DESK_W, DESK_T, DESK_D, 0, DESK_TOP, DESK_Z, deskMat, deskGroup);
  const legH = DESK_TOP - DESK_T / 2;
  box(0.08, legH, DESK_D - 0.1, -DESK_W / 2 + 0.04, legH / 2, DESK_Z, deskMat, deskGroup);
  box(0.08, legH, DESK_D - 0.1,  DESK_W / 2 - 0.04, legH / 2, DESK_Z, deskMat, deskGroup);
  box(DESK_W, legH * 0.9, 0.04, 0, legH * 0.55, DESK_Z - DESK_D / 2 + 0.05, deskMat, deskGroup);

  const UNIT_W = 0.9, UNIT_H = 0.42, UNIT_D = 0.75;
  const unitTop = DESK_TOP - DESK_T / 2;
  const unitFront = DESK_Z + UNIT_D / 2;

  box(UNIT_W, UNIT_H, UNIT_D, -0.75, unitTop - UNIT_H / 2, DESK_Z, deskMat, deskGroup);
  for (const dy of [0.1, 0.3]) {
    const y = unitTop - dy;
    box(UNIT_W - 0.06, 0.19, 0.03, -0.75, y, unitFront + 0.01, drawerFrontMat, deskGroup);
    box(0.5, 0.03, 0.012, -0.75, y + 0.045, unitFront + 0.028, handleSlotMat, deskGroup);
  }

  const paperMaterial = new THREE.MeshStandardMaterial({ color: 0xe6e3dc, roughness: 0.88 });
  function addPaperPile(x, z, angle) {
    for (let i = 0; i < 2; i++) {
      const paperGeometry = new THREE.PlaneGeometry(0.21, 0.297);
      paperGeometry.rotateZ(angle + i * 0.08);
      paperGeometry.rotateX(-Math.PI / 2);
      const paper = new THREE.Mesh(paperGeometry, paperMaterial);
      paper.position.set(x + i * 0.025, DESK_TOP + DESK_T / 2 + 0.002 + i * 0.0015, z + i * 0.018);
      deskGroup.add(paper);
    }
  }
  addPaperPile(-0.17, DESK_Z + 0.27, 0.06);
  addPaperPile(0.56, DESK_Z + 0.12, -0.05);

  const SPK_W = 0.5, SPK_H = legH - 0.02, SPK_D = 0.42;
  const SPK_ANGLE = -0.6;
  const speaker = new THREE.Group();
  speaker.position.set(0.8, 0, DESK_Z);
  speaker.rotation.y = SPK_ANGLE;
  deskGroup.add(speaker);

  const spkFront = SPK_D / 2;
  const webMaterial = new THREE.MeshBasicMaterial({
    color: 0xb8b3a5,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const webWidth = 0.55;
  const webCenterX = DESK_W / 2 - webWidth / 2;
  const webZ = DESK_Z + Math.cos(SPK_ANGLE) * spkFront
    + Math.abs(Math.sin(SPK_ANGLE)) * SPK_W / 2 + 0.01;
  const webCenterY = unitTop / 2;
  const webRadiusX = webWidth / 2;
  const webRadiusY = webCenterY - 0.002;
  const spokeCount = 12;
  const ringSegments = 24;
  const outerRingRadius = 0.98;
  const ringRadii = [0.2, 0.4, 0.6, 0.8, outerRingRadius];
  const webStrands = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.0012, 0.0012, 1, 4),
    webMaterial,
    spokeCount + ringRadii.length * ringSegments
  );
  const strandTransform = new THREE.Object3D();
  let strandIndex = 0;

  function addWebStrand(start, end) {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    strandTransform.position.copy(start).add(end).multiplyScalar(0.5);
    strandTransform.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.normalize()
    );
    strandTransform.scale.set(1, length, 1);
    strandTransform.updateMatrix();
    webStrands.setMatrixAt(strandIndex++, strandTransform.matrix);
  }

  function getWebPoint(radius, angle) {
    const edgeScale = Math.max(Math.abs(Math.cos(angle)), Math.abs(Math.sin(angle)));
    return new THREE.Vector3(
      webCenterX + Math.cos(angle) / edgeScale * webRadiusX * radius,
      webCenterY + Math.sin(angle) / edgeScale * webRadiusY * radius,
      webZ
    );
  }

  for (let i = 0; i < spokeCount; i++) {
    const angle = -Math.PI / 2 + i * Math.PI * 2 / spokeCount;
    addWebStrand(getWebPoint(0, angle), getWebPoint(outerRingRadius, angle));
  }

  for (const radius of ringRadii) {
    for (let i = 0; i < ringSegments; i++) {
      const startAngle = i * Math.PI * 2 / ringSegments;
      const endAngle = (i + 1) * Math.PI * 2 / ringSegments;
      addWebStrand(getWebPoint(radius, startAngle), getWebPoint(radius, endAngle));
    }
  }

  const webHub = new THREE.Mesh(
    new THREE.SphereGeometry(0.006, 8, 6),
    webMaterial
  );
  webHub.position.set(webCenterX, webCenterY, webZ);
  deskGroup.add(webHub);
  webStrands.instanceMatrix.needsUpdate = true;
  webStrands.castShadow = true;
  webStrands.receiveShadow = true;
  deskGroup.add(webStrands);

  const speakerBevel = 0.006;
  const speakerCorner = 0.014;
  const speakerShape = new THREE.Shape();
  speakerShape.moveTo(-SPK_W / 2 + speakerCorner, -SPK_H / 2 + speakerBevel);
  speakerShape.lineTo(SPK_W / 2 - speakerCorner, -SPK_H / 2 + speakerBevel);
  speakerShape.absarc(
    SPK_W / 2 - speakerCorner,
    -SPK_H / 2 + speakerCorner,
    speakerCorner - speakerBevel,
    -Math.PI / 2,
    0
  );
  speakerShape.lineTo(SPK_W / 2 - speakerBevel, SPK_H / 2 - speakerCorner);
  speakerShape.absarc(
    SPK_W / 2 - speakerCorner,
    SPK_H / 2 - speakerCorner,
    speakerCorner - speakerBevel,
    0,
    Math.PI / 2
  );
  speakerShape.lineTo(-SPK_W / 2 + speakerCorner, SPK_H / 2 - speakerBevel);
  speakerShape.absarc(
    -SPK_W / 2 + speakerCorner,
    SPK_H / 2 - speakerCorner,
    speakerCorner - speakerBevel,
    Math.PI / 2,
    Math.PI
  );
  speakerShape.lineTo(-SPK_W / 2 + speakerBevel, -SPK_H / 2 + speakerCorner);
  speakerShape.absarc(
    -SPK_W / 2 + speakerCorner,
    -SPK_H / 2 + speakerCorner,
    speakerCorner - speakerBevel,
    Math.PI,
    Math.PI * 1.5
  );
  const speakerGeometry = new THREE.ExtrudeGeometry(speakerShape, {
    depth: SPK_D - speakerBevel * 2,
    bevelEnabled: true,
    bevelThickness: speakerBevel,
    bevelSize: speakerBevel,
    bevelSegments: 3,
    curveSegments: 6,
  });
  const speakerHousing = new THREE.Mesh(speakerGeometry, speakerMat);
  speakerHousing.position.set(0, SPK_H / 2 + 0.01, -(SPK_D - speakerBevel * 2) / 2);
  speaker.add(speakerHousing);

  function woofer(y, r) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 32), speakerMat);
    ring.position.set(0, y, spkFront + 0.01);
    speaker.add(ring);
    cyl(r, r, 0.03, 0, y, spkFront + 0.005, frameMat, { rotX: Math.PI / 2, parent: speaker });
    cyl(r * 0.35, r * 0.35, 0.05, 0, y, spkFront + 0.015, speakerMat, { rotX: Math.PI / 2, parent: speaker });
  }
  woofer(0.26, 0.16);
  woofer(0.57, 0.1);
}

export function scaleDeskGroup() {
  // ---------- Make the desk and everything on it bigger ----------
  const backZ = DESK_Z - DESK_D / 2;
  deskGroup.scale.setScalar(DESK_SCALE);
  deskGroup.position.z = (1 - DESK_SCALE) * backZ;
}
