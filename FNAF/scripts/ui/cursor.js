import { renderer } from '../core.js';
import { ambience } from '../audio/ambience.js';
import { startAmbientEvents, stopAmbientEvents } from '../audio/ambientEvents.js';
import { pauseScreen } from './pauseScreen.js';

export const sceneCursor = document.querySelector('#scene-cursor');
export const gameState = { hasStarted: false, isPaused: false };

export function setCursorVisible(visible) {
  sceneCursor.style.display = visible ? 'block' : 'none';
  renderer.domElement.style.cursor = visible ? 'none' : 'default';
}

export function requestPointerLock() {
  const playback = ambience.play();
  if (playback) playback.catch((error) => console.error('Could not play ambience:', error));
  try {
    const request = renderer.domElement.requestPointerLock();
    if (request instanceof Promise) request.catch((error) => console.error('Could not lock the pointer:', error));
  } catch (error) {
    console.error('Could not lock the pointer:', error);
  }
}

export function initializeCursor(onLockChange, ghostMode) {
  renderer.domElement.addEventListener('click', () => {
    if (!gameState.hasStarted) requestPointerLock();
  });

  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === renderer.domElement) {
      gameState.hasStarted = true;
      gameState.isPaused = false;
      startAmbientEvents();
      onLockChange(true);
      sceneCursor.style.display = ghostMode.active ? 'none' : 'block';
      renderer.domElement.style.cursor = 'none';
      pauseScreen.style.display = 'none';
      return;
    }
    setCursorVisible(false);
    if (gameState.hasStarted) {
      ambience.pause();
      stopAmbientEvents();
      gameState.isPaused = true;
      pauseScreen.style.display = 'flex';
      onLockChange(false);
    }
  });

  document.addEventListener('pointerlockerror', () => {
    ambience.pause();
    console.error('The browser could not lock the pointer.');
  });
}
