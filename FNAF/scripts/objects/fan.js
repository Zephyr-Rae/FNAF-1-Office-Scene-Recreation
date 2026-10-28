import * as THREE from 'three';
import { DESK_SURFACE, DESK_Z } from '../config.js';
import { box, cyl } from '../helpers.js';
import { darkMat, metalMat } from '../materials.js';
import { deskGroup } from './desk.js';

// ---------- Desk fan ----------
export function buildFan() {
  const FAN_X = 0.25, FAN_Z = DESK_Z - 0.05 + 0.05, FAN_Y = DESK_SURFACE + 0.33;
  const fanAssembly = new THREE.Group();
  fanAssembly.position.set(FAN_X, DESK_SURFACE + 0.02, FAN_Z);
  fanAssembly.scale.setScalar(1.3);
  deskGroup.add(fanAssembly);

  cyl(0.12, 0.14, 0.04, 0, 0, 0, darkMat, { parent: fanAssembly });
  cyl(0.025, 0.025, 0.3, 0, 0.16, 0, darkMat, { seg: 12, parent: fanAssembly });

  const fanHead = new THREE.Group();
  fanHead.position.y = FAN_Y - DESK_SURFACE - 0.02;
  fanHead.rotation.y = -0.5;
  fanAssembly.add(fanHead);

  const cage = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.012, 8, 32), metalMat);
  fanHead.add(cage);
  const cageInner = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.008, 8, 24), metalMat);
  fanHead.add(cageInner);
  box(0.44, 0.01, 0.01, 0, 0, 0, metalMat, fanHead);
  box(0.01, 0.44, 0.01, 0, 0, 0, metalMat, fanHead);

  const fanBlades = new THREE.Group();
  fanBlades.position.z = -0.01;
  for (let i = 0; i < 4; i++) {
    const blade = box(0.09, 0.19, 0.01, 0, 0.11, 0, darkMat, fanBlades);
    const pivot = new THREE.Group();
    pivot.rotation.z = (i * Math.PI) / 2;
    fanBlades.remove(blade);
    pivot.add(blade);
    fanBlades.add(pivot);
  }
  fanHead.add(fanBlades);
  cyl(0.05, 0.05, 0.06, 0, 0, -0.05, darkMat, { rotX: Math.PI / 2, parent: fanHead });
  return fanBlades;
}
