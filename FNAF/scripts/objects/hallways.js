import * as THREE from 'three';
import { scene } from '../core.js';
import { W, H, WALL, HALL_W, HALL_B, TILE, TOTAL_W, ROOM_FRONT_Z, ROOM_DEPTH, ROOM_MID_Z, WIN_Z, DOOR_Z, Z_MIN, Z_MAX, Z_LEN, Z_MID } from '../config.js';
import { box, makeCheckerTexture } from '../helpers.js';
import { wallTexture } from '../materials.js';
import { addWallPoster } from './posters.js';

export const hallMatsBySide = { '-1': [], '1': [], c: [] };
export const hallDecorBySide = { '-1': [], '1': [] };
export const hallPostersBySide = { '-1': [], '1': [] };
export const hallStarsBySide = { '-1': [], '1': [] };
export const hallCablesBySide = { '-1': [], '1': [] };
const cableMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x080a0b,
  roughness: 0.24,
  metalness: 0.85,
  clearcoat: 0.6,
  clearcoatRoughness: 0.18,
});

function addHallDecoration(side, object) {
  object.visible = false;
  hallDecorBySide[side].push(object);
}

function addHallPoster(side, ...args) {
  const poster = addWallPoster(...args);
  addHallDecoration(side, poster);
  hallPostersBySide[side].push(poster);
}

export function setHallDecorVisible(side, visible) {
  for (const object of hallDecorBySide[side]) object.visible = visible;
}

export function setHallPostersVisible(side, visible) {
  for (const poster of hallPostersBySide[side]) poster.visible = visible;
}

export function setHallStarsVisible(side, visible) {
  for (const object of hallStarsBySide[side]) object.visible = visible;
}

export function setHallCablesVisible(side, visible) {
  for (const object of hallCablesBySide[side]) object.visible = visible;
}

export function hallMat(side, litColor, extra = {}) {
  const material = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.9, ...extra });
  material.userData.lit = litColor;
  hallMatsBySide[side].push(material);
  return material;
}

export const hallWall = {
  '-1': hallMat(-1, 0x54544e, { map: wallTexture }),
  '1': hallMat(1, 0x54544e, { map: wallTexture }),
  c: hallMat('c', 0x54544e, { map: wallTexture }),
};
const hallCeil = { '-1': hallMat(-1, 0x2e2e2c), '1': hallMat(1, 0x2e2e2c), c: hallMat('c', 0x2e2e2c) };

const checkerTexture = makeCheckerTexture();
const leftCheckerTexture = new THREE.DataTexture(
  new Uint8Array([
    190, 48, 48, 255, 21, 21, 21, 255,
    21, 21, 21, 255, 190, 48, 48, 255,
  ]),
  2,
  2,
  THREE.RGBAFormat
);
leftCheckerTexture.magFilter = THREE.NearestFilter;
leftCheckerTexture.minFilter = THREE.NearestFilter;
leftCheckerTexture.wrapS = leftCheckerTexture.wrapT = THREE.RepeatWrapping;
leftCheckerTexture.colorSpace = THREE.SRGBColorSpace;
leftCheckerTexture.needsUpdate = true;

function addCheckerFloor(cx, cz, w, l, side = null, sourceTexture = checkerTexture) {
  const map = sourceTexture.clone();
  map.repeat.set(w / (TILE * 2), l / (TILE * 2));
  map.needsUpdate = true;
  const material = new THREE.MeshPhongMaterial({
    color: side === null ? 0xffffff : 0x000000,
    map,
    specular: 0xb0b0b0,
    shininess: 120,
  });
  if (side !== null) {
    material.userData.lit = 0xcfcfcf;
    hallMatsBySide[side].push(material);
  }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, l), material);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(cx, 0.001, cz);
  scene.add(floor);
}

