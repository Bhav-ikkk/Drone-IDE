import RAPIER from '@dimforge/rapier3d-compat';

let world;
let rapierReady = false;

export async function initPhysicsWorld() {
  await RAPIER.init();
  rapierReady = true;

  const gravity = { x: 0.0, y: -9.81, z: 0.0 };
  world = new RAPIER.World(gravity);
  world.timestep = 1 / 60;

  // Create ground collider
  const groundDesc = RAPIER.ColliderDesc.cuboid(50, 0.1, 50)
    .setTranslation(0, -2.1, 0)
    .setRestitution(0.3);
  world.createCollider(groundDesc);

  return world;
}

export function getWorld() {
  return world;
}

export function isPhysicsReady() {
  return rapierReady;
}

export function stepPhysics() {
  if (!world) return;
  world.step();
}

export function getRapier() {
  return RAPIER;
}
