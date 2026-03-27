/**
 * Fun Zone — Immersive Sci-Fi "Drone Nebula" experience.
 *
 * When activated:
 *   - Scene transitions to a procedural starfield with nebula particles
 *   - Drone parts become force-directed 3D knowledge-graph nodes in zero-G
 *   - Connections show wiring and thrust relationships
 *   - Parts "evolve" with color shifts + particle trails
 *   - Voice narration provides cinematic sci-fi story
 *   - Seamless enter/exit transitions
 */

import * as THREE from 'three';
import { speak } from '../input/voiceAssistant.js';

let funZoneActive = false;
let funZoneGroup = null;
let stars = null;
let nebula = null;
let connectionLines = null;
let particleSystem = null;
let glowOrbs = [];
let transitionProgress = 0;
let savedSceneState = null;

const NODE_CONNECTIONS = [
  ['frame', 'motor1'], ['frame', 'motor2'], ['frame', 'motor3'], ['frame', 'motor4'],
  ['motor1', 'prop1'], ['motor2', 'prop2'], ['motor3', 'prop3'], ['motor4', 'prop4'],
  ['frame', 'battery'], ['frame', 'flightController'], ['frame', 'camera'],
  ['flightController', 'motor1'], ['flightController', 'motor2'],
  ['flightController', 'motor3'], ['flightController', 'motor4'],
  ['battery', 'flightController'],
  ['battery', 'esc'], ['esc', 'motor1'], ['esc', 'motor2'], ['esc', 'motor3'], ['esc', 'motor4'],
  ['flightController', 'esc'],
  ['flightController', 'gps'],
  ['vtx', 'antenna'], ['vtx', 'camera'], ['frame', 'vtx'], ['frame', 'gps'],
];

const NARRATION_LINES = [
  "Your drone is now exploring the Drone Nebula...",
  "Parts are evolving into quantum prototypes...",
  "Each connection pulses with energy from distant stars...",
  "The knowledge graph reveals hidden relationships between components...",
];

/**
 * Enter Fun Zone — transforms the scene into a sci-fi nebula.
 */
export function enterFunZone(scene, parts, camera) {
  if (funZoneActive) return;
  funZoneActive = true;

  // Save current scene state for restoration
  savedSceneState = {
    fogColor: scene.fog ? scene.fog.color.getHex() : 0x334466,
    fogDensity: scene.fog ? scene.fog.density : 0.008,
    background: scene.background,
  };

  funZoneGroup = new THREE.Group();
  funZoneGroup.name = 'funZone';
  scene.add(funZoneGroup);

  // Darken the scene
  if (scene.fog) {
    scene.fog.color.setHex(0x000011);
    scene.fog.density = 0.002;
  }

  // Create starfield
  _createStarfield();

  // Create nebula particles
  _createNebula();

  // Create glowing connection lines
  _createConnectionLines(parts);

  // Create glowing orbs around parts
  _createGlowOrbs(parts);

  // Create particle trails
  _createParticleTrails();

  // Begin narration
  _narrate(0);

  // Float parts into zero-G orbital positions
  _arrangePartsInOrbit(parts);
}

/**
 * Exit Fun Zone — restore normal scene.
 */
export function exitFunZone(scene) {
  if (!funZoneActive) return;
  funZoneActive = false;

  // Restore fog
  if (scene.fog && savedSceneState) {
    scene.fog.color.setHex(savedSceneState.fogColor);
    scene.fog.density = savedSceneState.fogDensity;
  }

  // Dispose and remove funZoneGroup
  if (funZoneGroup) {
    funZoneGroup.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
    scene.remove(funZoneGroup);
    funZoneGroup = null;
  }

  stars = null;
  nebula = null;
  connectionLines = null;
  particleSystem = null;
  glowOrbs = [];
  transitionProgress = 0;
  savedSceneState = null;

  speak("Welcome back to the workbench.");
}

/**
 * Update Fun Zone each frame.
 */
export function updateFunZone(dt, parts, time) {
  if (!funZoneActive || !funZoneGroup) return;

  transitionProgress = Math.min(transitionProgress + dt * 0.5, 1.0);

  // Rotate starfield slowly
  if (stars) {
    stars.rotation.y += dt * 0.01;
    stars.rotation.x += dt * 0.003;
  }

  // Animate nebula
  if (nebula) {
    nebula.rotation.y += dt * 0.005;
    const positions = nebula.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      positions.setY(i, y + Math.sin(time * 0.5 + i * 0.1) * dt * 0.05);
    }
    positions.needsUpdate = true;
  }

  // Animate connection lines
  if (connectionLines) {
    connectionLines.children.forEach((line, i) => {
      if (line.material) {
        const pulse = Math.sin(time * 2 + i * 0.8) * 0.5 + 0.5;
        line.material.opacity = 0.3 + pulse * 0.5;
      }
    });
  }

  // Animate glow orbs
  glowOrbs.forEach((orb, i) => {
    if (orb.part && orb.part.rigidBody) {
      const pos = orb.part.rigidBody.translation();
      orb.mesh.position.set(pos.x, pos.y, pos.z);
    }
    const scale = 0.5 + Math.sin(time * 1.5 + i * 1.2) * 0.15;
    orb.mesh.scale.setScalar(scale);

    // Color evolution based on time
    const hue = (time * 0.02 + i * 0.1) % 1;
    orb.mesh.material.color.setHSL(hue, 0.7, 0.6);
    orb.mesh.material.emissive.setHSL(hue, 0.8, 0.3);
  });

  // Animate particle trails
  if (particleSystem) {
    const positions = particleSystem.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      let y = positions.getY(i);
      let x = positions.getX(i);
      let z = positions.getZ(i);

      // Gentle orbital drift
      const angle = time * 0.1 + i * 0.01;
      const radius = Math.sqrt(x * x + z * z);
      x += Math.cos(angle) * dt * 0.3;
      z += Math.sin(angle) * dt * 0.3;
      y += Math.sin(time + i * 0.05) * dt * 0.1;

      // Wrap around
      if (Math.abs(x) > 15) x *= -0.5;
      if (Math.abs(y) > 10) y *= -0.5;
      if (Math.abs(z) > 15) z *= -0.5;

      positions.setXYZ(i, x, y, z);
    }
    positions.needsUpdate = true;
  }

  // Update connection lines to follow parts
  if (connectionLines && parts) {
    _updateConnectionLines(parts, time);
  }
}

