import * as THREE from 'three';

// Core
import { initRenderer } from './core/renderer.js';
import { initScene } from './core/scene.js';
import { initCamera, updateCamera, orbitCamera } from './core/camera.js';
import { initLighting } from './core/lighting.js';

// Physics
import { initPhysicsWorld, stepPhysics } from './physics/world.js';

// Input
import { initMediaPipe, detectHands } from './input/mediapipe.js';
import { detectGesture } from './input/gestures.js';
import { handTo3DPosition } from './input/handTo3D.js';
import { smoothLandmarks } from './utils/smoothing.js';

// Drone
import {
  initDroneParts,
  getDroneParts,
  syncMeshesToBodies,
  getDroneCenter,
  isAssembled,
} from './drone/assembly.js';
import { assembleStep, disassembleStep } from './drone/snapping.js';
import { startFlight, stopFlight, isFlying, updateFlight, updatePropellers } from './drone/flight.js';

// UI
import { updateHUD } from './ui/hud.js';
import { createLabels, updateLabels, setLabelsVisible } from './ui/labels.js';
import { createOverlays, updateOverlays, toggleOverlays } from './ui/overlays.js';

// ========== STATE ==========
let renderer, scene, camera;
let mediaPipeReady = false;
let currentGesture = 'NONE';
let appState = 'IDLE'; // IDLE, ASSEMBLING, ASSEMBLED, FLYING, DISASSEMBLING
let prevSmoothedLandmarks = null;

// Drag state
let draggedPart = null;
let isDragging = false;

// Audio
let audioCtx = null;
let motorOsc = null;
let motorGain = null;

// Cursor visualization
let cursorSphere = null;

// Fixed timestep
const FIXED_DT = 1 / 60;
let accumulator = 0;
let lastTime = 0;

// ========== AUDIO SETUP ==========
function initAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // Motor hum oscillator (started when flying)
  motorOsc = audioCtx.createOscillator();
  motorOsc.type = 'sawtooth';
  motorOsc.frequency.value = 80;
  motorGain = audioCtx.createGain();
  motorGain.gain.value = 0;
  motorOsc.connect(motorGain);
  motorGain.connect(audioCtx.destination);
  motorOsc.start();
}

function playSnapSound() {
  if (!audioCtx) return;
  const bufferSize = audioCtx.sampleRate * 0.05;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
  }
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  const highPass = audioCtx.createBiquadFilter();
  highPass.type = 'highpass';
  highPass.frequency.value = 2000;

  const gain = audioCtx.createGain();
  gain.gain.value = 0.3;

  source.connect(highPass);
  highPass.connect(gain);
  gain.connect(audioCtx.destination);
  source.start();
}

function playWhooshSound() {
  if (!audioCtx) return;
  const bufferSize = audioCtx.sampleRate * 0.15;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
  }
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  const lowPass = audioCtx.createBiquadFilter();
  lowPass.type = 'lowpass';
  lowPass.frequency.value = 800;

  const gain = audioCtx.createGain();
  gain.gain.value = 0.2;

  source.connect(lowPass);
  lowPass.connect(gain);
  gain.connect(audioCtx.destination);
  source.start();
}

function updateMotorAudio(flying) {
  if (!motorGain) return;
  const target = flying ? 0.08 : 0;
  motorGain.gain.value += (target - motorGain.gain.value) * 0.1;
  if (motorOsc && flying) {
    motorOsc.frequency.value = 80 + Math.sin(performance.now() * 0.003) * 40;
  }
}

// ========== INIT ==========
async function init() {
  const loadingEl = document.getElementById('loading-text');
  const cameraOverlay = document.getElementById('camera-overlay');
  const allowBtn = document.getElementById('allow-camera-btn');

  // Init Three.js
  const canvas = document.getElementById('three-canvas');
  renderer = initRenderer(canvas);
  scene = initScene();
  camera = initCamera();
  initLighting(scene);

  // Init physics
  loadingEl.textContent = 'Initializing physics engine…';
  const world = await initPhysicsWorld();

  // Init drone parts
  loadingEl.textContent = 'Building drone components…';
  const parts = initDroneParts(scene, world);

  // Create labels & overlays
  createLabels(parts, scene);
  createOverlays(parts, scene);

  // Create virtual cursor (visible sphere)
  const cursorGeo = new THREE.SphereGeometry(0.08, 12, 12);
  const cursorMat = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.6,
  });
  cursorSphere = new THREE.Mesh(cursorGeo, cursorMat);
  cursorSphere.visible = false;
  scene.add(cursorSphere);

  // Hide loading
  loadingEl.classList.add('hidden');

  // Camera permission flow
  allowBtn.addEventListener('click', async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      const video = document.getElementById('webcam-video');
      video.srcObject = stream;
      await video.play();

      document.getElementById('webcam-container').style.display = 'block';
      cameraOverlay.classList.add('hidden');

      // Init audio on user interaction
      initAudio();

      // Init MediaPipe
      await initMediaPipe(video);
      mediaPipeReady = true;
    } catch (err) {
      console.error('Camera access denied:', err);
      allowBtn.textContent = 'Camera Denied — Retry';
      allowBtn.style.background = 'linear-gradient(135deg, #ff4444, #cc0000)';
    }
  });

  // Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === 'o' || e.key === 'O') toggleOverlays();
    if (e.key === 'l' || e.key === 'L') setLabelsVisible(true);
    if (e.key === 'f' || e.key === 'F') {
      if (isAssembled() && !isFlying()) startFlight();
      else if (isFlying()) stopFlight();
    }
  });

  // Start loop
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

