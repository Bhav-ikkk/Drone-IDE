import RAPIER from '@dimforge/rapier3d-compat';

/**
 * Part-type specific physics properties for realistic simulation.
 */
const PART_PHYSICS = {
  frame:            { mass: 0.30, linDamp: 0.8, angDamp: 2.0, restitution: 0.15, friction: 0.6 },
  motor1:           { mass: 0.08, linDamp: 0.9, angDamp: 2.2, restitution: 0.10, friction: 0.7 },
  motor2:           { mass: 0.08, linDamp: 0.9, angDamp: 2.2, restitution: 0.10, friction: 0.7 },
  motor3:           { mass: 0.08, linDamp: 0.9, angDamp: 2.2, restitution: 0.10, friction: 0.7 },
  motor4:           { mass: 0.08, linDamp: 0.9, angDamp: 2.2, restitution: 0.10, friction: 0.7 },
  prop1:            { mass: 0.015, linDamp: 1.2, angDamp: 2.8, restitution: 0.20, friction: 0.4 },
  prop2:            { mass: 0.015, linDamp: 1.2, angDamp: 2.8, restitution: 0.20, friction: 0.4 },
  prop3:            { mass: 0.015, linDamp: 1.2, angDamp: 2.8, restitution: 0.20, friction: 0.4 },
  prop4:            { mass: 0.015, linDamp: 1.2, angDamp: 2.8, restitution: 0.20, friction: 0.4 },
  battery:          { mass: 0.25, linDamp: 0.6, angDamp: 1.5, restitution: 0.10, friction: 0.8 },
  flightController: { mass: 0.04, linDamp: 1.0, angDamp: 2.5, restitution: 0.15, friction: 0.5 },
  camera:           { mass: 0.06, linDamp: 0.8, angDamp: 2.0, restitution: 0.20, friction: 0.5 },
};

function getPartPhysics(partId) {
  return PART_PHYSICS[partId] || { mass: 0.1, linDamp: 0.8, angDamp: 1.5, restitution: 0.2, friction: 0.5 };
}

/**
 * Creates a dynamic rigid body + collider for a drone part.
 * Returns { rigidBody, collider }.
 */
export function createPartBody(world, partDef) {
  const { position, colliderType, colliderArgs, mass, id } = partDef;
  const phys = getPartPhysics(id);

  // RigidBody with realistic damping per part type
  const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(position.x, position.y, position.z)
    .setLinearDamping(phys.linDamp)
    .setAngularDamping(phys.angDamp);
  const rigidBody = world.createRigidBody(bodyDesc);

  // Collider with per-part mass, restitution, friction
  let colliderDesc;
  if (colliderType === 'cuboid') {
    colliderDesc = RAPIER.ColliderDesc.cuboid(...colliderArgs);
  } else if (colliderType === 'cylinder') {
    colliderDesc = RAPIER.ColliderDesc.cylinder(colliderArgs[0], colliderArgs[1]);
  } else {
    colliderDesc = RAPIER.ColliderDesc.cuboid(...colliderArgs);
  }
  colliderDesc.setMass(phys.mass);
  colliderDesc.setRestitution(phys.restitution);
  colliderDesc.setFriction(phys.friction);
  const collider = world.createCollider(colliderDesc, rigidBody);

  return { rigidBody, collider };
}

/**
 * Apply a spring force pulling body toward a target position.
 * F = -k * (currentPos - targetPos) - b * velocity
 * k=1200–1800, b=45–70 per spec.
 */
export function applySpringForce(rigidBody, targetPos, stiffness = 1500, damping = 55) {
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
export function applySpringTorque(rigidBody, targetQuat, stiffness = 300, damping = 45) {
  const currentRot = rigidBody.rotation();
  const angvel = rigidBody.angvel();

  // Compute quaternion error: qError = targetQuat * inverse(currentQuat)
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
 * Magnitude 12–18 per spec, plus small random torque.
 */
export function applyExplosionImpulse(rigidBody, center, magnitude = 15) {
  const pos = rigidBody.translation();
  let dx = pos.x - center.x;
  let dy = pos.y - center.y;
  let dz = pos.z - center.z;
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
  dx /= len; dy /= len; dz /= len;

  // Add slight upward bias
  dy += 0.3;

  const force = magnitude + Math.random() * 3;
  rigidBody.applyImpulse({ x: dx * force, y: dy * force, z: dz * force }, true);

  // Small random torque for spin
  rigidBody.applyTorqueImpulse({
    x: (Math.random() - 0.5) * 2,
    y: (Math.random() - 0.5) * 2,
    z: (Math.random() - 0.5) * 2,
  }, true);

  // Air friction damping for natural scatter
  rigidBody.setLinearDamping(0.6);
  rigidBody.setAngularDamping(1.5);
}

/**
 * Reset a body's damping back to assembly defaults.
 */
export function resetDamping(rigidBody, partId) {
  const phys = getPartPhysics(partId);
  rigidBody.setLinearDamping(phys.linDamp);
  rigidBody.setAngularDamping(phys.angDamp);
}