export function isFunZoneActive() {
  return funZoneActive;
}

// ─── Internal ────────────────────────────────────────────────────────────────

function _createStarfield() {
  const starCount = 3000;
  const positions = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);
  const colors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    const radius = 80 + Math.random() * 200;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);

    sizes[i] = 0.5 + Math.random() * 2.0;

    // Star colors: mostly white/blue with occasional warm stars
    const colorChance = Math.random();
    if (colorChance > 0.9) {
      colors[i3] = 1; colors[i3 + 1] = 0.8; colors[i3 + 2] = 0.6; // warm
    } else if (colorChance > 0.7) {
      colors[i3] = 0.6; colors[i3 + 1] = 0.8; colors[i3 + 2] = 1.0; // blue
    } else {
      colors[i3] = 0.9; colors[i3 + 1] = 0.95; colors[i3 + 2] = 1.0; // white
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    depthWrite: false,
  });

  stars = new THREE.Points(geometry, material);
  funZoneGroup.add(stars);
}

function _createNebula() {
  const count = 500;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 30;
    positions[i3 + 1] = (Math.random() - 0.5) * 20;
    positions[i3 + 2] = (Math.random() - 0.5) * 30;

    // Nebula colors: cyan, purple, magenta
    const hue = 0.5 + Math.random() * 0.3; // cyan-to-purple range
    const c = new THREE.Color().setHSL(hue, 0.8, 0.5);
    colors[i3] = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 1.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.25,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  nebula = new THREE.Points(geometry, material);
  funZoneGroup.add(nebula);
}

function _createConnectionLines(parts) {
  connectionLines = new THREE.Group();
  funZoneGroup.add(connectionLines);

  for (const [fromId, toId] of NODE_CONNECTIONS) {
    const fromPart = parts.find((p) => p.id === fromId);
    const toPart = parts.find((p) => p.id === toId);
    if (!fromPart || !toPart) continue;

    const material = new THREE.LineBasicMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: 0.5,
      depthTest: false,
    });

    const fromPos = fromPart.rigidBody.translation();
    const toPos = toPart.rigidBody.translation();
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(fromPos.x, fromPos.y, fromPos.z),
      new THREE.Vector3(toPos.x, toPos.y, toPos.z),
    ]);

    const line = new THREE.Line(geometry, material);
    line.userData.fromId = fromId;
    line.userData.toId = toId;
    connectionLines.add(line);
  }
}

function _updateConnectionLines(parts, time) {
  if (!connectionLines) return;

  connectionLines.children.forEach((line) => {
    const fromPart = parts.find((p) => p.id === line.userData.fromId);
    const toPart = parts.find((p) => p.id === line.userData.toId);
    if (!fromPart || !toPart) return;

    const fromPos = fromPart.rigidBody.translation();
    const toPos = toPart.rigidBody.translation();
    const positions = line.geometry.attributes.position;
    positions.setXYZ(0, fromPos.x, fromPos.y, fromPos.z);
    positions.setXYZ(1, toPos.x, toPos.y, toPos.z);
    positions.needsUpdate = true;

    // Color pulsation
    const hue = (time * 0.05 + Math.random() * 0.01) % 1;
    line.material.color.setHSL(hue, 0.8, 0.6);
  });
}

function _createGlowOrbs(parts) {
  for (const part of parts) {
    const geo = new THREE.SphereGeometry(0.3, 16, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x004466,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.35,
      side: THREE.FrontSide,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geo, mat);
    const pos = part.rigidBody.translation();
    mesh.position.set(pos.x, pos.y, pos.z);
    funZoneGroup.add(mesh);
    glowOrbs.push({ mesh, part });
  }
}

function _createParticleTrails() {
  const count = 200;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 20;
    positions[i3 + 1] = (Math.random() - 0.5) * 15;
    positions[i3 + 2] = (Math.random() - 0.5) * 20;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xff44ff,
    size: 0.15,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  particleSystem = new THREE.Points(geometry, material);
  funZoneGroup.add(particleSystem);
}

function _arrangePartsInOrbit(parts) {
  // Position parts in a 3D orbital pattern
  const radius = 4;
  parts.forEach((part, i) => {
    const angle = (i / parts.length) * Math.PI * 2;
    const y = Math.sin(angle * 0.5) * 2 + 3;
    const targetX = Math.cos(angle) * radius;
    const targetZ = Math.sin(angle) * radius;

    // Gently push parts toward orbital positions
    part.rigidBody.setBodyType(2, true); // Kinematic
    part.rigidBody.setTranslation({ x: targetX, y, z: targetZ }, true);
  });
}

function _narrate(index) {
  if (!funZoneActive || index >= NARRATION_LINES.length) return;
  speak(NARRATION_LINES[index]);
  setTimeout(() => _narrate(index + 1), 6000);
}
