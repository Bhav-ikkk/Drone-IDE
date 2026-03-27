/**
 * Exponential smoothing + low-pass filter for hand landmark data.
 */

/**
 * Smooth a single scalar value.
 * @param {number} prev - previous smoothed value
 * @param {number} current - new raw value
 * @param {number} alpha - smoothing factor (0-1, higher = more responsive)
 * @returns {number}
 */
export function smoothValue(prev, current, alpha = 0.6) {
  return prev + alpha * (current - prev);
}

/**
 * Smooth a 3D point.
 * @param {{ x: number, y: number, z: number }} prev
 * @param {{ x: number, y: number, z: number }} current
 * @param {number} alpha
 * @returns {{ x: number, y: number, z: number }}
 */
export function smoothValue3D(prev, current, alpha = 0.6) {
  return {
    x: smoothValue(prev.x, current.x, alpha),
    y: smoothValue(prev.y, current.y, alpha),
    z: smoothValue(prev.z, current.z, alpha),
  };
}

/**
 * Smooth an entire array of landmarks.
 */
export function smoothLandmarks(prevLandmarks, newLandmarks, alpha = 0.6) {
  if (!prevLandmarks || prevLandmarks.length !== newLandmarks.length) {
    return newLandmarks.map((lm) => ({ ...lm }));
  }
  return newLandmarks.map((lm, i) => smoothValue3D(prevLandmarks[i], lm, alpha));
}
