import * as THREE from 'three';

// Core
import { initRenderer } from './core/renderer.js';
import { initScene } from './core/scene.js';
import { initCamera, updateCamera, orbitCamera, getControls } from './core/camera.js';
import { initLighting } from './core/lighting.js';

// Physics
import { initPhysicsWorld, stepPhysics, getWorld } from './physics/world.js';

// Input
import { initMediaPipe, detectHands } from './input/mediapipe.js';
import { detectGesture } from './input/gestures.js';
import { handTo3DPosition } from './input/handTo3D.js';
import { smoothLandmarks, resetFilters } from './input/smoothing.js';
import { initVoiceAssistant, speak as voiceSpeak } from './input/voiceAssistant.js';

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
import { applyMotorTorque } from './drone/torqueSystem.js';
import { getPartDescription } from './drone/partDescriptions.js';
import { enterFunZone, exitFunZone, updateFunZone, isFunZoneActive } from './drone/funZone.js';

// UI
import { updateHUD } from './ui/hud.js';
import { createLabels, updateLabels, setLabelsVisible } from './ui/labels.js';
import { createOverlays, updateOverlays, toggleOverlays } from './ui/overlays.js';
import { initInfoPanel, showPartInfo, getSelectedPartId, isInfoPanelOpen } from './ui/infoPanel.js';
import { initInventoryUI, toggleInventoryPanel } from './ui/inventoryUI.js';
import { toggleDataFlowOverlay } from './ui/dataFlowOverlay.js';

// Utils
import { initDebug, toggleDebug, updateDebug } from './utils/debug.js';

// Network
import { connect as serverConnect, disconnect as serverDisconnect, isConnected, broadcastDroneState } from './network/serverConnector.js';

// ========== STATE ==========
let renderer, scene, camera;
let mediaPipeReady = false;
let currentGesture = 'NONE';
let appState = 'IDLE'; // IDLE, ASSEMBLING, ASSEMBLED, FLYING, DISASSEMBLING
let prevSmoothedLandmarks = null;

// Voice assistant
let voiceStatus = 'WAITING'; // WAITING | ACTIVE | SPEAKING | UNSUPPORTED

// Drag state
let draggedPart = null;
let isDragging = false;

// Audio
let audioCtx = null;
let motorOsc = null;
let motorGain = null;

// Cursor visualization
let cursorSphere = null;
const mouseNdc = new THREE.Vector2(0, 0);
const pointerRaycaster = new THREE.Raycaster();
let mouseDown = false;
let dragSource = 'NONE'; // NONE | MOUSE | HAND

