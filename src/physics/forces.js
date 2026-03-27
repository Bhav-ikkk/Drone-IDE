/**
 * Centralized force applicator for physics simulation.
 * Provides utility functions for applying various forces to rigid bodies.
 */

/**
 * Apply a continuous upward thrust force (used during flight).
 * @param {object} rigidBody - Rapier rigid body
 * @param {number} thrustMagnitude - Force in Newtons
 */
export function applyThrust(rigidBody, thrustMagnitude = 4.0) {
  if (!rigidBody) return;
  rigidBody.addForce({ x: 0, y: thrustMagnitude, z: 0 }, true);
}

/**
 * Apply a drag force opposing current velocity.
 * F_drag = -coefficient * velocity
 * @param {object} rigidBody - Rapier rigid body
 * @param {number} coefficient - Drag coefficient
 */
export function applyDragForce(rigidBody, coefficient = 0.5) {
  if (!rigidBody) return;
  const vel = rigidBody.linvel();
  rigidBody.addForce({
    x: -vel.x * coefficient,
    y: -vel.y * coefficient,
    z: -vel.z * coefficient,
  }, true);
}

/**
 * Apply a steering force toward a target position.
 * Uses proportional control: F = gain * (target - current)
 * @param {object} rigidBody - Rapier rigid body
 * @param {{ x: number, y: number, z: number }} target - Target position
 * @param {number} gain - Proportional gain
 */
export function applySteeringForce(rigidBody, target, gain = 10) {
  if (!rigidBody) return;
  const pos = rigidBody.translation();
  rigidBody.addForce({
    x: (target.x - pos.x) * gain,
    y: (target.y - pos.y) * gain,
    z: (target.z - pos.z) * gain,
  }, true);
}

/**
 * Apply a one-time velocity impulse in a given direction.
 * @param {object} rigidBody - Rapier rigid body
 * @param {{ x: number, y: number, z: number }} direction - Normalized direction
 * @param {number} magnitude - Impulse strength
 */
export function applyDirectionalImpulse(rigidBody, direction, magnitude = 5) {
  if (!rigidBody) return;
  rigidBody.applyImpulse({
    x: direction.x * magnitude,
    y: direction.y * magnitude,
    z: direction.z * magnitude,
  }, true);
}
