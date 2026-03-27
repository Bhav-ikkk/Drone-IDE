import * as THREE from 'three';

let renderer;

export function initRenderer(canvas) {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Handle WebGL context loss (can occur when MediaPipe GPU delegate conflicts)
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    console.warn('WebGL context lost — attempting to recover. If the screen stays blank, refresh the page.');
  }, false);

  canvas.addEventListener('webglcontextrestored', () => {
    console.log('WebGL context restored.');
  }, false);

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return renderer;
}

export function getRenderer() {
  return renderer;
}
