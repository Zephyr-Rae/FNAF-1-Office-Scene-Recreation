import * as THREE from 'three';
import { scene } from '../core.js';
import { W, H, WALL, ROOM_FRONT_Z, ROOM_BACK_Z, ROOM_DEPTH, ROOM_MID_Z, WIN_W, WIN_Y0, WIN_Y1, WIN_Z, DOOR_W, DOOR_H, DOOR_Z } from '../config.js';
import { box } from '../helpers.js';
import { floorMat, ceilingMat, wallMat, frameMat } from '../materials.js';
import { hallWall } from './hallways.js';

// ---------- Room shell ----------
export function buildRoomShell() {
  box(W, 0.1, ROOM_DEPTH, 0, -0.05, ROOM_MID_Z, floorMat);
  box(W, 0.1, ROOM_DEPTH, 0, H + 0.05, ROOM_MID_Z, ceilingMat);
  box(W, H, WALL, 0, H / 2, ROOM_BACK_Z);
  box(W, H, WALL, 0, H / 2, ROOM_FRONT_Z);
}

export function wallSeg(side, z0, z1, y0, y1) {
  const outer = hallWall[side];
  const mats = side > 0
    ? [outer, wallMat, wallMat, wallMat, wallMat, wallMat]
    : [wallMat, outer, wallMat, wallMat, wallMat, wallMat];
  box(WALL, y1 - y0, z1 - z0, side * W / 2, (y0 + y1) / 2, (z0 + z1) / 2, mats);
}

export function sideWall(side, openings) {
  let cursor = ROOM_FRONT_Z;
  for (const opening of [...openings].sort((a, b) => a.z - b.z)) {
    const z0 = opening.z - opening.w / 2, z1 = opening.z + opening.w / 2;
    if (z0 > cursor) wallSeg(side, cursor, z0, 0, H);
    if (opening.y0 > 0) wallSeg(side, z0, z1, 0, opening.y0);
    if (opening.y1 < H) wallSeg(side, z0, z1, opening.y1, H);
    cursor = z1;
  }
  if (cursor < ROOM_BACK_Z) wallSeg(side, cursor, ROOM_BACK_Z, 0, H);
}

// ---------- Frames ----------
export function frame(side, zc, w, y0, y1, { sill = false } = {}) {
  const x = side * (W / 2 + WALL / 2);
  const t = 0.05;
  const depth = WALL + 0.2;
  const h = y1 - y0;
  box(depth, h, t, x, y0 + h / 2, zc - w / 2 + t / 2, frameMat);
  box(depth, h, t, x, y0 + h / 2, zc + w / 2 - t / 2, frameMat);
  box(depth, t, w, x, y1 - t / 2, zc, frameMat);
  if (sill) box(depth, t, w, x, y0 + t / 2, zc, frameMat);
}

// ---------- Side walls, frames, doors, buttons ----------
const windowGlassMat = new THREE.MeshPhongMaterial({
  color: 0x53616b,
  specular: 0xd8efff,
  shininess: 180,
  transparent: true,
  opacity: 0.3,
  side: THREE.DoubleSide,
  depthWrite: false,
});

export function buildRoomOpenings() {
  for (const side of [-1, 1]) {
    sideWall(side, [
      { z: WIN_Z,  w: WIN_W,  y0: WIN_Y0, y1: WIN_Y1 },
      { z: DOOR_Z, w: DOOR_W, y0: 0,      y1: DOOR_H },
    ]);

    frame(side, DOOR_Z, DOOR_W, 0, DOOR_H);
    frame(side, WIN_Z, WIN_W, WIN_Y0, WIN_Y1, { sill: true });

    const windowPane = new THREE.Mesh(new THREE.PlaneGeometry(WIN_W, WIN_Y1 - WIN_Y0), windowGlassMat);
    windowPane.position.set(side * (W / 2 - WALL / 2), (WIN_Y0 + WIN_Y1) / 2, WIN_Z);
    windowPane.rotation.y = side * Math.PI / 2;
    windowPane.castShadow = false;
    scene.add(windowPane);
  }
}
