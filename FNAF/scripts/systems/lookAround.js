import * as THREE from 'three';
import { camera } from '../core.js';
import { W, CAM_BTN_DIST } from '../config.js';

export const pointer = new THREE.Vector2(0, 0);
export const cursorPosition = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
};

let targetYaw = 0;
let cursorSensitivity = 0.8;

const BUTTON_ANGLE = Math.atan2(W / 2 - 0.08, CAM_BTN_DIST);
const MAX_LOOK_YAW = BUTTON_ANGLE - THREE.MathUtils.degToRad(camera.fov / 2) - THREE.MathUtils.degToRad(15);

// ---------- Look around (mouse yaw limited, like the game) ----------
export function setCursorSensitivity(sensitivity) {
  cursorSensitivity = sensitivity;
}

export function getCursorSensitivity() {
  return cursorSensitivity;
}

export function updateLookTarget(x) {
  const screenPosition = THREE.MathUtils.clamp(x / window.innerWidth, 0, 1);
  targetYaw = (0.5 - screenPosition) * MAX_LOOK_YAW * 2;
}

export function setPointerFromClient(x, y) {
  pointer.x = (x / window.innerWidth) * 2 - 1;
  pointer.y = -(y / window.innerHeight) * 2 + 1;
  updateLookTarget(x);
}

export function updateCursorPosition() {
  pointer.x = (cursorPosition.x / window.innerWidth) * 2 - 1;
  pointer.y = -(cursorPosition.y / window.innerHeight) * 2 + 1;
  updateLookTarget(cursorPosition.x);
}

export function moveLockedCursor(movementX, movementY) {
  cursorPosition.x = THREE.MathUtils.clamp(
    cursorPosition.x + movementX * cursorSensitivity,
    0,
    window.innerWidth
  );
  cursorPosition.y = THREE.MathUtils.clamp(
    cursorPosition.y + movementY * cursorSensitivity,
    0,
    window.innerHeight
  );
  updateCursorPosition();
}

export function centerCursor() {
  cursorPosition.x = window.innerWidth / 2;
  cursorPosition.y = window.innerHeight / 2;
  updateCursorPosition();
}

export function clampCursorToViewport() {
  cursorPosition.x = THREE.MathUtils.clamp(cursorPosition.x, 0, window.innerWidth);
  cursorPosition.y = THREE.MathUtils.clamp(cursorPosition.y, 0, window.innerHeight);
  updateCursorPosition();
}

export function updateLook(dt) {
  const lookSmoothing = 1 - Math.exp(-8 * dt);
  camera.rotation.y += (targetYaw - camera.rotation.y) * lookSmoothing;
}