// ========== GAME LOOP ==========
function gameLoop(timestamp) {
  requestAnimationFrame(gameLoop);

  const now = timestamp;
  let frameTime = (now - lastTime) / 1000;
  lastTime = now;

  // Clamp large spikes
  if (frameTime > 0.1) frameTime = 0.1;

  // ---- INPUT: Hand detection ----
  let gestureData = { gesture: 'NONE' };
  if (mediaPipeReady) {
    const results = detectHands(now);
    if (results && results.landmarks && results.landmarks.length > 0) {
      const rawLandmarks = results.landmarks[0];
      const worldLandmarks = results.worldLandmarks
        ? results.worldLandmarks[0]
        : rawLandmarks;

      // Smooth landmarks
      const smoothed = smoothLandmarks(prevSmoothedLandmarks, worldLandmarks, 0.6);
      prevSmoothedLandmarks = smoothed;

      gestureData = detectGesture(rawLandmarks, smoothed);

      // Update 3D cursor
      const palmLandmark = rawLandmarks[9]; // Middle finger MCP as palm center
      const cursorPos = handTo3DPosition(palmLandmark, camera);
      cursorSphere.position.copy(cursorPos);
      cursorSphere.visible = true;
    } else {
      cursorSphere.visible = false;
      prevSmoothedLandmarks = null;
    }
  }

  currentGesture = gestureData.gesture;

  // ---- STATE MACHINE ----
  handleGestureState(gestureData, frameTime);

  // ---- PHYSICS (fixed timestep) ----
  accumulator += frameTime;
  let steps = 0;
  while (accumulator >= FIXED_DT && steps < 3) {
    stepPhysics();
    accumulator -= FIXED_DT;
    steps++;
  }

  // ---- FLIGHT ----
  if (isFlying()) {
    updateFlight(frameTime);
  } else if (isAssembled()) {
    updatePropellers(frameTime, false);
  }

  // ---- SYNC ----
  syncMeshesToBodies();

  // ---- AUDIO ----
  updateMotorAudio(isFlying());

  // ---- UI ----
  updateLabels(getDroneParts());
  updateOverlays(getDroneParts(), scene);
  updateCamera(frameTime, getDroneCenter());
  updateHUD(frameTime, currentGesture, appState);

  // ---- RENDER ----
  renderer.render(scene, camera);
}

// ========== GESTURE STATE MACHINE ==========
let lastGesture = 'NONE';
let gestureHoldTime = 0;
const GESTURE_HOLD_THRESHOLD = 0.15; // 150ms debounce

function handleGestureState(gestureData, dt) {
  const gesture = gestureData.gesture;

  // Debounce: require gesture to be held briefly
  if (gesture === lastGesture) {
    gestureHoldTime += dt;
  } else {
    gestureHoldTime = 0;
    lastGesture = gesture;
    return; // Wait for hold
  }

  if (gestureHoldTime < GESTURE_HOLD_THRESHOLD) return;

  const parts = getDroneParts();

  switch (gesture) {
    case 'CLOSED_FIST':
      if (!isAssembled() && !isFlying()) {
        appState = 'ASSEMBLING';
        assembleStep();
        if (isAssembled()) {
          appState = 'ASSEMBLED';
          playSnapSound();
        }
      } else if (isAssembled() && !isFlying()) {
        // Fist while assembled → start flight
        appState = 'FLYING';
        startFlight();
      }
      break;

    case 'OPEN_HAND':
      if (isFlying()) {
        stopFlight();
        appState = 'ASSEMBLED';
      } else if (isAssembled()) {
        appState = 'DISASSEMBLING';
        disassembleStep();
        playWhooshSound();
        appState = 'IDLE';
      }
      // Release drag
      if (isDragging) releaseDrag();
      break;

    case 'PINCH':
      if (!isAssembled() && !isFlying()) {
        // Pinch-drag: grab nearest part
        const cursorWorld = cursorSphere.position;
        if (!isDragging) {
          // Find nearest part
          let minDist = Infinity;
          let nearest = null;
          for (const part of parts) {
            const pos = part.rigidBody.translation();
            const d =
              (pos.x - cursorWorld.x) ** 2 +
              (pos.y - cursorWorld.y) ** 2 +
              (pos.z - cursorWorld.z) ** 2;
            if (d < minDist) {
              minDist = d;
              nearest = part;
            }
          }
          if (nearest && minDist < 4) {
            // Within 2 units
            draggedPart = nearest;
            isDragging = true;
            draggedPart.rigidBody.setBodyType(2, true); // Kinematic
          }
        }
        if (isDragging && draggedPart) {
          draggedPart.rigidBody.setNextKinematicTranslation(
            { x: cursorWorld.x, y: cursorWorld.y, z: cursorWorld.z },
            true
          );
        }
        appState = isDragging ? 'DRAGGING' : appState;
      }
      break;

    case 'TWO_FINGER_SWIPE':
      if (gestureData.swipeDelta) {
        orbitCamera(gestureData.swipeDelta.x * 0.5);
      }
      break;

    case 'POINTING':
      // Toggle overlays on pointing
      if (gestureHoldTime > 0.5 && gestureHoldTime < 0.6) {
        toggleOverlays();
      }
      break;

    case 'NONE':
      if (isDragging) releaseDrag();
      if (!isAssembled() && !isFlying() && appState !== 'IDLE') {
        appState = 'IDLE';
      }
      break;
  }
}

function releaseDrag() {
  if (draggedPart) {
    draggedPart.rigidBody.setBodyType(0, true); // Dynamic
    draggedPart = null;
  }
  isDragging = false;
}

// ========== START ==========
init().catch((err) => {
  console.error('Initialization failed:', err);
  const loadingEl = document.getElementById('loading-text');
  if (loadingEl) {
    loadingEl.textContent = `Error: ${err.message}`;
    loadingEl.classList.remove('hidden');
  }
});
