import * as THREE from 'three';
import { scene } from '../core.js';

export function buildAmbient() {
  // ---------- Ambient ----------
  scene.add(new THREE.AmbientLight(0x1b2436, 0.35));
}

export function enableSceneShadows() {
  scene.traverse((object) => {
    if (object.isMesh && !object.isInstancedMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
}
