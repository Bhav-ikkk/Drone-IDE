import RAPIER from '@dimforge/rapier3d-compat';

/**
 * Creates a dynamic rigid body + collider for a drone part.
 * Returns { rigidBody, collider }.
 */
export function createPartBody(world, partDef) {
  const { position, colliderType, colliderArgs, mass } = partDef;

  // RigidBody
  const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(position.x, position.y, position.z)
    .setLinearDamping(0.8)
    .setAngularDamping(1.2);
  const rigidBody = world.createRigidBody(bodyDesc);

  // Collider
  let colliderDesc;
  if (colliderType === 'cuboid') {
    colliderDesc = RAPIER.ColliderDesc.cuboid(...colliderArgs);
  } else if (colliderType === 'cylinder') {
    colliderDesc = RAPIER.ColliderDesc.cylinder(colliderArgs[0], colliderArgs[1]);
  } else {
    colliderDesc = RAPIER.ColliderDesc.cuboid(...colliderArgs);
  }
  colliderDesc.setMass(mass || 1.0);
  colliderDesc.setRestitution(0.2);
  colliderDesc.setFriction(0.5);
  const collider = world.createCollider(colliderDesc, rigidBody);

  return { rigidBody, collider };
}

/**
 * Apply a spring force pulling body toward a target position.
 */
export function applySpringForce(rigidBody, targetPos, stiffness = 800, damping = 40) {
  const pos = rigidBody.translation();
  const vel = rigidBody.linvel();

  const fx = (targetPos.x - pos.x) * stiffness - vel.x * damping;
  const fy = (targetPos.y - pos.y) * stiffness - vel.y * damping;
  const fz = (targetPos.z - pos.z) * stiffness - vel.z * damping;

  rigidBody.addForce({ x: fx, y: fy, z: fz }, true);
}

/**
 * Apply spring torque to rotate body toward target quaternion.
 */
export function applySpringTorque(rigidBody, targetQuat, stiffness = 200, damping = 30) {
  const currentRot = rigidBody.rotation();
  const angvel = rigidBody.angvel();

  // Compute quaternion error: qError = targetQuat * inverse(currentQuat)
  // For small errors, the vector part of qError ≈ half the rotation error axis*angle
  const cw = currentRot.w, cx = currentRot.x, cy = currentRot.y, cz = currentRot.z;
  const tw = targetQuat.w, tx = targetQuat.x, ty = targetQuat.y, tz = targetQuat.z;

  // Inverse of current
  const iw = cw, ix = -cx, iy = -cy, iz = -cz;

  // Multiply target * inverse(current)
  const ew = tw * iw - tx * ix - ty * iy - tz * iz;
  let ex = tw * ix + tx * iw + ty * iz - tz * iy;
  let ey = tw * iy - tx * iz + ty * iw + tz * ix;
  let ez = tw * iz + tx * iy - ty * ix + tz * iw;

  // Ensure shortest path
  if (ew < 0) { ex = -ex; ey = -ey; ez = -ez; }

  const torqueX = ex * stiffness - angvel.x * damping;
  const torqueY = ey * stiffness - angvel.y * damping;
  const torqueZ = ez * stiffness - angvel.z * damping;

  rigidBody.addTorque({ x: torqueX, y: torqueY, z: torqueZ }, true);
}

/**
 * Apply an outward explosion impulse from center.
 */
export function applyExplosionImpulse(rigidBody, center, magnitude = 10) {
  const pos = rigidBody.translation();
  let dx = pos.x - center.x;
  let dy = pos.y - center.y;
  let dz = pos.z - center.z;
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
  dx /= len; dy /= len; dz /= len;

  // Add slight upward bias
  dy += 0.3;

  const force = magnitude + Math.random() * 4;
  rigidBody.applyImpulse({ x: dx * force, y: dy * force, z: dz * force }, true);

  // Lower damping for natural scatter
  rigidBody.setLinearDamping(0.4);
  rigidBody.setAngularDamping(0.6);
}

/**
 * Reset a body's damping back to assembly defaults.
 */
export function resetDamping(rigidBody) {
  rigidBody.setLinearDamping(0.8);
  rigidBody.setAngularDamping(1.2);
}
