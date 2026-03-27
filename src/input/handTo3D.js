import * as THREE from 'three';
import { smoothValue3D } from '../input/smoothing.js';

const interactionPlaneDistance = 2.2; // Spec: 1.8–2.5m interaction plane
const virtualCursor = new THREE.Vector3(0, 1, 0);
const smoothedCursor = { x: 0, y: 1, z: 0 };

const raycaster = new THREE.Raycaster();
const screenCoord = new THREE.Vector2();

/**
 * Convert normalized hand landmark coordinates to 3D world position.
 * Uses camera unprojection onto an interaction plane.
 */
export function handTo3DPosition(landmark, camera) {
  if (!landmark) return virtualCursor.clone();
  if (!camera) return virtualCursor.clone();
  if (!Number.isFinite(landmark.x) || !Number.isFinite(landmark.y)) {
    return virtualCursor.clone();
  }

  // MediaPipe gives x,y in [0,1] normalized image coords (mirrored)
  // Convert to NDC: [-1, 1]
  const nx = -(landmark.x * 2 - 1); // mirror X for natural control
  const ny = -(landmark.y * 2 - 1); // flip Y

  screenCoord.set(nx, ny);

  // Unproject from camera through interaction plane
  raycaster.setFromCamera(screenCoord, camera);

  // Place on a virtual plane at fixed distance in front of the camera.
  // planeNormal is the camera's forward direction (into the scene).
  // We use +interactionPlaneDistance to position the plane ahead of the camera.
  const planeNormal = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const planePoint = camera.position.clone().add(
    planeNormal.clone().multiplyScalar(interactionPlaneDistance)
  );
  const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
    planeNormal, planePoint
  );

  const intersectPoint = new THREE.Vector3();
  const hit = raycaster.ray.intersectPlane(plane, intersectPoint);
  if (!hit) return virtualCursor.clone();

  // Apply depth from hand z-coordinate (closer hand = closer cursor).
  // Clamp to [-1.0, 0.8] to prevent the cursor from going behind the camera
  // or too far outside the visible scene.
  const rawDepth = Number.isFinite(landmark.z) ? landmark.z * 5 : 0;
  const depthOffset = Math.max(-1.0, Math.min(0.8, rawDepth));
  intersectPoint.add(planeNormal.clone().multiplyScalar(depthOffset));

  if (
    !Number.isFinite(intersectPoint.x) ||
    !Number.isFinite(intersectPoint.y) ||
    !Number.isFinite(intersectPoint.z)
  ) {
    return virtualCursor.clone();
  }

  // Smooth the cursor
  const smoothed = smoothValue3D(smoothedCursor, {
    x: intersectPoint.x,
    y: intersectPoint.y,
    z: intersectPoint.z,
  }, 0.6);
  smoothedCursor.x = smoothed.x;
  smoothedCursor.y = smoothed.y;
  smoothedCursor.z = smoothed.z;

  virtualCursor.set(smoothed.x, smoothed.y, smoothed.z);
  return virtualCursor.clone();
}

export function getVirtualCursor() {
  return virtualCursor.clone();
}
