import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let camera;
let controls;

export function initCamera(canvas) {
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(3, 4, 8);

  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 1, 0);
  controls.minDistance = 2;
  controls.maxDistance = 30;
  controls.maxPolarAngle = Math.PI * 0.88;
  controls.enablePan = true;
  controls.panSpeed = 0.6;
  controls.rotateSpeed = 0.7;
  controls.zoomSpeed = 1.0;
  controls.update();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  return camera;
}

export function getCamera() {
  return camera;
}

export function getControls() {
  return controls;
}

export function updateCamera(dt, droneCenter) {
  if (!controls) return;

  if (droneCenter) {
    controls.target.lerp(droneCenter, 0.02);
  }

  controls.update();
}

export function orbitCamera(deltaX, deltaY = 0) {
  if (!controls || !camera) return;
  const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
  const spherical = new THREE.Spherical().setFromVector3(offset);

  spherical.theta -= deltaX;
  spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - deltaY));

  offset.setFromSpherical(spherical);
  camera.position.copy(controls.target).add(offset);
  controls.update();
}
