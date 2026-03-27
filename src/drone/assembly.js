import * as THREE from 'three';
import { createPartDefinitions } from './partsConfig.js';
import { createPartBody } from '../physics/rigidBodies.js';

/**
 * Stores all created drone part instances:
 * { id, mesh, rigidBody, collider, snapPosition, snapRotation, definition }
 */
const droneParts = [];
let assembled = false;

export function initDroneParts(scene, world) {
  const definitions = createPartDefinitions();

  for (const def of definitions) {
    const mesh = def.createMesh();
    mesh.position.set(def.spawnOffset.x, def.spawnOffset.y, def.spawnOffset.z);
    scene.add(mesh);

    const { rigidBody, collider } = createPartBody(world, {
      position: def.spawnOffset,
      colliderType: def.colliderType,
      colliderArgs: def.colliderArgs,
      mass: def.mass,
    });

    droneParts.push({
      id: def.id,
      label: def.label,
      mesh,
      rigidBody,
      collider,
      snapPosition: new THREE.Vector3(
        def.snapPosition.x,
        def.snapPosition.y,
        def.snapPosition.z
      ),
      snapRotation: new THREE.Quaternion(
        def.snapRotation.x,
        def.snapRotation.y,
        def.snapRotation.z,
        def.snapRotation.w
      ),
      definition: def,
      snapped: false,
    });
  }

  return droneParts;
}

export function getDroneParts() {
  return droneParts;
}

export function isAssembled() {
  return assembled;
}

export function setAssembled(val) {
  assembled = val;
}

/**
 * Sync Three.js meshes from Rapier body positions every frame.
 */
export function syncMeshesToBodies() {
  for (const part of droneParts) {
    const pos = part.rigidBody.translation();
    const rot = part.rigidBody.rotation();
    part.mesh.position.set(pos.x, pos.y, pos.z);
    part.mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w);
  }
}

/**
 * Get the average center of all parts (for camera follow).
 */
export function getDroneCenter() {
  if (droneParts.length === 0) return new THREE.Vector3(0, 1, 0);
  const center = new THREE.Vector3();
  for (const part of droneParts) {
    const pos = part.rigidBody.translation();
    center.x += pos.x;
    center.y += pos.y;
    center.z += pos.z;
  }
  center.divideScalar(droneParts.length);
  return center;
}
