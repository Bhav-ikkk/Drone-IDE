import { getDroneParts, isAssembled, setAssembled } from './assembly.js';
import {
  applySpringForce,
  applySpringTorque,
  applyExplosionImpulse,
  resetDamping,
} from '../physics/rigidBodies.js';

const SNAP_POS_TOLERANCE = 0.25;
const SNAP_ROT_TOLERANCE_DEG = 15;
const SNAP_ROT_TOLERANCE = Math.cos((SNAP_ROT_TOLERANCE_DEG * Math.PI) / 180);

/**
 * Assembly mode: apply spring forces to pull each part toward its target snap position.
 */
export function assembleStep() {
  const parts = getDroneParts();
  let allSnapped = true;

  for (const part of parts) {
    const pos = part.rigidBody.translation();
    const dx = part.snapPosition.x - pos.x;
    const dy = part.snapPosition.y - pos.y;
    const dz = part.snapPosition.z - pos.z;
    const distSq = dx * dx + dy * dy + dz * dz;

    // Apply spring force toward snap target
    applySpringForce(part.rigidBody, part.snapPosition, 800, 40);
    applySpringTorque(part.rigidBody, part.snapRotation, 200, 30);
    resetDamping(part.rigidBody);

    // Check if snapped
    if (distSq < SNAP_POS_TOLERANCE * SNAP_POS_TOLERANCE) {
      // Check rotation: dot product of current and target quaternion
      const rot = part.rigidBody.rotation();
      const dot = Math.abs(
        rot.x * part.snapRotation.x +
        rot.y * part.snapRotation.y +
        rot.z * part.snapRotation.z +
        rot.w * part.snapRotation.w
      );
      if (dot > SNAP_ROT_TOLERANCE) {
        part.snapped = true;
      } else {
        allSnapped = false;
      }
    } else {
      allSnapped = false;
      part.snapped = false;
    }
  }

  if (allSnapped && !isAssembled()) {
    setAssembled(true);
    // Lock all bodies to kinematic for stable flight
    for (const part of parts) {
      part.rigidBody.setBodyType(2, true); // Kinematic
    }
  }
}

/**
 * Disassembly mode: explode parts outward.
 */
export function disassembleStep() {
  if (!isAssembled()) return;

  const parts = getDroneParts();
  const center = { x: 0, y: 1, z: 0 };

  setAssembled(false);

  for (const part of parts) {
    // Switch back to dynamic
    part.rigidBody.setBodyType(0, true); // Dynamic
    part.snapped = false;

    applyExplosionImpulse(part.rigidBody, center, 10);
  }
}

/**
 * Check if in transition toward assembly (gesture still held, not yet fully assembled).
 */
export function isAssembling() {
  const parts = getDroneParts();
  return parts.some((p) => !p.snapped) && !isAssembled();
}
