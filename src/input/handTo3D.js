import * as THREE from 'three';
import { smoothValue3D } from '../utils/smoothing.js';

const interactionPlaneDistance = 6;
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

  // MediaPipe gives x,y in [0,1] normalized image coords (mirrored)
  // Convert to NDC: [-1, 1]
  const nx = -(landmark.x * 2 - 1); // mirror X for natural control
  const ny = -(landmark.y * 2 - 1); // flip Y

  screenCoord.set(nx, ny);

  // Unproject from camera through interaction plane
  raycaster.setFromCamera(screenCoord, camera);

  // Place on a virtual plane at fixed distance from camera
  const planeNormal = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const planePoint = camera.position.clone().add(
    planeNormal.clone().multiplyScalar(-interactionPlaneDistance)
  );
  const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
    planeNormal, planePoint
  );

  const intersectPoint = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, intersectPoint);

  if (!intersectPoint) return virtualCursor.clone();

  // Apply depth from hand z-coordinate (closer hand = deeper into scene)
  const depthOffset = (landmark.z || 0) * 5;
  intersectPoint.add(planeNormal.clone().multiplyScalar(depthOffset));

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
