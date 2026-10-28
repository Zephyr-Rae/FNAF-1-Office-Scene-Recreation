import * as THREE from 'three';
import { H, DESK_Z, DESK_SURFACE } from '../config.js';
import { box, cyl } from '../helpers.js';
import { darkMat, metalMat, tvMat, screenMat } from '../materials.js';
import { deskGroup } from './desk.js';

const bezelMat = new THREE.MeshPhysicalMaterial({
  color: 0x0c0c0c,
  roughness: 0.2,
  metalness: 0.65,
  clearcoat: 0.55,
  clearcoatRoughness: 0.15,
});
const ledMat = new THREE.MeshBasicMaterial({ color: 0x8a0000 });
const tvWireMaterial = new THREE.MeshStandardMaterial({
  color: 0x101010,
  roughness: 0.42,
  metalness: 0.65,
});
let tvWireIndex = 0;

function addTVWire(group, x, z, rotY, hh, humpZ, hd) {
  const index = tvWireIndex++;
  const tangle = index % 2 === 0 ? 0.09 : -0.09;
  const ceilingX = x + (index % 3 - 1) * 0.045;
  const ceilingZ = z - 0.12 - (index % 2) * 0.04;
  const dx = ceilingX - group.position.x;
  const dz = ceilingZ - group.position.z;
  const cos = Math.cos(rotY);
  const sin = Math.sin(rotY);
  const start = new THREE.Vector3(
    cos * dx + sin * dz,
    H - group.position.y,
    -sin * dx + cos * dz
  );
  const end = new THREE.Vector3(
    (index % 2 === 0 ? 1 : -1) * 0.035,
    hh / 2 - 0.015,
    humpZ - hd / 2 - 0.015
  );
  const verticalSpan = start.y - end.y;
  const middleA = new THREE.Vector3(
    start.x + tangle,
    end.y + verticalSpan * 0.68,
    start.z + (end.z - start.z) * 0.4 - 0.04
  );
  const middleB = new THREE.Vector3(
    end.x - tangle,
    end.y + verticalSpan * 0.32,
    end.z - 0.04
  );
  const curve = new THREE.CatmullRomCurve3([start, middleA, middleB, end]);
  const wire = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 32, 0.004, 5, false),
    tvWireMaterial
  );
  group.add(wire);
}

