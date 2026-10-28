import * as THREE from 'three';
import { scene } from './core.js';
import { WALLPAPER_TILE_WIDTH, WALLPAPER_TILE_HEIGHT } from './config.js';

let wallpaperTexture = null;
let defaultBoxMaterial = null;

export function registerWallpaperTexture(texture) {
  wallpaperTexture = texture;
}

export function registerDefaultBoxMaterial(material) {
  defaultBoxMaterial = material;
}

export function box(w, h, d, x, y, z, mat = defaultBoxMaterial, parent = scene) {
  const geometry = new THREE.BoxGeometry(w, h, d);
  const materials = Array.isArray(mat) ? mat : [mat];
  if (wallpaperTexture && materials.some((material) => material.map === wallpaperTexture)) {
    const positions = geometry.attributes.position;
    const normals = geometry.attributes.normal;
    const uvs = geometry.attributes.uv;
    for (let i = 0; i < positions.count; i++) {
      const normalX = Math.abs(normals.getX(i));
      const normalZ = Math.abs(normals.getZ(i));
      const useZ = normalX > normalZ;
      const horizontal = useZ ? z + positions.getZ(i) : x + positions.getX(i);
      uvs.setXY(
        i,
        horizontal / WALLPAPER_TILE_WIDTH,
        (y + positions.getY(i)) / WALLPAPER_TILE_HEIGHT
      );
    }
    uvs.needsUpdate = true;
  }
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

export function cyl(rTop, rBot, h, x, y, z, mat, { rotX = 0, rotZ = 0, seg = 24, parent = scene } = {}) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, seg), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.x = rotX;
  mesh.rotation.z = rotZ;
  parent.add(mesh);
  return mesh;
}

export function makeSpeckle(base, specks) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d');
  context.fillStyle = base; context.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 600; i++) {
    context.fillStyle = specks[i % specks.length];
    context.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function makeCheckerTexture() {
  const texture = new THREE.DataTexture(
    new Uint8Array([
      216, 216, 216, 255, 21, 21, 21, 255,
      21, 21, 21, 255, 216, 216, 216, 255,
    ]),
    2,
    2,
    THREE.RGBAFormat
  );
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function makeStripes() {
  const canvas = document.createElement('canvas');
  canvas.width = 120; canvas.height = 4;
  const context = canvas.getContext('2d');
  for (let i = 0; i < 12; i++) {
    context.fillStyle = i % 2 ? '#8c3d12' : '#c9651c';
    context.fillRect(i * 10, 0, 10, 4);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
