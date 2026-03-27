import * as THREE from 'three';
import { getDroneParts, isAssembled } from './assembly.js';

let flightTime = 0;
let flightActive = false;
const flightCenter = new THREE.Vector3(0, 3, 0);
const flightRadius = 4;
const flightSpeed = 0.4;
const flightAmplitude = 1.5;

export function startFlight() {
  flightActive = true;
  flightTime = 0;
}

export function stopFlight() {
  flightActive = false;
}

export function isFlying() {
  return flightActive && isAssembled();
}

/**
 * Figure-8 flight path update.
 * Moves all assembled parts together as a rigid unit.
 */
export function updateFlight(dt) {
  if (!flightActive || !isAssembled()) return;

  flightTime += dt * flightSpeed;

  // Figure-8 (lemniscate of Bernoulli)
  const t = flightTime;
  const scale = flightRadius;
  const denominator = 1 + Math.sin(t) * Math.sin(t);
  const targetX = (scale * Math.cos(t)) / denominator;
  const targetZ = (scale * Math.sin(t) * Math.cos(t)) / denominator;
  const targetY = flightCenter.y + Math.sin(t * 2) * flightAmplitude * 0.3;

  const parts = getDroneParts();
  const framePart = parts.find((p) => p.id === 'frame');
  if (!framePart) return;

  // Current position of frame
  const currentPos = framePart.rigidBody.translation();
  const targetPos = new THREE.Vector3(targetX, targetY, targetZ);

  // Smoothly move toward target
  const lerpFactor = 0.03;
  const newX = currentPos.x + (targetPos.x - currentPos.x) * lerpFactor;
  const newY = currentPos.y + (targetPos.y - currentPos.y) * lerpFactor;
  const newZ = currentPos.z + (targetPos.z - currentPos.z) * lerpFactor;

  // Movement direction for tilt
  const dx = targetPos.x - currentPos.x;
  const dz = targetPos.z - currentPos.z;
  const moveAngle = Math.atan2(dx, dz);

  // Apply to all parts (maintain relative offsets)
  const frameSnap = framePart.snapPosition;
  for (const part of parts) {
    const relX = part.snapPosition.x - frameSnap.x;
    const relY = part.snapPosition.y - frameSnap.y;
    const relZ = part.snapPosition.z - frameSnap.z;

    part.rigidBody.setTranslation(
      { x: newX + relX, y: newY + relY, z: newZ + relZ },
      true
    );

    // Slight tilt in movement direction
    const tiltAmount = 0.15;
    const tiltQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        Math.sin(moveAngle) * tiltAmount,
        -moveAngle * 0.3,
        -Math.cos(moveAngle) * tiltAmount
      )
    );
    part.rigidBody.setRotation(
      { x: tiltQuat.x, y: tiltQuat.y, z: tiltQuat.z, w: tiltQuat.w },
      true
    );
  }

  // Spin propellers
  updatePropellers(dt, true);
}

/**
 * Spin propeller meshes.
 */
export function updatePropellers(dt, spinning) {
  const parts = getDroneParts();
  for (const part of parts) {
    if (part.id.startsWith('prop')) {
      const mesh = part.mesh;
      if (spinning) {
        mesh.userData.spinSpeed = Math.min(
          (mesh.userData.spinSpeed || 0) + dt * 20,
          40
        );
      } else {
        mesh.userData.spinSpeed = Math.max(
          (mesh.userData.spinSpeed || 0) - dt * 10,
          0
        );
      }
      mesh.rotation.y += mesh.userData.spinSpeed * dt;
    }
  }
}