// Click detection (distinguish drag from click)
let pointerDragged = false;
let pointerDownClientPos = { x: 0, y: 0 };

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
  const skipBtn = document.getElementById('skip-camera-btn');

  // Init Three.js
  const canvas = document.getElementById('three-canvas');
  renderer = initRenderer(canvas);
  scene = initScene();
  camera = initCamera(canvas);
  initLighting(scene);

  // Init debug visualization
  initDebug(scene);

  // Init physics
  loadingEl.textContent = 'Loading physics engine…';
  const world = await initPhysicsWorld();

  // Init drone parts
  loadingEl.textContent = 'Building drone components…';
  const parts = initDroneParts(scene, world);

  // Create labels & overlays
  createLabels(parts, scene);
  createOverlays(parts, scene);

  // Init info panel
  initInfoPanel(() => {
    const controls = getControls();
    if (controls) controls.enabled = true;
  });

  // Init inventory UI (adds custom parts to scene when user clicks "Add to Scene")
  initInventoryUI(({ mesh, partData }) => {
    if (mesh) {
      mesh.position.set(
        (Math.random() - 0.5) * 3,
        2 + Math.random(),
        (Math.random() - 0.5) * 3
      );
      scene.add(mesh);
    }
  });

  // Collaboration toggle
  const collabBtn = document.getElementById('collab-toggle-btn');
  const collabInput = document.getElementById('collab-room-input');
  if (collabBtn) {
    collabBtn.addEventListener('click', () => {
      if (isConnected()) {
        serverDisconnect();
        collabBtn.textContent = 'Enable Collaboration';
      } else {
        const room = collabInput ? collabInput.value.trim() : '';
        serverConnect(room, null, (msg) => {
          console.log('[Collaboration] Received:', msg);
        });
        collabBtn.textContent = 'Disconnect';
      }
    });
  }

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
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const videoConstraints = isMobile
        ? { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 360 } }
        : { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } };
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
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
      allowBtn.textContent = 'Camera Enabled';

      // Start voice assistant now that the user has interacted with the page
      // (required by browser autoplay / speech policies).
      _initVoice();
    } catch (err) {
      console.error('Camera unavailable, continuing with mouse controls:', err);
      mediaPipeReady = false;
      cameraOverlay.classList.add('hidden');
      initAudio();
      allowBtn.textContent = 'Using Mouse Controls';
      allowBtn.style.background = 'linear-gradient(135deg, #ff4444, #cc0000)';
      _initVoice();
    }
  });

  skipBtn.addEventListener('click', () => {
    mediaPipeReady = false;
    cameraOverlay.classList.add('hidden');
    initAudio();
    _initVoice();
  });

  setupMouseControls(canvas);

  // Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    // Skip shortcuts when user is typing in an input field
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return;

    if (e.key === 'o' || e.key === 'O') toggleOverlays();
    if (e.key === 'l' || e.key === 'L') setLabelsVisible(true);
    if (e.key === 'f' || e.key === 'F') {
      if (isAssembled() && !isFlying()) {
        startFlight();
        appState = 'FLYING';
      } else if (isFlying()) {
        stopFlight();
        appState = 'ASSEMBLED';
      }
    }
    if (e.key === 'i' || e.key === 'I') toggleInventoryPanel();
    if (e.key === 'd' || e.key === 'D') toggleDebug();
    if (e.key === 'n' || e.key === 'N') toggleDataFlowOverlay();
    if (e.key === 'g' || e.key === 'G') {
      if (isFunZoneActive()) {
        exitFunZone(scene);
        appState = 'IDLE';
      } else {
        enterFunZone(scene, getDroneParts(), camera);
        appState = 'FUN_ZONE';
      }
    }
  });

  // Start loop
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

// ========== VOICE ASSISTANT ==========
function _initVoice() {
  const indicator = document.getElementById('voice-indicator');
  initVoiceAssistant({
    onStatusChange: (status) => {
      voiceStatus = status;
      if (!indicator) return;
      indicator.dataset.status = status;
      const labels = {
        WAITING: '🎤 Listening…',
        ACTIVE: '🗣️ Active',
        SPEAKING: '💬 Speaking…',
        UNSUPPORTED: '🚫 Voice N/A',
      };
      indicator.textContent = labels[status] || '🎤';
    },
    onCommand: _handleVoiceCommand,
  });
}

