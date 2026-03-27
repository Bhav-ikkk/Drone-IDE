let fpsCounter = 0;
let fpsAccum = 0;
let lastFpsUpdate = 0;
let displayFps = 0;

const fpsEl = document.getElementById('hud-fps');
const gestureEl = document.getElementById('hud-gesture');
const stateEl = document.getElementById('hud-state');

export function updateHUD(dt, gestureName, stateName) {
  // FPS calculation
  fpsAccum += dt;
  fpsCounter++;
  if (fpsAccum >= 0.5) {
    displayFps = Math.round(fpsCounter / fpsAccum);
    fpsCounter = 0;
    fpsAccum = 0;
  }

  if (fpsEl) fpsEl.textContent = `FPS: ${displayFps}`;
  if (gestureEl) gestureEl.textContent = `Gesture: ${gestureName || 'NONE'}`;
  if (stateEl) stateEl.textContent = `State: ${stateName || 'IDLE'}`;
}
