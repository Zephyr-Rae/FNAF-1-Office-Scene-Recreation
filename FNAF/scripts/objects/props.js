import * as THREE from 'three';
import { DESK_Z, DESK_SURFACE } from '../config.js';
import { box, cyl, makeStripes } from '../helpers.js';
import { darkMat } from '../materials.js';
import { deskGroup } from './desk.js';

// ---------- Soda cup ----------
function buildSodaCup() {
  const cupWhite = new THREE.MeshStandardMaterial({ color: 0xe6e2d8, roughness: 0.5 });
  const cupRed = new THREE.MeshStandardMaterial({ color: 0xb01818, roughness: 0.5 });
  const CUP_X = -0.38, CUP_Z = DESK_Z + 0.27;
  const cup = new THREE.Group();
  cup.position.set(CUP_X, DESK_SURFACE, CUP_Z);
  cup.scale.setScalar(1.6);
  deskGroup.add(cup);
  cyl(0.045, 0.035, 0.14, 0, 0.07, 0, cupWhite, { seg: 20, parent: cup });
  cyl(0.0425, 0.0385, 0.05, 0, 0.07, 0, cupRed, { seg: 20, parent: cup });
  cyl(0.048, 0.048, 0.012, 0, 0.146, 0, darkMat, { seg: 20, parent: cup });
  const straw = cyl(0.005, 0.005, 0.12, 0.012, 0.2, 0, cupRed, { seg: 8, parent: cup });
  straw.rotation.z = -0.2;
}

// ---------- Chica's cupcake (on top of a right-hand TV) ----------
function buildCupcake(cupcakeTV) {
  const wrapperMat = new THREE.MeshStandardMaterial({ map: makeStripes(), roughness: 0.7 });
  const frostingMat = new THREE.MeshStandardMaterial({ color: 0xd9666d, roughness: 0.55 });
  const socketMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.8 });
  const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xf2f2ee, roughness: 0.3 });
  const irisMat = new THREE.MeshStandardMaterial({
    color: 0xb8c040,
    emissive: 0x536018,
    emissiveIntensity: 0.35,
    roughness: 0.3,
  });
  const teethMat = new THREE.MeshStandardMaterial({ color: 0xf4f4ee, roughness: 0.4 });
  const candleMat = new THREE.MeshStandardMaterial({ color: 0xe9d98a, roughness: 0.6 });
  const candleRing = new THREE.MeshStandardMaterial({ color: 0xbfa430, roughness: 0.6 });
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffd21f });

  const cupcake = new THREE.Group();
  cupcake.position.set(cupcakeTV.position.x, cupcakeTV.userData.humpTop, cupcakeTV.position.z);
  cupcake.rotation.y = cupcakeTV.rotation.y;
  cupcake.scale.setScalar(1.6);
  deskGroup.add(cupcake);

  cyl(0.05, 0.036, 0.055, 0, 0.0275, 0, wrapperMat, { seg: 24, parent: cupcake });

  const frosting = new THREE.Mesh(new THREE.SphereGeometry(0.055, 24, 16), frostingMat);
  frosting.position.y = 0.08;
  frosting.scale.set(1.25, 0.85, 1.05);
  cupcake.add(frosting);

  for (const ex of [-0.03, 0.03]) {
    const socket = new THREE.Mesh(new THREE.SphereGeometry(0.026, 14, 10), socketMat);
    socket.position.set(ex, 0.085, 0.043);
    socket.scale.z = 0.55;
    cupcake.add(socket);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.02, 14, 10), eyeWhite);
    eye.position.set(ex, 0.083, 0.052);
    cupcake.add(eye);
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.011, 12, 10), irisMat);
    iris.position.set(ex, 0.083, 0.064);
    cupcake.add(iris);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.006, 8, 8), darkMat);
    pupil.position.set(ex, 0.083, 0.071);
    cupcake.add(pupil);
  }

  for (const tx of [-0.0095, 0.0095]) {
    box(0.016, 0.018, 0.008, tx, 0.052, 0.05, teethMat, cupcake);
  }

  cyl(0.009, 0.009, 0.08, 0, 0.165, 0, candleMat, { seg: 12, parent: cupcake });
  for (const ry of [0.145, 0.165, 0.185]) {
    cyl(0.0098, 0.0098, 0.01, 0, ry, 0, candleRing, { seg: 12, parent: cupcake });
  }
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.011, 10, 8), flameMat);
  flame.position.y = 0.218;
  flame.scale.y = 1.7;
  cupcake.add(flame);
}

export function buildProps(cupcakeTV) {
  buildSodaCup();
  buildCupcake(cupcakeTV);
}