// ---------- TVs on the desk (old CRT-style sets) ----------
export function addTV(x, baseY, z, w = 0.4, h = 0.34, d = 0.3, rotY = 0) {
  const group = new THREE.Group();
  group.position.set(x, baseY + h / 2, z);
  group.rotation.y = rotY;

  const df = d * 0.4;
  const hw = w * 0.8, hh = h * 0.9, hd = d * 0.62;
  const humpZ = d / 2 - df - hd / 2 + 0.02 * d;
  addTVWire(group, x, z, rotY, hh, humpZ, hd);
  const frontBevel = 0.004;
  const frontCapDepth = 0.02;
  box(
    w,
    h,
    df - frontCapDepth,
    0,
    0,
    d / 2 - df + (df - frontCapDepth) / 2,
    tvMat,
    group
  );
  const frontShape = new THREE.Shape();
  const cornerRadius = 0.003;
  const frontWidth = w - frontBevel * 2;
  const frontHeight = h - frontBevel * 2;
  frontShape.moveTo(-frontWidth / 2 + cornerRadius, -frontHeight / 2);
  frontShape.lineTo(frontWidth / 2 - cornerRadius, -frontHeight / 2);
  frontShape.quadraticCurveTo(frontWidth / 2, -frontHeight / 2, frontWidth / 2, -frontHeight / 2 + cornerRadius);
  frontShape.lineTo(frontWidth / 2, frontHeight / 2 - cornerRadius);
  frontShape.quadraticCurveTo(frontWidth / 2, frontHeight / 2, frontWidth / 2 - cornerRadius, frontHeight / 2);
  frontShape.lineTo(-frontWidth / 2 + cornerRadius, frontHeight / 2);
  frontShape.quadraticCurveTo(-frontWidth / 2, frontHeight / 2, -frontWidth / 2, frontHeight / 2 - cornerRadius);
  frontShape.lineTo(-frontWidth / 2, -frontHeight / 2 + cornerRadius);
  frontShape.quadraticCurveTo(-frontWidth / 2, -frontHeight / 2, -frontWidth / 2 + cornerRadius, -frontHeight / 2);
  const frontGeometry = new THREE.ExtrudeGeometry(frontShape, {
    depth: frontCapDepth,
    bevelEnabled: true,
    bevelThickness: frontBevel,
    bevelSize: frontBevel,
    bevelSegments: 2,
    curveSegments: 3,
  });
  const frontHousing = new THREE.Mesh(frontGeometry, tvMat);
  frontHousing.position.set(0, 0, d / 2 - frontCapDepth - frontBevel);
  group.add(frontHousing);
  box(hw, hh, hd, 0, 0, humpZ, tvMat, group);

  for (let i = 0; i < 4; i++) {
    box(hw * 0.6, 0.003, 0.008, 0, hh / 2 + 0.0015, humpZ + (i - 1.5) * 0.025, darkMat, group);
  }

  const side = 0.03, top = 0.03, bottom = 0.075;
  const sw = w - side * 2, sh = h - top - bottom;
  const sy = (bottom - top) / 2;
  const fz = d / 2 + 0.006, ft = 0.012;
  box(w, top, ft, 0, h / 2 - top / 2, fz, bezelMat, group);
  box(w, bottom, ft, 0, -h / 2 + bottom / 2, fz, bezelMat, group);
  box(side, sh, ft, -w / 2 + side / 2, sy, fz, bezelMat, group);
  box(side, sh, ft, w / 2 - side / 2, sy, fz, bezelMat, group);
  const screenWidth = sw + 0.004, screenHeight = sh + 0.004;
  const screenRadius = Math.min(screenWidth, screenHeight) * 0.06;
  const screenShape = new THREE.Shape();
  screenShape.moveTo(-screenWidth / 2 + screenRadius, -screenHeight / 2);
  screenShape.lineTo(screenWidth / 2 - screenRadius, -screenHeight / 2);
  screenShape.absarc(
    screenWidth / 2 - screenRadius,
    -screenHeight / 2 + screenRadius,
    screenRadius,
    -Math.PI / 2,
    0
  );
  screenShape.lineTo(screenWidth / 2, screenHeight / 2 - screenRadius);
  screenShape.absarc(
    screenWidth / 2 - screenRadius,
    screenHeight / 2 - screenRadius,
    screenRadius,
    0,
    Math.PI / 2
  );
  screenShape.lineTo(-screenWidth / 2 + screenRadius, screenHeight / 2);
  screenShape.absarc(
    -screenWidth / 2 + screenRadius,
    screenHeight / 2 - screenRadius,
    screenRadius,
    Math.PI / 2,
    Math.PI
  );
  screenShape.lineTo(-screenWidth / 2, -screenHeight / 2 + screenRadius);
  screenShape.absarc(
    -screenWidth / 2 + screenRadius,
    -screenHeight / 2 + screenRadius,
    screenRadius,
    Math.PI,
    Math.PI * 1.5
  );
  const screenGeometry = new THREE.ExtrudeGeometry(screenShape, {
    depth: 0.008,
    bevelEnabled: true,
    bevelThickness: 0.0015,
    bevelSize: 0.0015,
    bevelSegments: 3,
    curveSegments: 6,
  });
  const screen = new THREE.Mesh(screenGeometry, screenMat);
  screen.position.set(0, sy, d / 2 - 0.006);
  group.add(screen);

  const cy = -h / 2 + bottom / 2;
  const controlProjection = 0.006;
  for (const kx of [w / 2 - 0.04, w / 2 - 0.08]) {
    cyl(0.011, 0.011, 0.014, kx, cy, fz + 0.007 + controlProjection, metalMat, { rotX: Math.PI / 2, seg: 14, parent: group });
  }
  for (let i = 0; i < 3; i++) {
    box(0.016, 0.01, 0.008, -w / 2 + 0.05 + i * 0.026, cy, fz + 0.006 + controlProjection, darkMat, group);
  }
  box(0.006, 0.006, 0.004, w / 2 - 0.125, cy, fz + 0.004 + controlProjection, ledMat, group);

  deskGroup.add(group);
  group.userData.humpTop = group.position.y + hh / 2;
  return group;
}

export function buildTVs() {
  const tz = DESK_Z - 0.05;
  addTV(-1.1,  DESK_SURFACE, tz + 0.1, 0.46, 0.38, 0.32,  0.5);
  addTV(-0.6,  DESK_SURFACE, tz - 0.1, 0.40, 0.34, 0.30,  0.25);
  addTV(-0.6,  DESK_SURFACE + 0.34, tz - 0.1, 0.32, 0.28, 0.26, 0.45);
  addTV(-0.2,  DESK_SURFACE, tz + 0.1, 0.28, 0.24, 0.24,  0.6);
  addTV( 0.74, DESK_SURFACE, tz - 0.1, 0.40, 0.34, 0.30, -0.35);
  addTV( 0.74, DESK_SURFACE + 0.34, tz - 0.1, 0.32, 0.28, 0.26, -0.55);
  addTV( 1.18, DESK_SURFACE, tz + 0.1, 0.32, 0.30, 0.28, -0.5);
  return addTV(1.18, DESK_SURFACE + 0.30, tz + 0.1, 0.28, 0.26, 0.24, -0.65);
}