function _handleVoiceCommand(command) {
  const controls = getControls();
  switch (command) {
    case 'DESCRIBE': {
      const partId = getSelectedPartId();
      if (!partId) {
        voiceSpeak('No component is selected. Click on a drone part first, then say describe.');
        return;
      }
      const desc = getPartDescription(partId);
      if (!desc) {
        voiceSpeak('Sorry, I could not find a description for that part.');
        return;
      }
      // Speak name + truncated overview so the response stays snappy.
      const overview = desc.overview
        ? desc.overview.replace(/\n/g, ' ').slice(0, 280)
        : '';
      voiceSpeak(`${desc.name}. ${overview}`);
      break;
    }
    case 'ASSEMBLE':
      if (isFlying()) {
        voiceSpeak('The drone is currently flying. Land it first.');
      } else if (isAssembled()) {
        voiceSpeak('The drone is already assembled.');
      } else {
        voiceSpeak('Assembling the drone now.');
        assembleStep(getWorld());
      }
      break;
    case 'FLY':
      if (isFlying()) {
        voiceSpeak('Already flying.');
      } else if (isAssembled()) {
        voiceSpeak('Initiating flight.');
        startFlight();
        appState = 'FLYING';
      } else {
        voiceSpeak('The drone must be assembled before it can take off.');
      }
      break;
    case 'LAND':
      if (!isFlying()) {
        voiceSpeak('The drone is not currently flying.');
      } else {
        voiceSpeak('Landing now.');
        stopFlight();
        appState = 'ASSEMBLED';
      }
      break;
    case 'ZOOM_IN':
      if (controls) {
        const dir = new THREE.Vector3().subVectors(controls.target, camera.position);
        camera.position.addScaledVector(dir, 0.2);
        controls.update();
      }
      break;
    case 'ZOOM_OUT':
      if (controls) {
        const dir = new THREE.Vector3().subVectors(camera.position, controls.target);
        camera.position.addScaledVector(dir, 0.3);
        controls.update();
      }
      break;
    case 'DISASSEMBLE':
      if (isFlying()) {
        voiceSpeak('Land the drone before disassembling.');
      } else if (!isAssembled()) {
        voiceSpeak('The drone is not assembled.');
      } else {
        voiceSpeak('Disassembling.');
        disassembleStep(getWorld());
        playWhooshSound();
        appState = 'IDLE';
      }
      break;
    case 'HOVER':
      if (isFlying()) {
        voiceSpeak('Holding position.');
      } else {
        voiceSpeak('The drone must be flying to hover.');
      }
      break;
    case 'ENTER_FUN_ZONE':
      if (!isFunZoneActive()) {
        enterFunZone(scene, getDroneParts(), camera);
        appState = 'FUN_ZONE';
      } else {
        voiceSpeak('Already in the fun zone.');
      }
      break;
    case 'EXIT_FUN_ZONE':
      if (isFunZoneActive()) {
        exitFunZone(scene);
        appState = 'IDLE';
      } else {
        voiceSpeak('You are not in the fun zone.');
      }
      break;
    default:
      break;
  }
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
    try {
      const results = detectHands(now);
      if (results && results.landmarks && results.landmarks.length > 0) {
        const rawLandmarks = results.landmarks[0];
        const worldLandmarks = results.worldLandmarks
          ? results.worldLandmarks[0]
          : rawLandmarks;

        if (areLandmarksValid(rawLandmarks) && areLandmarksValid(worldLandmarks)) {
          // Smooth landmarks with 1-Euro filter + EMA (timestamp-based)
          const smoothed = smoothLandmarks(prevSmoothedLandmarks, worldLandmarks, now / 1000);
          prevSmoothedLandmarks = smoothed;

          gestureData = detectGesture(rawLandmarks, smoothed);

          // Update 3D cursor
          const palmLandmark = rawLandmarks[9]; // Middle finger MCP as palm center
          const cursorPos = handTo3DPosition(palmLandmark, camera);
          if (isFiniteVector3(cursorPos)) {
            cursorSphere.position.copy(cursorPos);
            cursorSphere.visible = true;
          }
        } else {
          prevSmoothedLandmarks = null;
          resetFilters();
        }
      } else {
        if (!mouseDown) cursorSphere.visible = false;
        prevSmoothedLandmarks = null;
        resetFilters();
      }
    } catch (err) {
      console.error('Hand detection frame skipped:', err);
      gestureData = { gesture: 'NONE' };
      prevSmoothedLandmarks = null;
      resetFilters();
    }
  }

  currentGesture = gestureData.gesture;

  // ---- STATE MACHINE ----
  handleGestureState(gestureData, frameTime);

  // ---- PHYSICS (fixed timestep, max 4 substeps) ----
  accumulator += frameTime;
  let steps = 0;
  while (accumulator >= FIXED_DT && steps < 4) {
    // Apply motor torque each physics step when flying
    applyMotorTorque(isFlying());
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

  // ---- FUN ZONE ----
  updateFunZone(frameTime, getDroneParts(), now / 1000);

  // ---- SYNC ----
  syncMeshesToBodies();

  // ---- NETWORK (optional collaboration broadcast) ----
  if (isConnected()) {
    broadcastDroneState(getDroneParts());
  }

  // ---- AUDIO ----
  updateMotorAudio(isFlying());

  // ---- UI ----
  updateLabels(getDroneParts());
  updateOverlays(getDroneParts(), scene);
  updateCamera(frameTime, getDroneCenter());
  updateHUD(frameTime, currentGesture, appState, mediaPipeReady ? 'GESTURE' : 'MOUSE');
  updateDebug(getDroneParts(), currentGesture, appState, 1 / Math.max(frameTime, 0.001));

  // ---- RENDER ----
  try {
    renderer.render(scene, camera);
  } catch (err) {
    console.warn('Render error (frame skipped):', err);
  }
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
        assembleStep(getWorld());
        if (isAssembled()) {
          appState = 'ASSEMBLED';
          playSnapSound();
          gestureHoldTime = 0;
        }
      } else if (isAssembled() && !isFlying()) {
        // Fist while assembled → start flight
        appState = 'FLYING';
        startFlight();
        gestureHoldTime = 0;
      }
      break;

    case 'OPEN_HAND':
      if (isFlying()) {
        stopFlight();
        appState = 'ASSEMBLED';
        // Reset hold timer so the same gesture can't immediately cascade
        // into disassembly on the very next frame.
        gestureHoldTime = 0;
      } else if (isAssembled()) {
        appState = 'DISASSEMBLING';
        disassembleStep(getWorld());
        playWhooshSound();
        appState = 'IDLE';
        gestureHoldTime = 0;
      }
      // Release drag
      if (isDragging && dragSource === 'HAND') releaseDrag();
      break;

    case 'PINCH':
      if (!isAssembled() && !isFlying()) {
        if (dragSource === 'MOUSE') break;
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
            dragSource = 'HAND';
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
        orbitCamera(gestureData.swipeDelta.x * 3, gestureData.swipeDelta.y * 3);
      }
      break;

    case 'POINTING':
      // Toggle overlays on pointing
      if (gestureHoldTime > 0.5 && gestureHoldTime < 0.6) {
        toggleOverlays();
      }
      break;

    case 'NONE':
      if (isDragging && dragSource === 'HAND') releaseDrag();
      if (!isAssembled() && !isFlying() && appState !== 'IDLE') {
        appState = 'IDLE';
      }
      break;
  }
}

