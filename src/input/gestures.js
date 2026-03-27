/**
 * Gesture detection from hand landmarks.
 * Uses exact distance formulas as specified.
 */

// Landmark indices
const THUMB_TIP = 4, THUMB_IP = 3, THUMB_MCP = 2;
const INDEX_TIP = 8, INDEX_PIP = 6, INDEX_MCP = 5;
const MIDDLE_TIP = 12, MIDDLE_PIP = 10, MIDDLE_MCP = 9;
const RING_TIP = 16, RING_PIP = 14, RING_MCP = 13;
const PINKY_TIP = 20, PINKY_PIP = 18, PINKY_MCP = 17;
const WRIST = 0;

function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z || 0) - (b.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function isValidPoint(p) {
  return p && Number.isFinite(p.x) && Number.isFinite(p.y) && (p.z == null || Number.isFinite(p.z));
}

function isFingerCurled(landmarks, tipIdx, pipIdx, mcpIdx) {
  const tip = landmarks[tipIdx];
  const pip = landmarks[pipIdx];
  const mcp = landmarks[mcpIdx];
  return dist(tip, pip) < 0.08 && dist(tip, mcp) < 0.12;
}

function isFingerExtended(landmarks, tipIdx, mcpIdx) {
  return dist(landmarks[tipIdx], landmarks[mcpIdx]) > 0.15;
}

// Track motion over frames for swipe detection
const motionHistory = [];
const MAX_HISTORY = 4;

export function detectGesture(landmarks, worldLandmarks) {
  if (!landmarks || landmarks.length < 21) return { gesture: 'NONE', landmarks, worldLandmarks };

  // Use screen-space landmarks for distance checks – thresholds are calibrated
  // for the 0-1 normalised coordinate range that rawLandmarks provide.
  const lm = landmarks;
  if (!Array.isArray(lm) || lm.length < 21) return { gesture: 'NONE', landmarks, worldLandmarks };
  if (!isValidPoint(lm[THUMB_TIP]) || !isValidPoint(lm[INDEX_TIP]) || !isValidPoint(lm[MIDDLE_TIP])) {
    motionHistory.length = 0;
    return { gesture: 'NONE', landmarks, worldLandmarks };
  }

  // Update motion history for swipe detection
  motionHistory.push({
    index: { x: lm[INDEX_TIP].x, y: lm[INDEX_TIP].y },
    middle: { x: lm[MIDDLE_TIP].x, y: lm[MIDDLE_TIP].y },
  });
  if (motionHistory.length > MAX_HISTORY) motionHistory.shift();

  // Check PINCH: distance(thumb_tip, index_tip) < 0.05 && distance(thumb_ip, index_ip) > 0.07
  const pinchDist = dist(lm[THUMB_TIP], lm[INDEX_TIP]);
  const pinchSpread = dist(lm[THUMB_IP], lm[INDEX_PIP]);
  if (pinchDist < 0.05 && pinchSpread > 0.07) {
    return { gesture: 'PINCH', landmarks, worldLandmarks, pinchPoint: lm[THUMB_TIP] };
  }

  // Distance-based finger state (orientation-independent, works on mobile)
  const thumbCurled = isFingerCurled(lm, THUMB_TIP, THUMB_IP, THUMB_MCP);
  const indexCurled = isFingerCurled(lm, INDEX_TIP, INDEX_PIP, INDEX_MCP);
  const middleCurled = isFingerCurled(lm, MIDDLE_TIP, MIDDLE_PIP, MIDDLE_MCP);
  const ringCurled = isFingerCurled(lm, RING_TIP, RING_PIP, RING_MCP);
  const pinkyCurled = isFingerCurled(lm, PINKY_TIP, PINKY_PIP, PINKY_MCP);

  const thumbExtended = isFingerExtended(lm, THUMB_TIP, THUMB_MCP);
  const indexExtended = isFingerExtended(lm, INDEX_TIP, INDEX_MCP);
  const middleExtended = isFingerExtended(lm, MIDDLE_TIP, MIDDLE_MCP);
  const ringExtended = isFingerExtended(lm, RING_TIP, RING_MCP);
  const pinkyExtended = isFingerExtended(lm, PINKY_TIP, PINKY_MCP);

  // Check CLOSED_FIST: all fingers curled (distance-based)
  if (thumbCurled && indexCurled && middleCurled && ringCurled && pinkyCurled) {
    return { gesture: 'CLOSED_FIST', landmarks, worldLandmarks };
  }

  // Check OPEN_HAND: all fingers extended (distance-based)
  if (thumbExtended && indexExtended && middleExtended && ringExtended && pinkyExtended) {
    return { gesture: 'OPEN_HAND', landmarks, worldLandmarks };
  }

  // Check POINTING: index extended, rest curled
  if (indexExtended && middleCurled && ringCurled && pinkyCurled) {
    return { gesture: 'POINTING', landmarks, worldLandmarks };
  }

  // Check TWO_FINGER_SWIPE: delta of index + middle over last 4 frames > 0.085 in any axis
  if (indexExtended && middleExtended && motionHistory.length >= 4) {
    const oldest = motionHistory[0];
    const newest = motionHistory[motionHistory.length - 1];
    const dx = newest.index.x - oldest.index.x;
    const dy = newest.index.y - oldest.index.y;
    const swipeMag = Math.sqrt(dx * dx + dy * dy);
    if (swipeMag > 0.085) {
      return { gesture: 'TWO_FINGER_SWIPE', landmarks, worldLandmarks, swipeDelta: { x: dx, y: dy } };
    }
  }

  return { gesture: 'NONE', landmarks, worldLandmarks };
}
