import * as THREE from 'three';

let wiringGroup = null;
let thrustArrows = [];
let overlaysVisible = false;

/**
 * Create wiring line overlay connecting motors to flight controller.
 */
export function createOverlays(parts, scene) {
  wiringGroup = new THREE.Group();
  wiringGroup.visible = false;
  scene.add(wiringGroup);

  // We create the lines dynamically each frame
  return wiringGroup;
}

/**
 * Update overlay visuals each frame.
 */
export function updateOverlays(parts, scene) {
  if (!overlaysVisible) return;

  // Remove old wiring lines
  while (wiringGroup.children.length > 0) {
    const child = wiringGroup.children[0];
    wiringGroup.remove(child);
    if (child.geometry) child.geometry.dispose();
    if (child.material) child.material.dispose();
  }

  // Remove old thrust arrows
  for (const arrow of thrustArrows) {
    scene.remove(arrow);
    arrow.dispose();
  }
  thrustArrows = [];

  const fc = parts.find((p) => p.id === 'flightController');
  if (!fc) return;
  const fcPos = fc.rigidBody.translation();

  // Wiring: line from each motor to FC
  const wireMat = new THREE.LineBasicMaterial({ color: 0xff4444, linewidth: 1 });
  for (const part of parts) {
    if (part.id.startsWith('motor')) {
      const mPos = part.rigidBody.translation();
      const points = [
        new THREE.Vector3(mPos.x, mPos.y, mPos.z),
        new THREE.Vector3(fcPos.x, fcPos.y, fcPos.z),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, wireMat);
      wiringGroup.add(line);
    }
  }

  // Thrust arrows above propellers
  for (const part of parts) {
    if (part.id.startsWith('prop')) {
      const pPos = part.rigidBody.translation();
      const dir = new THREE.Vector3(0, 1, 0);
      const origin = new THREE.Vector3(pPos.x, pPos.y + 0.1, pPos.z);
      const arrow = new THREE.ArrowHelper(dir, origin, 0.5, 0x00ff88, 0.1, 0.08);
      scene.add(arrow);
      thrustArrows.push(arrow);
    }
  }
}

export function toggleOverlays() {
  overlaysVisible = !overlaysVisible;
  if (wiringGroup) wiringGroup.visible = overlaysVisible;
  return overlaysVisible;
}

export function isOverlaysVisible() {
  return overlaysVisible;
}
