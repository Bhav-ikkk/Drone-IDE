import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

let handLandmarker = null;
let lastResults = null;
let videoElement = null;
let running = false;
let lastTimestamp = -1;

async function createHandLandmarker(vision, delegate) {
  return HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
      delegate,
    },
    runningMode: 'VIDEO',
    numHands: 1,
    minHandDetectionConfidence: 0.55,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.45,
  });
}

export async function initMediaPipe(video) {
  videoElement = video;

  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );

  try {
    handLandmarker = await createHandLandmarker(vision, 'GPU');
  } catch (gpuError) {
    console.warn('MediaPipe GPU delegate failed, falling back to CPU:', gpuError);
    handLandmarker = await createHandLandmarker(vision, 'CPU');
  }

  running = true;
  return handLandmarker;
}

export function detectHands(timestamp) {
  if (!handLandmarker || !videoElement || !running) return null;
  if (videoElement.readyState < 2) return lastResults;

  // Ensure strictly increasing timestamps (required by MediaPipe, can repeat on mobile)
  const ts = timestamp > lastTimestamp ? timestamp : lastTimestamp + 1;
  lastTimestamp = ts;

  try {
    lastResults = handLandmarker.detectForVideo(videoElement, ts);
  } catch (e) {
    // Occasionally frame timing can cause issues; skip frame
    return lastResults;
  }
  return lastResults;
}

export function getLastResults() {
  return lastResults;
}

export function stopMediaPipe() {
  running = false;
}
