import * as THREE from 'three';

/**
 * Debug visualization helpers for development and troubleshooting.
 */

let debugGroup = null;
let debugEnabled = false;

/**
 * Initialize debug visualization group.
 */
export function initDebug(scene) {
  debugGroup = new THREE.Group();
  debugGroup.name = 'debug';
  debugGroup.visible = false;
  scene.add(debugGroup);
  return debugGroup;
}

/**
 * Toggle debug visualizations on/off.
 */
export function toggleDebug() {
  debugEnabled = !debugEnabled;
  if (debugGroup) debugGroup.visible = debugEnabled;
  return debugEnabled;
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
  }
}

/**
 * Check if debug mode is active.
 */
export function isDebugEnabled() {
  return debugEnabled;
}
