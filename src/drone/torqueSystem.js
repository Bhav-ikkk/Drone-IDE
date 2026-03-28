/**
 * Motor torque system for realistic propeller physics.
 * When flying, applies continuous torque to motor rigid bodies creating
 * realistic thrust and counter-torque on the frame.
 */

import { getDroneParts, isAssembled } from './assembly.js';

const PROP_TORQUE = 8000; // Torque magnitude for propellers (spec: 8000)

/**
 * Apply motor torque to all propeller/motor rigid bodies.
 * Should be called every physics step during flight.
 * Motors 1&3 spin CW, motors 2&4 spin CCW (counter-torque balanced).
 * @param {boolean} active - Whether motors are active (flying state)
 */
export function applyMotorTorque(active) {
  if (!active || !isAssembled()) return;

  const parts = getDroneParts();
  for (const part of parts) {
    if (!part.rigidBody) continue;
    // Skip kinematic bodies — torque has no effect on them
    if (part.rigidBody.bodyType() === 2) continue;

    if (part.id === 'motor1' || part.id === 'motor3') {
      // CW spin
      part.rigidBody.addTorque({ x: 0, y: 0, z: PROP_TORQUE }, true);
    } else if (part.id === 'motor2' || part.id === 'motor4') {
      // CCW spin (counter-torque)
      part.rigidBody.addTorque({ x: 0, y: 0, z: -PROP_TORQUE }, true);
    }
  }
}

/**
 * Get the total thrust vector produced by all motors.
 * Returns { x, y, z } force vector.
 */
export function getTotalThrust() {
  const parts = getDroneParts();
  let totalThrust = 0;
  for (const part of parts) {
    if (part.id.startsWith('motor')) {
      totalThrust += PROP_TORQUE * 0.0005; // Simplified thrust from torque
    }
  }
  return { x: 0, y: totalThrust, z: 0 };
}