function setupMouseControls(canvas) {
  canvas.addEventListener('pointermove', (e) => {
    // Track drag distance to distinguish click vs drag (compare squared to avoid sqrt)
    const dx = e.clientX - pointerDownClientPos.x;
    const dy = e.clientY - pointerDownClientPos.y;
    if (dx * dx + dy * dy > 25) pointerDragged = true;

    updateMouseNdc(canvas, e);
    if (dragSource !== 'HAND') {
      const cursorPos = getPointerWorldPoint();
      if (cursorPos) {
        cursorSphere.position.copy(cursorPos);
        cursorSphere.visible = true;
      }
    }

    if (dragSource === 'MOUSE' && isDragging && draggedPart) {
      const target = getPointerWorldPoint();
      if (!target) return;
      draggedPart.rigidBody.setNextKinematicTranslation(
        { x: target.x, y: target.y, z: target.z },
        true
      );
      appState = 'DRAGGING';
    }
  });

  canvas.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;

    // Reset click/drag tracking
    pointerDragged = false;
    pointerDownClientPos = { x: e.clientX, y: e.clientY };

    mouseDown = true;
    updateMouseNdc(canvas, e);

    // Don't start drag when assembled or flying
    if (isAssembled() || isFlying()) return;

    const nearest = pickNearestPart();
    if (!nearest) return;

    draggedPart = nearest;
    isDragging = true;
    dragSource = 'MOUSE';
    draggedPart.rigidBody.setBodyType(2, true);

    const controls = getControls();
    if (controls) controls.enabled = false;
    appState = 'DRAGGING';
  });

  // Click handler: show info panel for any part click (works in all states)
  canvas.addEventListener('click', (e) => {
    if (pointerDragged) return; // Was a real drag, not a click
    updateMouseNdc(canvas, e);
    const nearest = pickNearestPart();
    if (nearest) {
      showPartInfo(nearest.id);
      const controls = getControls();
      if (controls) controls.enabled = false;
    }
  });

  const endMouseDrag = () => {
    mouseDown = false;
    if (dragSource === 'MOUSE') {
      releaseDrag();
      if (!isAssembled() && !isFlying()) appState = 'IDLE';
    }
  };

  canvas.addEventListener('pointerup', endMouseDrag);
  canvas.addEventListener('pointerleave', endMouseDrag);
  canvas.addEventListener('pointercancel', endMouseDrag);
}

