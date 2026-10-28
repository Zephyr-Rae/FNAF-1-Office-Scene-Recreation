import * as THREE from 'three';
import { camera, renderer } from '../core.js';
import { pads, controls, PAD, doorClosed, lightHeld, paint } from '../objects/controlPanels.js';
import { playDoorSound } from '../audio/doorSounds.js';
import { updateHallwayLightAudio } from '../audio/hallwayLight.js';
import { setHallLit } from '../lighting/hallwayLights.js';
import { sceneCursor, gameState, initializeCursor, requestPointerLock } from '../ui/cursor.js';
import { initializePauseScreen } from '../ui/pauseScreen.js';
import {
  pointer,
  cursorPosition,
  setCursorSensitivity,
  setPointerFromClient,
  updateCursorPosition as updatePointerFromCursor,
  moveLockedCursor,
  centerCursor,
  clampCursorToViewport,
} from './lookAround.js';

const raycaster = new THREE.Raycaster();

export function refreshControls() {
  for (const side of [-1, 1]) {
    paint(controls[side].doorPad, doorClosed[side] ? PAD.doorShut : PAD.doorOpen);
    paint(controls[side].lightPad, lightHeld[side] ? PAD.lightOn : PAD.lightOff);
    setHallLit(side, lightHeld[side]);
  }
  updateHallwayLightAudio(lightHeld);
}

function updateCursorElement() {
  sceneCursor.style.left = `${cursorPosition.x}px`;
  sceneCursor.style.top = `${cursorPosition.y}px`;
}

function updateCursorPosition() {
  updateCursorElement();
  updatePointerFromCursor();
}

function pickPad() {
  camera.updateMatrixWorld();
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(pads, false)[0];
  return hit ? hit.object : null;
}

function updateHover() {
  const isHoveringPad = pickPad() !== null;
  sceneCursor.classList.toggle('is-hovering', isHoveringPad);
  if (document.pointerLockElement !== renderer.domElement) {
    renderer.domElement.style.cursor = isHoveringPad ? 'pointer' : 'default';
  }
}

export function releaseLights() {
  let changed = false;
  for (const side of [-1, 1]) {
    if (lightHeld[side]) {
      lightHeld[side] = false;
      changed = true;
    }
  }
  if (changed) refreshControls();
}

function handlePointerDown(event, ghostMode) {
  if (gameState.isPaused || ghostMode.active || event.button !== 0) return;
  if (document.pointerLockElement === renderer.domElement) {
    updateCursorPosition();
  } else {
    setPointerFromClient(event.clientX, event.clientY);
  }
  const pad = pickPad();
  if (!pad) return;
  const { type, side } = pad.userData;
  if (type === 'door') {
    doorClosed[side] = !doorClosed[side];
    playDoorSound();
  } else {
    lightHeld[side] = true;
  }
  refreshControls();
}

export function initializeInteraction(ghostMode) {
  // ---------- Mouse controls ----------
  renderer.domElement.style.touchAction = 'none';

  initializePauseScreen(requestPointerLock, setCursorSensitivity);
  initializeCursor((locked) => {
    if (locked) {
      centerCursor();
      updateCursorElement();
    } else {
      releaseLights();
    }
  }, ghostMode);

  window.addEventListener('pointermove', (event) => {
    if (gameState.isPaused) return;
    if (ghostMode.active) {
      if (document.pointerLockElement === renderer.domElement) ghostMode.look(event.movementX, event.movementY);
      return;
    }
    if (document.pointerLockElement === renderer.domElement) {
      moveLockedCursor(event.movementX, event.movementY);
      updateCursorElement();
      return;
    }
    setPointerFromClient(event.clientX, event.clientY);
  });

  window.addEventListener('pointerdown', (event) => handlePointerDown(event, ghostMode));
  window.addEventListener('pointerup', releaseLights);
  window.addEventListener('pointercancel', releaseLights);
  window.addEventListener('blur', releaseLights);
  window.addEventListener('resize', () => {
    clampCursorToViewport();
    updateCursorElement();
  });

  refreshControls();
}

export function updateInteraction() {
  updateHover();
}
