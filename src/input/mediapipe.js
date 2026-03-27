import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

let handLandmarker = null;
let lastResults = null;
let videoElement = null;
let running = false;

export async function initMediaPipe(video) {
  videoElement = video;

  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );

  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numHands: 1,
    minHandDetectionConfidence: 0.7,
    minHandPresenceConfidence: 0.6,
    minTrackingConfidence: 0.6,
  });

  running = true;
  return handLandmarker;
}

export function detectHands(timestamp) {
  if (!handLandmarker || !videoElement || !running) return null;
  if (videoElement.readyState < 2) return lastResults;

  try {
    lastResults = handLandmarker.detectForVideo(videoElement, timestamp);
  } catch (e) {
    // Occasionally frame timing can cause issues; skip frame
  }
  return lastResults;
}

export function getLastResults() {
  return lastResults;
}

export function stopMediaPipe() {
  running = false;
}
