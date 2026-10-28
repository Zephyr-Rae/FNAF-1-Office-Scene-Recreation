import * as THREE from 'three';
import { scene, camera, renderer } from './core.js';
import { H } from './config.js';
import { buildRoomShell, buildRoomOpenings } from './objects/room.js';
import { buildHallways } from './objects/hallways.js';
import { buildHallwayLights, updateHallwayLightFlicker } from './lighting/hallwayLights.js';
import { buildDoors, updateDoors } from './objects/doors.js';
import { buildControlPanels } from './objects/controlPanels.js';
import { buildDesk, scaleDeskGroup } from './objects/desk.js';
import { buildTVs } from './objects/tv.js';
import { buildFan } from './objects/fan.js';
import { buildProps } from './objects/props.js';
import { buildPosters } from './objects/posters.js';
import { buildHangingLight } from './lighting/hangingLight.js';
import { buildDust, updateDustField } from './objects/dust.js';
import { buildAmbient, enableSceneShadows } from './lighting/ambient.js';
import { initializeInteraction, releaseLights, updateInteraction } from './systems/interaction.js';
import { createGhostMode } from './systems/ghostmode.js';
import { getCursorSensitivity, updateLook } from './systems/lookAround.js';
import { gameState } from './ui/cursor.js';
import { setSfxMuted } from './audio/audioSettings.js';
import { setHallPostersVisible, setHallStarsVisible, setHallCablesVisible } from './objects/hallways.js';

const instructionImage = document.querySelector('#instruction-image');

buildRoomShell();
buildHallwayLights();
buildHallways();
buildRoomOpenings();
buildDoors();
buildControlPanels();

buildDesk();
const cupcakeTV = buildTVs();
const fanBlades = buildFan();
buildProps(cupcakeTV);
scaleDeskGroup();

buildPosters();
buildHangingLight();
const { roomDust, litDust } = buildDust();
buildAmbient();
enableSceneShadows();
const ghostMode = createGhostMode({
  scene,
  camera,
  ceilingY: H,
  checkbox: document.querySelector('#ghost-mode'),
  hud: document.querySelector('#ghost-hud'),
  getSensitivity: getCursorSensitivity,
  onEnter: () => {
    releaseLights();
    setSfxMuted(true);
    instructionImage.hidden = true;
    for (const side of [-1, 1]) {
      setHallPostersVisible(side, true);
      setHallStarsVisible(side, true);
      setHallCablesVisible(side, true);
    }
  },
  onExit: () => {
    setSfxMuted(false);
    instructionImage.hidden = false;
    for (const side of [-1, 1]) {
      setHallPostersVisible(side, false);
      setHallStarsVisible(side, false);
      setHallCablesVisible(side, false);
    }
  },
});
initializeInteraction(ghostMode);

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = clock.getDelta();
  if (gameState.isPaused) {
    renderer.render(scene, camera);
    return;
  }
  if (ghostMode.active) {
    ghostMode.update(dt);
  } else {
    updateLook(dt);
    updateHallwayLightFlicker(clock.elapsedTime);
    updateInteraction();
  }
  fanBlades.rotation.z -= dt * 12;
  updateDustField(roomDust, dt);
  updateDustField(litDust, dt);
  updateDoors(dt);
  renderer.render(scene, camera);
});
