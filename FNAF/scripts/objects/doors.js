import * as THREE from 'three';
import { scene } from '../core.js';
import { W, DOOR_W, DOOR_H, DOOR_Z, WALLPAPER_TILE_WIDTH, WALLPAPER_TILE_HEIGHT } from '../config.js';
import { doorClosed } from './controlPanels.js';

// ---------- Doors (slide down from the top of the doorframe) ----------
const DOOR_CLOSED_Y = DOOR_H / 2;
const DOOR_OPEN_Y = DOOR_H / 2 + DOOR_H;
const DOOR_SPEED = 1 / 0.35;
const doorMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.6, metalness: 0.2 });
const doorTexture = new THREE.TextureLoader().load('textures/door.png');
doorTexture.wrapS = doorTexture.wrapT = THREE.RepeatWrapping;
doorTexture.colorSpace = THREE.SRGBColorSpace;
const doorSurfaceMat = new THREE.MeshStandardMaterial({
  map: doorTexture,
  roughness: 0.6,
  metalness: 0.2,
});

export const doors = {};

function createDoorGeometry() {
  const geometry = new THREE.BoxGeometry(0.06, DOOR_H, DOOR_W);
  const positions = geometry.attributes.position;
  const normals = geometry.attributes.normal;
  const uvs = geometry.attributes.uv;

  for (let i = 0; i < positions.count; i++) {
    if (Math.abs(normals.getX(i)) < 0.5) continue;
    uvs.setXY(
      i,
      (DOOR_Z + positions.getZ(i)) / WALLPAPER_TILE_WIDTH,
      (positions.getY(i) + DOOR_H / 2) / WALLPAPER_TILE_HEIGHT
    );
  }
  uvs.needsUpdate = true;
  return geometry;
}

export function buildDoors() {
  for (const side of [-1, 1]) {
    const slab = new THREE.Mesh(
      createDoorGeometry(),
      [doorSurfaceMat, doorSurfaceMat, doorMat, doorMat, doorMat, doorMat]
    );
    slab.position.set(side * W / 2, DOOR_OPEN_Y, DOOR_Z);
    scene.add(slab);
    doors[side] = { mesh: slab, t: 0 };
  }
}

export function updateDoors(dt) {
  for (const side of [-1, 1]) {
    const door = doors[side];
    const target = doorClosed[side] ? 1 : 0;
    const step = DOOR_SPEED * dt;
    door.t += Math.sign(target - door.t) * Math.min(Math.abs(target - door.t), step);
    const eased = door.t * door.t * (3 - 2 * door.t);
    door.mesh.position.y = DOOR_OPEN_Y + (DOOR_CLOSED_Y - DOOR_OPEN_Y) * eased;
  }
}
