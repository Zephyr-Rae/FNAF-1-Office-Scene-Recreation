import * as THREE from 'three';

/**
 * Ghost Mode: a free-fly spectator camera.
 *
 *  - WASD moves along the direction you're looking, Space = up, Shift = down, scroll wheel = speed
 *  - No collisions, so you can fly through walls
 *  - Ceilings are hidden
 *  - All the scene's lights are switched off and replaced with flat, bright lighting;
 *    hallway surfaces that are normally pitch black are made visible
 *  - Everything is restored exactly when you turn it off
 *
 * It does NOT touch the buttons or doors. Your pointer/click code just needs to
 * ignore input while `ghost.active` is true (see the wiring notes).
 *
 * Options
 *   scene, camera     your THREE.Scene and THREE.PerspectiveCamera
 *   ceilingY          the room height H (ceiling slabs sit at H + 0.05)
 *   checkbox          the <input type="checkbox"> in the pause menu
 *   hud               (optional) an element shown while ghost mode is on
 *   getSensitivity    () => number, your mouse sensitivity (0.2 - 1.0, 0.8 = default)
 *   onEnter / onExit  (optional) callbacks, e.g. release held hallway lights
 */
export function createGhostMode({
  scene,
  camera,
  ceilingY,
  checkbox,
  hud = null,
  getSensitivity = () => 0.8,
  onEnter = () => {},
  onExit = () => {},
}) {
  const state = { active: false, yaw: 0, pitch: 0, speed: 3 };
  const keys = new Set();

  const ghostLights = [
    new THREE.AmbientLight(0xffffff, 2.4),
    new THREE.DirectionalLight(0xffffff, 1.4),
  ];
  ghostLights[1].position.set(2, 6, 3);
  for (const l of ghostLights) { l.visible = false; scene.add(l); }

  let savedCamera = null;
  let savedVisibility = [];
  let savedColors = [];
  let clipTargets = [];

  const UP = new THREE.Vector3(0, 1, 0);
  const fwd = new THREE.Vector3();
  const right = new THREE.Vector3();
  const move = new THREE.Vector3();
  const clipPoint = new THREE.Vector3();

  function isCeiling(o) {
    if (!o.isMesh) return false;
    if (o.userData.isCeiling) return true;
    const p = o.geometry?.parameters;
    return o.geometry.type === 'BoxGeometry' && !!p && Math.abs(p.height - 0.1) < 1e-6 && o.position.y >= ceilingY;
  }

  function enter() {
    onEnter();

    savedCamera = {
      position: camera.position.clone(),
      order: camera.rotation.order,
      near: camera.near,
    };
    camera.near = 0.01;
    camera.updateProjectionMatrix();
    camera.rotation.order = 'YXZ';
    state.yaw = camera.rotation.y;
    state.pitch = 0;
    camera.rotation.set(0, state.yaw, 0);

    savedVisibility = [];
    savedColors = [];
    clipTargets = [];
    const seen = new Set();
    scene.traverse((o) => {
      if (o.isLight && !ghostLights.includes(o)) {
        savedVisibility.push([o, o.visible]);
        o.visible = false;
      } else if (isCeiling(o)) {
        savedVisibility.push([o, o.visible]);
        o.visible = false;
      }
      if (o.isMesh && !o.isInstancedMesh && o.geometry?.type === 'BoxGeometry' && o.visible) {
        if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
        clipTargets.push({ object: o, bounds: o.geometry.boundingBox.clone(), visible: o.visible });
      }
      const mats = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
      for (const m of mats) {
        if (m.userData?.lit !== undefined && !seen.has(m)) {
          seen.add(m);
          savedColors.push([m, m.color.getHex()]);
          m.color.setHex(m.userData.lit);
        }
      }
    });
    for (const l of ghostLights) l.visible = true;
    if (hud) hud.style.display = 'block';
  }

  function exit() {
    for (const l of ghostLights) l.visible = false;
    for (const { object, visible } of clipTargets) object.visible = visible;
    clipTargets = [];
    for (const [o, v] of savedVisibility) o.visible = v;
    for (const [m, hex] of savedColors) m.color.setHex(hex);
    savedVisibility = [];
    savedColors = [];

    if (savedCamera) {
      camera.position.copy(savedCamera.position);
      camera.near = savedCamera.near;
      camera.updateProjectionMatrix();
      camera.rotation.order = savedCamera.order;
      camera.rotation.set(0, 0, 0);
      savedCamera = null;
    }
    keys.clear();
    if (hud) hud.style.display = 'none';
    onExit();
  }

  function setActive(on) {
    on = !!on;
    if (on === state.active) return;
    state.active = on;
    if (checkbox) checkbox.checked = on;
    if (on) enter(); else exit();
  }

  function look(dx, dy) {
    if (!state.active) return;
    const k = 0.0022 * (getSensitivity() / 0.8);
    state.yaw -= dx * k;
    state.pitch = THREE.MathUtils.clamp(state.pitch - dy * k, -1.55, 1.55);
    camera.rotation.set(state.pitch, state.yaw, 0);
  }

  function update(dt) {
    if (!state.active || !document.pointerLockElement) return;
    const f = (keys.has('KeyW') ? 1 : 0) - (keys.has('KeyS') ? 1 : 0);
    const r = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0);
    const u = (keys.has('Space') ? 1 : 0) - ((keys.has('ShiftLeft') || keys.has('ShiftRight')) ? 1 : 0);
    if (f || r || u) {
      const frameDelta = Number.isFinite(dt) ? THREE.MathUtils.clamp(dt, 0, 0.05) : 0;
      camera.updateMatrixWorld();
      camera.getWorldDirection(fwd);
      right.crossVectors(fwd, UP).normalize();
      move.set(0, 0, 0).addScaledVector(fwd, f).addScaledVector(right, r).addScaledVector(UP, u);
      if (move.lengthSq() > 0) {
        move.normalize().multiplyScalar(state.speed * frameDelta);
        camera.position.add(move);
      }
    }
    updateClippedObjects();
  }

  function updateClippedObjects() {
    for (const { object, bounds, visible } of clipTargets) {
      object.updateWorldMatrix(true, false);
      clipPoint.copy(camera.position);
      object.worldToLocal(clipPoint);
      object.visible = visible && !bounds.containsPoint(clipPoint);
    }
  }

  // ---------- Input ----------
  const handled = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ShiftLeft', 'ShiftRight']);

  window.addEventListener('keydown', (e) => {
    if (!state.active || !handled.has(e.code)) return;
    if (document.pointerLockElement) e.preventDefault();
    keys.add(e.code);
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  window.addEventListener('blur', () => keys.clear());
  document.addEventListener('pointerlockchange', () => keys.clear());

  window.addEventListener('wheel', (e) => {
    if (!state.active || !document.pointerLockElement) return;
    state.speed = THREE.MathUtils.clamp(state.speed * (e.deltaY < 0 ? 1.15 : 1 / 1.15), 0.5, 15);
  }, { passive: true });

  if (checkbox) checkbox.addEventListener('change', () => setActive(checkbox.checked));

  return {
    get active() { return state.active; },
    setActive,
    look,
    update,
  };
}
