import * as THREE from 'three';

/**
 * Creates a procedural skybox sphere with gradient shader.
 * Can be used as an alternative to the scene.js sky or as a separate skybox layer.
 */
export function createSkybox(scene) {
  const skyGeo = new THREE.SphereGeometry(500, 32, 15);
  const skyMat = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(0x88aaff) },
      horizonColor: { value: new THREE.Color(0x334466) },
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
      uniform vec3 horizonColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        vec3 color = mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0));
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
  });

  const sky = new THREE.Mesh(skyGeo, skyMat);
  sky.name = 'skybox';
  scene.add(sky);
  return sky;
}