function addHallPosters() {
  const leftWallX = -TOTAL_W / 2 + 0.01;
  const leftRearX = -(W / 2 + HALL_W / 2);
  addHallPoster(-1, leftRearX, 1.5, Z_MAX - 0.01, 0.91, 1.274, 'left-hall-rear.png');

  const leftClusterCenter = 0.57;
  const leftPosters = [
    { sourceX: 0.06, y: 2.1, w: 0.44, h: 0.58, tilt: 0.05, texture: 'left-hall-poster-1.png' },
    { sourceX: 0.55, y: 2.3, w: 0.46, h: 0.58, tilt: -0.04, texture: 'left-hall-poster-2.png' },
    { sourceX: 1.06, y: 2.24, w: 0.44, h: 0.58, tilt: 0.06, texture: 'left-hall-poster-3.png' },
    { sourceX: 0.16, y: 1.5, w: 0.414, h: 0.529, tilt: -0.06, texture: 'left-hall-poster-4.png' },
    { sourceX: 0.62, y: 1.67, w: 0.437, h: 0.529, tilt: 0.04, texture: 'left-hall-poster-5.png' },
  ];
  leftPosters.forEach(({ sourceX, y, w, h, tilt, texture }) => {
    addHallPoster(
      -1,
      leftWallX,
      y - 0.7,
      Z_MID + (sourceX - leftClusterCenter) * 1 + 0.76,
      w,
      h,
      texture,
      Math.PI / 2,
      tilt
    );
  });

  const rightWallX = TOTAL_W / 2 - 0.01;
  const rightPosters = [
    { offset: -0.55, w: 0.44, h: 0.58, texture: 'right-hall-poster-1.png' },
    { offset: 0, w: 0.46, h: 0.58, texture: 'right-hall-poster-2.png' },
    { offset: 0.55, w: 0.44, h: 0.58, texture: 'right-hall-poster-3.png' },
  ];
  rightPosters.forEach(({ offset, w, h, texture }) => {
    addHallPoster(
      1,
      rightWallX,
      1.3,
      DOOR_Z + offset - 1.3,
      w * 1.1,
      h * 1.1,
      texture,
      -Math.PI / 2
    );
  });
}

function makeStarGeometry() {
  const shape = new THREE.Shape();
  const outerRadius = 0.075;
  const innerRadius = 0.032;
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = Math.PI / 2 + i * Math.PI / 5;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

function addDanglingStars(sideX, side) {
  const starGeometry = makeStarGeometry();
  const starMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
  const threadMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
  const stars = [
    [-0.55, -1.25, 2.4],
    [-0.18, -0.85, 2.32],
    [0.32, -0.45, 2.48],
    [0.58, 0.05, 2.36],
    [-0.38, 0.45, 2.3],
    [0.05, 0.85, 2.44],
    [0.42, 1.25, 2.34],
  ];

  for (const [xOffset, zOffset, y] of stars) {
    const x = sideX + xOffset;
    const z = Z_MID + zOffset;
    const starTop = y + 0.075;
    const threadLength = H - 0.02 - starTop;
    const thread = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0015, 0.0015, threadLength, 5),
      threadMaterial
    );
    thread.position.set(x, starTop + threadLength / 2, z);
    scene.add(thread);
    addHallDecoration(side, thread);
    hallStarsBySide[side].push(thread);

    const star = new THREE.Mesh(starGeometry, starMaterial);
    star.position.set(x, y, z);
    scene.add(star);
    addHallDecoration(side, star);
    hallStarsBySide[side].push(star);
  }
}

function addHallCable(side, points, radius, closed = false) {
  const curve = new THREE.CatmullRomCurve3(points, closed, 'catmullrom', 0.5);
  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(curve, closed ? 24 : 32, radius, 5, closed),
    cableMaterial
  );
  cable.castShadow = true;
  scene.add(cable);
  addHallDecoration(side, cable);
  hallCablesBySide[side].push(cable);
}

