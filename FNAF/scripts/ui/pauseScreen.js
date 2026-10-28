import { setSfxVolume } from '../audio/audioSettings.js';

export const pauseScreen = document.querySelector('#pause-screen');
export const playButton = document.querySelector('#play-button');
export const volumeSlider = document.querySelector('#ambience-volume');
export const volumeValue = document.querySelector('#volume-value');
export const sensitivitySlider = document.querySelector('#mouse-sensitivity');
export const sensitivityValue = document.querySelector('#sensitivity-value');

setSfxVolume(Number(volumeSlider.value) / 100);

export function initializePauseScreen(onPlay, onSensitivityChange) {
  sensitivitySlider.addEventListener('input', () => {
    onSensitivityChange(Number(sensitivitySlider.value) / 100);
    sensitivityValue.value = `${sensitivitySlider.value}%`;
  });

  volumeSlider.addEventListener('input', () => {
    setSfxVolume(Number(volumeSlider.value) / 100);
    volumeValue.value = `${volumeSlider.value}%`;
  });

  playButton.addEventListener('click', onPlay);
}
