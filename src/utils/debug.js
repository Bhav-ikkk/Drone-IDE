import * as THREE from 'three';

/**
 * Debug visualization helpers for development and troubleshooting.
 */

let debugGroup = null;
let debugEnabled = false;
let _scene = null;
let debugHUD = null;

/**
 * Initialize debug visualization group.
 */
export function initDebug(scene) {
  _scene = scene;
  debugGroup = new THREE.Group();
  debugGroup.name = 'debug';
  debugGroup.visible = false;
  scene.add(debugGroup);

  // Create HUD overlay
  debugHUD = document.createElement('div');
  debugHUD.id = 'debug-hud';
  debugHUD.style.cssText =
    'position:fixed;top:60px;right:12px;background:rgba(0,0,0,0.75);color:#0f0;' +
    'font:12px monospace;padding:8px 12px;border-radius:6px;z-index:999;display:none;' +
    'pointer-events:none;white-space:pre;line-height:1.5;border:1px solid #0f04;';
  document.body.appendChild(debugHUD);

  return debugGroup;
}

/**
 * Toggle debug visualizations on/off.
 */
export function toggleDebug() {
  debugEnabled = !debugEnabled;
  if (debugGroup) debugGroup.visible = debugEnabled;
  if (debugHUD) debugHUD.style.display = debugEnabled ? 'block' : 'none';
  return debugEnabled;
}

/**
 * Update debug overlays each frame. Call from game loop.
 * Shows wireframe bounding boxes around each part and an on-screen HUD.
 */
export function updateDebug(parts, gesture, appState, fps) {
  if (!debugEnabled || !debugGroup) return;

  // Clear previous frame's debug visuals
  clearDebug();

  // Draw wireframe box at each part's position
  for (const part of parts) {
    const pos = part.rigidBody.translation();
    const box = new THREE.BoxHelper(part.mesh, 0x00ff00);
    box.userData.isDebug = true;
    debugGroup.add(box);

    // Velocity arrow
    const vel = part.rigidBody.linvel();
    const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
    if (speed > 0.05) {
      const origin = new THREE.Vector3(pos.x, pos.y, pos.z);
      const dir = new THREE.Vector3(vel.x, vel.y, vel.z).normalize();
      const arrow = new THREE.ArrowHelper(dir, origin, Math.min(speed, 2), 0xff4444, 0.15, 0.08);
      arrow.userData.isDebug = true;
      debugGroup.add(arrow);
    }
  }

  // Update HUD text
  if (debugHUD) {
    const partCount = parts.length;
    const assembled = parts.length > 0 && parts[0].rigidBody ? 'yes' : 'no';
    debugHUD.textContent =
      `DEBUG MODE\n` +
      `FPS: ${fps.toFixed(0)}\n` +
      `State: ${appState}\n` +
      `Gesture: ${gesture}\n` +
      `Parts: ${partCount}\n` +
      `Renderer: ${_scene?.children.length || 0} objects`;
  }
}

/**
 * Draw a debug point (small sphere) at a world position.
 */
export function debugPoint(position, color = 0xff0000, size = 0.05) {
  if (!debugGroup || !debugEnabled) return;
  const geo = new THREE.SphereGeometry(size, 6, 6);
  const mat = new THREE.MeshBasicMaterial({ color, depthTest: false });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(position.x, position.y, position.z);
  mesh.userData.isDebug = true;
  debugGroup.add(mesh);
}

/**
 * Draw a debug line between two world positions.
 */
export function debugLine(from, to, color = 0x00ff00) {
  if (!debugGroup || !debugEnabled) return;
  const points = [
    new THREE.Vector3(from.x, from.y, from.z),
    new THREE.Vector3(to.x, to.y, to.z),
  ];
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({ color, depthTest: false });
  const line = new THREE.Line(geo, mat);
  line.userData.isDebug = true;
  debugGroup.add(line);
}

/**
 * Clear all debug visuals.
 */
export function clearDebug() {
  if (!debugGroup) return;
  while (debugGroup.children.length > 0) {
    const child = debugGroup.children[0];
    debugGroup.remove(child);
    if (child.geometry) child.geometry.dispose();
    if (child.material) child.material.dispose();
    // ArrowHelper has sub-objects
    if (child.dispose) child.dispose();
  }
}

/**
 * Check if debug mode is active.
 */
export function isDebugEnabled() {
  return debugEnabled;
}
