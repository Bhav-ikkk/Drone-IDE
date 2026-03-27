/**
 * Server connectivity layer for optional multi-user collaboration.
 * Implements WebSocket (primary) with REST fallback.
 * All sync is optional and off by default.
 *
 * Protocol choice rationale:
 * - WebSocket (chosen): Low latency for real-time drone state sync (part positions, assembly status,
 *   gestures broadcast). Ideal for multi-user presentation mode.
 * - REST/HTTP (fallback): Too slow for real-time drag, but usable for session save/load.
 * - WebRTC DataChannel: P2P with zero server cost, but harder NAT traversal. Future option.
 * - MQTT: Overkill unless connecting to real drones later. Potential future integration.
 *
 * Data Packet Format (JSON, < 2 KB per packet):
 * {
 *   "type": "stateUpdate" | "gesture" | "inventoryAdd" | "snap",
 *   "sessionId": "uuid",
 *   "userId": "uuid",
 *   "timestamp": 1743100000000,
 *   "payload": {
 *     "droneAssembly": { partId: { pos: [x,y,z], rot: [qx,qy,qz,qw] } },
 *     "inventory": [{ id, name, glbUrlBase64 }]
 *   }
 * }
 */

let ws = null;
let sessionId = null;
let userId = null;
let connected = false;
let onMessageCallback = null;

/**
 * Generate a UUID v4.
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Connect to collaboration server.
 * @param {string} roomCode - Room code entered by user
 * @param {string} serverUrl - WebSocket server URL (default: mock)
 * @param {Function} onMessage - Callback for incoming messages
 */
export function connect(roomCode, serverUrl, onMessage) {
  if (connected) disconnect();

  sessionId = roomCode || generateUUID();
  userId = generateUUID();
  onMessageCallback = onMessage;

  // Default to ws:// for local development; production server URL should be explicitly provided
  const url = serverUrl || `ws://localhost:8080/ws?room=${encodeURIComponent(sessionId)}`;

  try {
    ws = new WebSocket(url);

    ws.onopen = () => {
      connected = true;
      console.log(`[ServerConnector] Connected to room ${sessionId}`);
      send('join', { userId, sessionId });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessageCallback) onMessageCallback(data);
      } catch (e) {
        console.warn('[ServerConnector] Failed to parse message:', e);
      }
    };

    ws.onclose = () => {
      connected = false;
      console.log('[ServerConnector] Disconnected');
    };

    ws.onerror = (err) => {
      console.warn('[ServerConnector] WebSocket error (server may not be running):', err);
      connected = false;
    };
  } catch (err) {
    console.warn('[ServerConnector] Failed to connect:', err);
    connected = false;
  }
}

/**
 * Send a data packet to the server.
 * @param {string} type - Packet type: stateUpdate | gesture | inventoryAdd | snap
 * @param {object} payload - Packet payload
 */
export function send(type, payload) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return false;

  const packet = {
    type,
    sessionId: sessionId || '',
    userId: userId || '',
    timestamp: Date.now(),
    payload: payload || {},
  };

  ws.send(JSON.stringify(packet));
  return true;
}

/**
 * Broadcast current drone state to all connected users.
 * @param {Array} parts - Array of drone parts with rigidBody
 */
export function broadcastDroneState(parts) {
  if (!connected) return;

  const droneAssembly = {};
  for (const part of parts) {
    if (!part.rigidBody) continue;
    const pos = part.rigidBody.translation();
    const rot = part.rigidBody.rotation();
    droneAssembly[part.id] = {
      pos: [pos.x, pos.y, pos.z],
      rot: [rot.x, rot.y, rot.z, rot.w],
    };
  }

  send('stateUpdate', { droneAssembly });
}

/**
 * Disconnect from server.
 */
export function disconnect() {
  if (ws) {
    ws.close();
    ws = null;
  }
  connected = false;
  sessionId = null;
}

/**
 * Check if currently connected.
 */
export function isConnected() {
  return connected;
}

/**
 * Get the current session ID.
 */
export function getSessionId() {
  return sessionId;
}
