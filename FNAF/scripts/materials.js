import * as THREE from 'three';
import { makeSpeckle, registerDefaultBoxMaterial, registerWallpaperTexture } from './helpers.js';

// ---------- Materials ----------
export const wallTexture = new THREE.TextureLoader().load('textures/wall.png');
wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
wallTexture.colorSpace = THREE.SRGBColorSpace;
registerWallpaperTexture(wallTexture);

export const wallMat = new THREE.MeshStandardMaterial({ color: 0x5a5a50, map: wallTexture, roughness: 0.9 });
registerDefaultBoxMaterial(wallMat);
export const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x5a5a50, roughness: 0.9 });
export const floorMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8 });
export const deskMat = new THREE.MeshStandardMaterial({ map: makeSpeckle('#1b1b1e', ['#2a2a2f', '#101012']), roughness: 0.75 });
export const drawerFrontMat = new THREE.MeshStandardMaterial({ map: makeSpeckle('#202023', ['#303036', '#141416']), roughness: 0.7 });
export const handleSlotMat = new THREE.MeshStandardMaterial({ color: 0x040405, roughness: 0.9 });
export const darkMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
export const metalMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.4, metalness: 0.6 });
export const frameMat = new THREE.MeshPhongMaterial({ color: 0x101010, shininess: 180, specular: 0xcccccc });
export const tvMat = new THREE.MeshPhysicalMaterial({
  color: 0x080808,
  roughness: 0.2,
  metalness: 0.65,
  clearcoat: 0.55,
  clearcoatRoughness: 0.15,
});
export const screenMat = new THREE.MeshPhysicalMaterial({
  color: 0x000000,
  roughness: 0,
  metalness: 0.15,
  clearcoat: 0.25,
  clearcoatRoughness: 0,
});
export const posterMat = new THREE.MeshStandardMaterial({ color: 0xb8b0a0, roughness: 0.9 });
