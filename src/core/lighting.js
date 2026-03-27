import * as THREE from 'three';

export function initLighting(scene) {
  // Hemisphere light for ambient sky/ground bounce
  const hemiLight = new THREE.HemisphereLight(0x99bbff, 0x443322, 0.8);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  // Main directional light (soft key light)
  const dirLight = new THREE.DirectionalLight(0xfff0dd, 1.6);
  dirLight.position.set(5, 12, 7);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 50;
  dirLight.shadow.camera.left = -15;
  dirLight.shadow.camera.right = 15;
  dirLight.shadow.camera.top = 15;
  dirLight.shadow.camera.bottom = -15;
  dirLight.shadow.bias = -0.001;
  dirLight.shadow.normalBias = 0.02;
  scene.add(dirLight);

  // Back fill light (cool tone for depth)
  const fillLight = new THREE.DirectionalLight(0x6688cc, 0.5);
  fillLight.position.set(-4, 6, -5);
  scene.add(fillLight);

  // Ambient fill
  const ambientLight = new THREE.AmbientLight(0x303850, 0.6);
  scene.add(ambientLight);

  // Subtle cyan point light near drone assembly area
  const pointLight = new THREE.PointLight(0x00ccff, 0.6, 20);
  pointLight.position.set(0, 4, 0);
  scene.add(pointLight);

  // Warm accent from below for dramatic effect
  const warmPoint = new THREE.PointLight(0xff8844, 0.3, 15);
  warmPoint.position.set(2, 0, 2);
  scene.add(warmPoint);

  return { hemiLight, dirLight, fillLight, ambientLight, pointLight, warmPoint };
}
