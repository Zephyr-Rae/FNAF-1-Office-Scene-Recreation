import * as THREE from 'three';
import { scene } from '../core.js';
import { FAR_Z } from '../config.js';
import { box } from '../helpers.js';

const textureLoader = new THREE.TextureLoader();

export function createPosterMaterial(filename) {
  const texture = textureLoader.load(`textures/posters/${filename}`);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9 });
}

// ---------- Posters on the far wall ----------
export const posterBases = [];

function addPosterBase(x, y, w, h, filename, rotZ = 0) {
  const mesh = box(w, h, 0.02, x, y, FAR_Z + 0.02, createPosterMaterial(filename));
  mesh.rotation.z = rotZ;
  posterBases.push(mesh);
  return mesh;
}

export function addWallPoster(x, y, z, w, h, filename, rotationY = 0, rotationZ = 0) {
  const mount = new THREE.Group();
  mount.position.set(x, y, z);
  mount.rotation.y = rotationY;
  scene.add(mount);
  const mesh = box(w, h, 0.02, 0, 0, 0, createPosterMaterial(filename), mount);
  mesh.rotation.z = rotationZ;
  posterBases.push(mesh);
  return mesh;
}

export const officePosterCluster = [
  [0.06, 2.1, 0.44, 0.58, 'poster-2.png',  0.05],
  [0.55, 2.3, 0.46, 0.58, 'poster-5.png', -0.04],
  [1.06, 2.24, 0.44, 0.58, 'poster-6.png',  0.06],
  [0.16, 1.5, 0.414, 0.529, 'poster-4.png', -0.06],
  [0.62, 1.67, 0.437, 0.529, 'poster-3.png',  0.04],
  [1.08, 1.64, 0.391, 0.506, 'poster-1.png', -0.03],
];

export function buildPosters() {
  addPosterBase(-0.75, 1.75, 1.0, 1.4, 'celebrate.png');
  for (const poster of officePosterCluster) addPosterBase(...poster);
}
