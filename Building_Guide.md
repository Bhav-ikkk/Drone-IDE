Here is your GOD-LEVEL enhanced prompt — copy-paste this entire block directly into Claude (or any top-tier model). It is now hyper-detailed, zero-ambiguity, self-contained, and engineered so Claude can output a complete, production-ready, fully working codebase in a single response with zero follow-up questions.

You are a senior full-stack engineer, 3D graphics specialist, interaction designer, and real-time systems expert with 10+ years building production WebGL/Three.js applications, MediaPipe integrations, and physics-driven experiences.
Your task is to build a complete, production-ready, single-file-deployable web application that implements a fully functional gesture-controlled 3D Drone Assembly & Presentation IDE. This is NOT a prototype — it must be clean, performant, maintainable, and feel like a futuristic holographic workbench that runs buttery-smooth (55–60 FPS locked) on a standard 16 GB laptop with integrated graphics.
CORE PRODUCT GOAL
A browser-based 3D environment where the user controls a modular quadcopter drone exclusively with hand gestures via webcam. Close fist → parts magnetically snap together with spring physics → drone assembles → motors spin → autonomous flight. Open palm → parts explode outward with realistic air friction and damping into an organized exploded-view. Pinch-drag to grab, rotate, and snap parts. All interactions feel frictionless with sub-30 ms perceived latency.
STRICT STACK (NO EXCEPTIONS)

Rendering: Three.js r168+ (latest stable)
Hand Tracking: @mediapipe/tasks-visionHandLandmarker ONLY (model: https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task)
Physics: @dimforge/rapier3d-compat (WASM)
Build Tool: Vite (lightweight, no React, no Next.js, no TypeScript)
Language: Vanilla JavaScript (ES modules)
Audio: Web Audio API (procedural tones — no external sound files)
All models: 100% procedural using Three.js geometries (no external GLB files required — self-contained)

MANDATORY PROJECT STRUCTURE (create every file exactly as shown)
text/src
  /core
    renderer.js
    scene.js
    camera.js
    lighting.js
  /physics
    world.js
    rigidBodies.js
  /input
    mediapipe.js
    gestures.js
    handTo3D.js
  /drone
    partsConfig.js
    assembly.js
    snapping.js
    flight.js
  /ui
    hud.js
    labels.js
    overlays.js
  /utils
    smoothing.js
    math.js
  main.js
/public
  (empty — no assets needed)
/index.html
/vite.config.js
/package.json
DETAILED FEATURE REQUIREMENTS (implement every single one)
1. 3D ENVIRONMENT

Sky: procedural gradient sky + HemisphereLight + subtle fog (color #88aaff → #112233)
Ground: large PlaneGeometry with soft shadow-receiving material
Lighting: one DirectionalLight (soft sunset angle) + AmbientLight
Camera: PerspectiveCamera (FOV 50), third-person follow with smooth lerp + optional two-finger orbit
Must maintain 55–60 FPS locked on 16 GB laptop

2. DRONE SYSTEM — Procedural Modular Quadcopter
Use the exact parts defined in partsConfig.js (you will create this file with these exact definitions):

frame: BoxGeometry (2 × 0.2 × 2) + 4 thin arm boxes, dark carbon color
motor1–4: CylinderGeometry (radius 0.15, height 0.3) + shiny metal
prop1–4: PlaneGeometry (0.8 × 0.08) rotated 45° — spin at high speed when flying
battery: BoxGeometry (0.8 × 0.4 × 1.2)
flightController: BoxGeometry (0.6 × 0.1 × 0.8)
camera: Group with small cylinder + sphere lens

Each part has:

Three.js Mesh + Material (MeshPhongMaterial with realistic PBR-like colors)
Rapier RigidBody (dynamic) + Collider (cuboid/cylinder)
Mass, linearDamping: 0.8, angularDamping: 1.2
Pre-defined snap target position + quaternion relative to frame (0,0,0)

3. GESTURE SYSTEM — CRITICAL & FULLY IMPLEMENTED (use these exact rules)
Use HandLandmarker with numHands: 1, minDetectionConfidence: 0.7.
Gesture Detection Logic (implement in gestures.js — exact formulas):

CLOSED_FIST: All 5 fingers curled → for each finger i (thumb=4, index=8, middle=12, ring=16, pinky=20): distance(tip, PIP joint) < 0.08 AND distance(tip, MCP joint) < 0.12 (world coordinates)
OPEN_HAND (palm): All finger tips are extended → distance(tip, MCP) > 0.15 for all 5 fingers AND palm facing camera (dot product of palm normal > 0.7)
PINCH (thumb + index): distance(landmarks[4], landmarks[8]) < 0.05
POINTING: Index extended (distance(8,5) > 0.15) AND all other fingers curled
TWO_FINGER_SWIPE: Detect motion delta of landmarks[8] and [12] over 3 frames (> 0.08 units in any direction)

Input Smoothing (utils/smoothing.js):
Exponential smoothing (alpha = 0.6) + low-pass filter on every landmark.
Hand → 3D World Mapping (handTo3D.js):

Take normalized image coordinates + z-depth from MediaPipe world landmarks
Use camera.unproject + raycasting to a virtual interaction plane 2 meters in front of camera
Virtual cursor is a 3D point in world space (smoothly lerped)
Depth control via hand z-coordinate (closer = deeper into scene)

4. PHYSICS SYSTEM (Rapier — exact parameters)

Gravity: [0, -9.81, 0]
World timestep: fixed 1/60 s, max 3 substeps
Assembly mode (fist): Apply spring force (stiffness 800, damping 40) to each part toward its snap target
Disassembly mode (open hand): Apply outward impulse (magnitude 8–12) + linearDamping 0.4 for natural scatter
Drag (pinch): Switch selected body to kinematic, directly set position from virtual cursor, then switch back to dynamic on release
Snapping tolerance: 0.25 units position + 15° rotation → create temporary FixedJoint or lock body

5. AUDIO (procedural Web Audio)

Motor hum: low-frequency sawtooth oscillator (80–120 Hz) with gain envelope when flying
Snap click: short high-pass noise burst
Whoosh: low-pass filtered noise on part movement

6. PERFORMANCE RULES (non-negotiable)

Total triangles < 12k
InstancedMesh for all 4 props
Physics update throttled intelligently
No memory leaks — proper cleanup on dispose
requestAnimationFrame + fixed timestep loop

7. EXTRA FEATURES

Toggleable overlays: wiring lines (LineSegments), thrust vector arrows (ArrowsHelper)
Simulation mode: assembled drone follows predefined figure-8 path
On-screen minimal HUD showing current gesture name + FPS

8. SECURITY & UX

Big prominent “Allow Camera” button with privacy note
Graceful fallback if no webcam
Everything 100% client-side — nothing leaves the browser

OUTPUT FORMAT — YOU MUST FOLLOW EXACTLY

ARCHITECTURE EXPLANATION (high-level flow, data flow between modules, why each library + exact decisions)
FULL CODEBASE — every single file with complete, ready-to-run code (no pseudo-code, no placeholders)
SETUP INSTRUCTIONS (npm install, npm run dev, build, Vercel deploy)
PERFORMANCE NOTES (why it hits 60 FPS on 16 GB laptop + mitigation strategies)
FUTURE SCALING PLAN (multi-drone, multiplayer sync, AI part suggestion, etc.)

Think like you are shipping this as a live investor demo tomorrow. Make it beautiful, polished, and magical.
Start building now.