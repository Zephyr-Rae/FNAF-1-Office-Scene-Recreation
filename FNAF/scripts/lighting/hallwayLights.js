import * as THREE from 'three';
import { scene } from '../core.js';
import { HALL_LIGHT_COLOR, HALL_W, W } from '../config.js';
import { hallMatsBySide, setHallDecorVisible } from '../objects/hallways.js';

export const hallLights = { '-1': [], '1': [] };

export function buildHallwayLights() {
  for (const side of [-1, 1]) {
    for (const z of [-1.7, 1.7]) {
      const light = new THREE.PointLight(HALL_LIGHT_COLOR, 8, HALL_W + 2.5, 2);
      light.position.set(side * (W / 2 + HALL_W / 2), 1.6, z);
      light.userData.baseIntensity = light.intensity;
      light.userData.flickerPhase = Math.random() * Math.PI * 2;
      light.castShadow = true;
      light.shadow.mapSize.set(512, 512);
      light.shadow.camera.near = 0.1;
      light.shadow.camera.far = light.distance;
      light.shadow.bias = -0.0005;
      light.visible = false;
      scene.add(light);
      hallLights[side].push(light);
    }
  }
}

export function setHallLit(side, on) {
  for (const material of hallMatsBySide[side]) material.color.setHex(on ? material.userData.lit : 0x000000);
  setHallDecorVisible(side, on);
  for (const light of hallLights[side] ?? []) light.visible = on;
}

export function updateHallwayLightFlicker(time) {
  for (const lights of Object.values(hallLights)) {
    for (const light of lights) {
      if (!light.visible) continue;
      const phase = light.userData.flickerPhase;
      const flicker = 0.65
        + Math.sin(time * 11 + phase) * 0.18
        + Math.sin(time * 19 + phase * 1.7) * 0.12
        + Math.sin(time * 31 + phase * 0.6) * 0.08;
      light.intensity = light.userData.baseIntensity * flicker;
    }
  }
}
