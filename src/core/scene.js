import * as THREE from 'three';

let scene;

export function initScene() {
  scene = new THREE.Scene();

  // Procedural gradient sky
  const skyGeo = new THREE.SphereGeometry(500, 32, 15);
  const skyMat = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(0x88aaff) },
      bottomColor: { value: new THREE.Color(0x112233) },
      offset: { value: 20 },
      exponent: { value: 0.4 },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);

  // Fog
  scene.fog = new THREE.FogExp2(0x334466, 0.008);

  // Ground plane
  const groundGeo = new THREE.PlaneGeometry(100, 100);
  const groundMat = new THREE.MeshPhongMaterial({
    color: 0x334455,
    shininess: 10,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid helper for visual reference
  const grid = new THREE.GridHelper(40, 40, 0x445566, 0x223344);
  grid.position.y = -1.99;
  scene.add(grid);

  return scene;
}

export function getScene() {
  return scene;
}
