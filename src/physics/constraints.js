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

  // Compute relative transform from A to B
  // anchor1 in A's local space, anchor2 in B's local space
  const relX = posB.x - posA.x;
  const relY = posB.y - posA.y;
  const relZ = posB.z - posA.z;

  const jointParams = RAPIER.JointData.fixed(
    { x: relX, y: relY, z: relZ },  // anchor1 in bodyA local frame
    { x: 0, y: 0, z: 0, w: 1 },     // frame1 rotation (identity)
    { x: 0, y: 0, z: 0 },            // anchor2 in bodyB local frame
    { x: 0, y: 0, z: 0, w: 1 }       // frame2 rotation (identity)
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
