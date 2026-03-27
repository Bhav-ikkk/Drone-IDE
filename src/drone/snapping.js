import { getDroneParts, isAssembled, setAssembled } from './assembly.js';
import {
  applySpringForce,
  applySpringTorque,
  applyExplosionImpulse,
  resetDamping,
} from '../physics/rigidBodies.js';
import { createFixedJoint, clearJoints } from '../physics/constraints.js';

const SNAP_POS_TOLERANCE = 0.18;
const SNAP_ROT_TOLERANCE_DEG = 12;
const SNAP_ROT_TOLERANCE = Math.cos((SNAP_ROT_TOLERANCE_DEG * Math.PI) / 180);

/**
 * Assembly mode: apply spring forces to pull each part toward its target snap position.
 * Uses spec stiffness k=1500, damping b=55.
 */
export function assembleStep(world) {
  const parts = getDroneParts();
  let allSnapped = true;
  const framePart = parts.find((p) => p.id === 'frame');

  for (const part of parts) {
    if (!part.rigidBody) continue;
    const pos = part.rigidBody.translation();
    const dx = part.snapPosition.x - pos.x;
    const dy = part.snapPosition.y - pos.y;
    const dz = part.snapPosition.z - pos.z;
    const distSq = dx * dx + dy * dy + dz * dz;

    // Apply spring force toward snap target (k=1500, b=55)
    applySpringForce(part.rigidBody, part.snapPosition, 1500, 55);
    applySpringTorque(part.rigidBody, part.snapRotation, 300, 45);
    resetDamping(part.rigidBody, part.id);

    // Check if snapped within tolerance (0.18 units pos + 12° rotation)
    if (distSq < SNAP_POS_TOLERANCE * SNAP_POS_TOLERANCE) {
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
    // Create FixedJoint constraints between each part and frame
    if (framePart && world) {
      for (const part of parts) {
        if (part.id !== 'frame') {
          createFixedJoint(world, framePart.rigidBody, part.rigidBody);
        }
      }
    }
    // Lock all bodies to kinematic for stable flight
    for (const part of parts) {
      part.rigidBody.setBodyType(2, true); // Kinematic
    }
  }
}

/**
 * Disassembly mode: explode parts outward with realistic impulse (magnitude 12-18).
 */
export function disassembleStep(world) {
  if (!isAssembled()) return;

  const parts = getDroneParts();
  const center = { x: 0, y: 1, z: 0 };

  setAssembled(false);
  clearJoints(world);

  for (const part of parts) {
    // Switch back to dynamic
    part.rigidBody.setBodyType(0, true); // Dynamic
    part.snapped = false;

    applyExplosionImpulse(part.rigidBody, center, 15);
  }
}

/**
 * Check if in transition toward assembly (gesture still held, not yet fully assembled).
 */
export function isAssembling() {
  const parts = getDroneParts();
  return parts.some((p) => !p.snapped) && !isAssembled();
}