function updateMouseNdc(canvas, e) {
  const rect = canvas.getBoundingClientRect();
  mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

function getPointerWorldPoint() {
  pointerRaycaster.setFromCamera(mouseNdc, camera);
  const planeNormal = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const planePoint = camera.position.clone().add(planeNormal.clone().multiplyScalar(-6));
  const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, planePoint);
  const hit = pointerRaycaster.ray.intersectPlane(plane, new THREE.Vector3());
  return hit && isFiniteVector3(hit) ? hit : null;
}

function pickNearestPart() {
  const parts = getDroneParts();
  if (!parts || parts.length === 0) return null;

  pointerRaycaster.setFromCamera(mouseNdc, camera);
  const meshes = parts.map((p) => p.mesh);
  // Use recursive=true because drone parts are THREE.Group with child Meshes
  const hits = pointerRaycaster.intersectObjects(meshes, true);
  if (!hits.length) return null;

  const hitObject = hits[0].object;
  // Walk up the object hierarchy to find which part group was hit
  return parts.find((p) => {
    let obj = hitObject;
    while (obj) {
      if (obj === p.mesh) return true;
      obj = obj.parent;
    }
    return false;
  }) || null;
}

function areLandmarksValid(landmarks) {
  if (!Array.isArray(landmarks) || landmarks.length < 21) return false;
  for (const lm of landmarks) {
    if (
      !lm ||
      !Number.isFinite(lm.x) ||
      !Number.isFinite(lm.y) ||
      (lm.z != null && !Number.isFinite(lm.z))
    ) {
      return false;
    }
  }
  return true;
}

function isFiniteVector3(vec) {
  return (
    vec &&
    Number.isFinite(vec.x) &&
    Number.isFinite(vec.y) &&
    Number.isFinite(vec.z)
  );
}

function releaseDrag() {
  if (draggedPart) {
    draggedPart.rigidBody.setBodyType(0, true); // Dynamic
    // Zero out velocities so part stays where it was placed
    draggedPart.rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
    draggedPart.rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
    draggedPart = null;
  }
  isDragging = false;
  dragSource = 'NONE';

  const controls = getControls();
  if (controls) controls.enabled = true;
}

// ========== START ==========
init().catch((err) => {
  console.error('Initialization failed:', err);
  const loadingEl = document.getElementById('loading-text');
  if (loadingEl) {
    loadingEl.textContent = `Error: ${err.message}`;
    loadingEl.classList.remove('hidden');
  }
  const errorBanner = document.getElementById('error-banner');
  if (errorBanner) {
    errorBanner.textContent = `Initialization failed: ${err.message}. Please refresh the page.`;
    errorBanner.classList.add('visible');
  }
});
