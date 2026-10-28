import * as THREE from 'three';
import { registerAudio, setAudioMultiplier } from './audioSettings.js';

export const hallwayLightAudio = registerAudio(new Audio('sfx/door_light.mp3'));
hallwayLightAudio.loop = true;
hallwayLightAudio.preload = 'auto';
hallwayLightAudio.addEventListener('timeupdate', () => {
  if (hallwayLightAudio.currentTime >= 7) hallwayLightAudio.currentTime = 0;
});

let hallwayAudioCutTimer;
let hallwayAudioIsCut = false;

function scheduleHallwayAudioCut(lightHeld) {
  if (!Object.values(lightHeld).some(Boolean)) return;
  hallwayAudioCutTimer = window.setTimeout(() => {
    hallwayAudioIsCut = !hallwayAudioIsCut;
    setAudioMultiplier(hallwayLightAudio, hallwayAudioIsCut ? 0 : 1);
    scheduleHallwayAudioCut(lightHeld);
  }, hallwayAudioIsCut ? THREE.MathUtils.randInt(10, 35) : THREE.MathUtils.randInt(180, 1200));
}

export function updateHallwayLightAudio(lightHeld) {
  if (Object.values(lightHeld).some(Boolean)) {
    if (hallwayLightAudio.paused) {
      hallwayAudioIsCut = false;
      setAudioMultiplier(hallwayLightAudio, 1);
      const playback = hallwayLightAudio.play();
      if (playback) playback.catch((error) => console.error('Could not play hallway light audio:', error));
      scheduleHallwayAudioCut(lightHeld);
    }
  } else if (!hallwayLightAudio.paused) {
    window.clearTimeout(hallwayAudioCutTimer);
    hallwayAudioIsCut = false;
    setAudioMultiplier(hallwayLightAudio, 1);
    hallwayLightAudio.pause();
    hallwayLightAudio.currentTime = 0;
  }
}
