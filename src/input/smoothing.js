/**
 * Advanced landmark smoothing with Exponential Moving Average (α=0.68)
 * and 1-Euro filter (cutoff=0.8, beta=0.001) for jitter-free hand tracking.
 */

// ========== 1-Euro Filter ==========

class OneEuroFilter {
  constructor(cutoff = 0.8, beta = 0.001, dCutoff = 1.0) {
    this.minCutoff = cutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.xPrev = null;
    this.dxPrev = 0;
    this.tPrev = null;
  }

  _alpha(cutoff, dt) {
    const tau = 1.0 / (2 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / dt);
  }

  filter(x, t) {
    if (this.tPrev === null) {
      this.xPrev = x;
      this.tPrev = t;
      return x;
    }

    const dt = Math.max(t - this.tPrev, 0.001);
    this.tPrev = t;

    // Derivative of signal
    const dx = (x - this.xPrev) / dt;
    const alphaDx = this._alpha(this.dCutoff, dt);
    const dxSmoothed = alphaDx * dx + (1 - alphaDx) * this.dxPrev;
    this.dxPrev = dxSmoothed;

    // Adaptive cutoff based on signal speed
    const cutoff = this.minCutoff + this.beta * Math.abs(dxSmoothed);
    const alphaX = this._alpha(cutoff, dt);

    const xSmoothed = alphaX * x + (1 - alphaX) * this.xPrev;
    this.xPrev = xSmoothed;

    return xSmoothed;
  }

  reset() {
    this.xPrev = null;
    this.dxPrev = 0;
    this.tPrev = null;
  }
}

// One filter per landmark coordinate (21 landmarks × 3 axes)
const filters = [];

function getFilter(landmarkIdx, axis) {
  const key = landmarkIdx * 3 + axis;
  if (!filters[key]) {
    filters[key] = new OneEuroFilter(0.8, 0.001, 1.0);
  }
  return filters[key];
}

// ========== EMA + 1-Euro Combined Smoothing ==========

const EMA_ALPHA = 0.68;

/**
 * Smooth a single scalar value using EMA.
 */
export function smoothValue(prev, current, alpha = EMA_ALPHA) {
  return prev + alpha * (current - prev);
}

/**
 * Smooth a 3D point using EMA.
 */
export function smoothValue3D(prev, current, alpha = EMA_ALPHA) {
  return {
    x: smoothValue(prev.x, current.x, alpha),
    y: smoothValue(prev.y, current.y, alpha),
    z: smoothValue(prev.z, current.z, alpha),
  };
}

/**
 * Smooth an entire array of landmarks using combined EMA + 1-Euro filter.
 * The 1-Euro filter handles jitter while allowing fast movements through.
 * @param {Array} prevLandmarks - Previous smoothed landmarks
 * @param {Array} newLandmarks - New raw landmarks
 * @param {number} timestamp - Current timestamp in seconds
 * @returns {Array} Smoothed landmarks
 */
export function smoothLandmarks(prevLandmarks, newLandmarks, timestamp) {
  if (!newLandmarks || newLandmarks.length < 21) return newLandmarks;

  const t = timestamp || performance.now() / 1000;

  return newLandmarks.map((lm, i) => {
    // Apply 1-Euro filter first for jitter reduction
    const fx = getFilter(i, 0).filter(lm.x, t);
    const fy = getFilter(i, 1).filter(lm.y, t);
    const fz = getFilter(i, 2).filter(lm.z || 0, t);

    // Then EMA on top for extra smoothness
    if (prevLandmarks && prevLandmarks[i]) {
      return {
        x: smoothValue(prevLandmarks[i].x, fx, EMA_ALPHA),
        y: smoothValue(prevLandmarks[i].y, fy, EMA_ALPHA),
        z: smoothValue(prevLandmarks[i].z || 0, fz, EMA_ALPHA),
      };
    }
    return { x: fx, y: fy, z: fz };
  });
}

/**
 * Reset all filters (call when hand tracking is lost).
 */
export function resetFilters() {
  for (const f of filters) {
    if (f) f.reset();
  }
}