function addHallCables(sideX, side) {
  const hangingCables = [
    { rearDistance: 0.3, offset: -0.55, sway: 0.42 },
    { rearDistance: 0.48, offset: 0.35, sway: -0.48 },
    { rearDistance: 0.7, offset: -0.2, sway: 0.5 },
    { rearDistance: 1.05, offset: 0.55, sway: -0.42 },
    { rearDistance: 1.5, offset: -0.5, sway: 0.38 },
    { rearDistance: 2.15, offset: 0.15, sway: -0.48 },
    { rearDistance: 3.1, offset: 0.5, sway: 0.4 },
    { rearDistance: WIN_Z - Z_MIN - 0.18, offset: 0.76, sway: -0.22 },
    { rearDistance: WIN_Z - Z_MIN + 0.16, offset: 0.62, sway: 0.28 },
    { rearDistance: DOOR_Z - Z_MIN - 0.2, offset: 0.72, sway: -0.26 },
    { rearDistance: DOOR_Z - Z_MIN + 0.18, offset: 0.58, sway: 0.3 },
    { rearDistance: 4.35, offset: -0.35, sway: -0.4 },
  ];

  for (const { rearDistance, offset, sway } of hangingCables) {
    const x = sideX + side * offset;
    const z = Z_MIN + rearDistance;
    addHallCable(side, [
      new THREE.Vector3(x, H - 0.02, z),
      new THREE.Vector3(x + side * sway * 0.65, H * 0.68, z + 0.12),
      new THREE.Vector3(x + side * sway, H * 0.38, z - 0.12),
      new THREE.Vector3(x + side * sway * 0.35, 0.012, z + 0.08),
    ], 0.009);
  }

  const floorClumps = [
    { rearDistance: 0.28, count: 7, offset: -0.22 },
    { rearDistance: 0.58, count: 6, offset: 0.24 },
    { rearDistance: 1.02, count: 5, offset: -0.1 },
    { rearDistance: 1.68, count: 4, offset: 0.3 },
    { rearDistance: 2.55, count: 2, offset: -0.28 },
    { rearDistance: WIN_Z - Z_MIN, count: 7, offset: 0.68 },
    { rearDistance: DOOR_Z - Z_MIN, count: 9, offset: 0.62 },
  ];

  floorClumps.forEach(({ rearDistance, count, offset }, clumpIndex) => {
    const centerX = sideX + side * offset;
    const centerZ = Z_MIN + rearDistance;
    for (let cableIndex = 0; cableIndex < count; cableIndex++) {
      const phase = cableIndex * 1.7 + clumpIndex * 0.8;
      const radiusX = 0.1 + (cableIndex % 3) * 0.035;
      const radiusZ = 0.12 + ((cableIndex + clumpIndex) % 3) * 0.04;
      const points = [];
      for (let pointIndex = 0; pointIndex < 8; pointIndex++) {
        const angle = pointIndex * Math.PI / 4 + phase;
        const irregularity = 0.82 + 0.18 * Math.sin(pointIndex * 2.1 + phase);
        points.push(new THREE.Vector3(
          centerX + Math.cos(angle) * radiusX * irregularity,
          0.012 + Math.max(0, Math.sin(angle * 2 + phase)) * 0.012,
          centerZ + Math.sin(angle) * radiusZ * irregularity
        ));
      }
      addHallCable(side, points, 0.007 + (cableIndex % 2) * 0.002, true);
    }
  });
}

export function buildHallways() {
  // ---------- Hallways ----------
  const sideX = W / 2 + HALL_W / 2;
  const topZ = (Z_MIN + ROOM_FRONT_Z) / 2;

  for (const side of [-1, 1]) {
    addCheckerFloor(side * sideX, Z_MID, HALL_W, Z_LEN, side, side === -1 ? leftCheckerTexture : checkerTexture);
    box(HALL_W, 0.1, Z_LEN, side * sideX, H + 0.05, Z_MID, hallCeil[side]);
    addDanglingStars(side * sideX, side);
    addHallCables(side * sideX, side);
  }
  addCheckerFloor(0, topZ, W, HALL_B, 'c');
  addCheckerFloor(0, ROOM_MID_Z, W, ROOM_DEPTH);
  box(W, 0.1, HALL_B, 0, H + 0.05, topZ, hallCeil.c);

  for (const side of [-1, 1]) {
    box(WALL, H, Z_LEN + WALL, side * (TOTAL_W / 2 + WALL / 2), H / 2, Z_MID - WALL / 2, hallWall[side]);
    box(HALL_W, H, WALL, side * sideX, H / 2, Z_MAX + WALL / 2, hallWall[side]);
    box(HALL_W + WALL, H, WALL, side * (W / 2 + (HALL_W + WALL) / 2), H / 2, Z_MIN - WALL / 2, hallWall[side]);
  }
  box(W, H, WALL, 0, H / 2, Z_MIN - WALL / 2, hallWall.c);
  addHallPosters();
}
