import * as THREE from 'three';
import { scene } from '../core.js';
import { W, BTN_Z } from '../config.js';
import { box } from '../helpers.js';
import { darkMat } from '../materials.js';

export const doorClosed = { '-1': false, '1': false };
export const lightHeld = { '-1': false, '1': false };

// ---------- Control panels (door + light buttons) ----------
export const PAD = {
  doorOpen: { color: 0xb01212, emissive: 0xa00012 },
  doorShut: { color: 0x2fcf2f, emissive: 0x0b5814 },
  lightOff: { color: 0x6b6b6b, emissive: 0x1e1e1e },
  lightOn:  { color: 0xe4ecff, emissive: 0x8ea6ff },
};

export const pads = [];
export const controls = {};

function makeButtonGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255,255,255,0)');
  gradient.addColorStop(0.35, 'rgba(255,255,255,0)');
  gradient.addColorStop(0.55, 'rgba(255,255,255,0.35)');
  gradient.addColorStop(0.8, 'rgba(255,255,255,0.12)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

const buttonGlowTexture = makeButtonGlowTexture();
const buttonFrameMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x62666b,
  roughness: 0.28,
  metalness: 0.85,
  clearcoat: 0.35,
  clearcoatRoughness: 0.2,
});

function makeButtonFrame(y) {
  const outerSize = 0.19;
  const innerSize = 0.15;
  const halfOuter = outerSize / 2;
  const halfInner = innerSize / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-halfOuter, -halfOuter);
  shape.lineTo(halfOuter, -halfOuter);
  shape.lineTo(halfOuter, halfOuter);
  shape.lineTo(-halfOuter, halfOuter);
  shape.closePath();

  const opening = new THREE.Path();
  opening.moveTo(-halfInner, -halfInner);
  opening.lineTo(-halfInner, halfInner);
  opening.lineTo(halfInner, halfInner);
  opening.lineTo(halfInner, -halfInner);
  opening.closePath();
  shape.holes.push(opening);

  const frame = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, {
      depth: 0.01,
      bevelEnabled: false,
    }),
    buttonFrameMaterial
  );
  frame.position.set(0, y, 0.032);
  return frame;
}

function labelMesh(text, y) {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 64;
  const context = canvas.getContext('2d');
  context.fillStyle = '#d9d5c3';
  context.font = 'bold 54px Arial, Helvetica, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 128, 34);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.19, 0.05),
    new THREE.MeshStandardMaterial({ map: texture, transparent: true, roughness: 1 })
  );
  mesh.position.set(0, y, 0.032);
  return mesh;
}

function makePad(group, side, type, y) {
  group.add(makeButtonFrame(y));

  const pad = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.15, 0.02),
    new THREE.MeshStandardMaterial({ roughness: 0.4 })
  );
  pad.position.set(0, y, 0.04);
  pad.userData = { type, side };
  group.add(pad);

  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.32, 0.32),
    new THREE.MeshBasicMaterial({
      map: buttonGlowTexture,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  glow.position.set(0, y, 0.029);
  glow.visible = false;
  group.add(glow);
  pad.userData.outerGlow = glow;

  pads.push(pad);
  return pad;
}

function makePanel(side) {
  const group = new THREE.Group();
  group.position.set(side * (W / 2 - 0.08), 1.05, BTN_Z);
  group.rotation.y = -side * Math.PI / 2;
  scene.add(group);

  box(0.2, 0.64, 0.06, 0, 0, 0, darkMat, group);
  const doorPad = makePad(group, side, 'door', 0.20);
  group.add(labelMesh('DOOR', 0.055));
  const lightPad = makePad(group, side, 'light', -0.08);
  group.add(labelMesh('LIGHT', -0.215));
  controls[side] = { doorPad, lightPad };
}

export function buildControlPanels() {
  for (const side of [-1, 1]) makePanel(side);
}

export function paint(pad, state) {
  pad.material.color.setHex(state.color);
  pad.material.emissive.setHex(state.emissive);
  const glow = pad.userData.outerGlow;
  glow.material.color.setHex(state.color);
  glow.visible = state !== PAD.lightOff;
}
