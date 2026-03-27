import RAPIER from '@dimforge/rapier3d-compat';

/**
 * Manages Rapier FixedJoint constraints between assembled drone parts.
 */

const activeJoints = [];

/**
 * Create a FixedJoint between two rigid bodies (e.g., frame and motor).
 * The joint locks relative position and rotation.
 */
export function createFixedJoint(world, bodyA, bodyB) {
  if (!world || !bodyA || !bodyB) return null;

  const posA = bodyA.translation();
  const posB = bodyB.translation();
  const rotA = bodyA.rotation();
  const rotB = bodyB.rotation();

  // Compute relative transform from A to B in A's local coordinate space
  const relX = posB.x - posA.x;
  const relY = posB.y - posA.y;
  const relZ = posB.z - posA.z;

  // Transform world-space relative vector into bodyA's local frame
  // Inverse quaternion rotation: q* v q^-1
  const qw = rotA.w, qx = -rotA.x, qy = -rotA.y, qz = -rotA.z; // conjugate = inverse for unit quat
  // Quaternion-vector multiply: q * v
  const tx2 = qy * relZ - qz * relY + qw * relX;
  const ty2 = qz * relX - qx * relZ + qw * relY;
  const tz2 = qx * relY - qy * relX + qw * relZ;
  const tw2 = -(qx * relX + qy * relY + qz * relZ);
  const localX = tw2 * (-qx) + tx2 * qw + ty2 * (-qz) - tz2 * (-qy);
  const localY = tw2 * (-qy) - tx2 * (-qz) + ty2 * qw + tz2 * (-qx);
  const localZ = tw2 * (-qz) + tx2 * (-qy) - ty2 * (-qx) + tz2 * qw;

  const jointParams = RAPIER.JointData.fixed(
    { x: localX, y: localY, z: localZ },  // anchor1 in bodyA local frame
    { x: 0, y: 0, z: 0, w: 1 },            // frame1 rotation (identity)
    { x: 0, y: 0, z: 0 },                   // anchor2 in bodyB local frame
    { x: 0, y: 0, z: 0, w: 1 }              // frame2 rotation (identity)
  );

  const joint = world.createImpulseJoint(jointParams, bodyA, bodyB, true);
  activeJoints.push(joint);
  return joint;
}

/**
 * Remove all active joints (on disassembly).
 */
export function clearJoints(world) {
  if (!world) return;
  for (const joint of activeJoints) {
    try {
      world.removeImpulseJoint(joint, true);
    } catch (e) {
      // Joint may already be removed
    }
  }
  activeJoints.length = 0;
}

/**
 * Get count of active joints.
 */
export function getJointCount() {
  return activeJoints.length;
}
