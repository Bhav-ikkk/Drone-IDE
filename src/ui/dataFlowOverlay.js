/**
 * Data-Flow Overlay — shows how data moves between
 * client-side modules and the server/APIs.
 *
 * Renders a 2D SVG diagram overlaid on the viewport
 * with animated dashed-line "packets" flowing between nodes.
 */

let overlayEl = null;
let visible = false;
let animFrame = null;

const NODES = [
  { id: 'mediapipe', label: 'MediaPipe\n(Hand Tracking)', x: 8, y: 10, w: 130, color: '#00bcd4' },
  { id: 'voice', label: 'Voice\nAssistant', x: 8, y: 40, w: 120, color: '#00e676' },
  { id: 'threejs', label: 'Three.js\nRenderer', x: 42, y: 25, w: 120, color: '#ff9800' },
  { id: 'rapier', label: 'Rapier\nPhysics', x: 42, y: 55, w: 120, color: '#e040fb' },
  { id: 'gemini', label: 'Gemini API\n(Cloud)', x: 78, y: 10, w: 130, color: '#ff5252' },
  { id: 'websocket', label: 'WebSocket\nServer', x: 78, y: 50, w: 130, color: '#536dfe' },
  { id: 'browser', label: 'Browser\nAPIs', x: 42, y: 82, w: 120, color: '#78909c' },
];

const EDGES = [
  { from: 'mediapipe', to: 'threejs', label: 'Landmarks', dashed: true },
  { from: 'voice', to: 'threejs', label: 'Commands', dashed: true },
  { from: 'threejs', to: 'rapier', label: 'Bodies & Forces', dashed: false },
  { from: 'rapier', to: 'threejs', label: 'Positions', dashed: true },
  { from: 'threejs', to: 'websocket', label: 'Drone State', dashed: true },
  { from: 'websocket', to: 'threejs', label: 'Remote State', dashed: true },
  { from: 'threejs', to: 'gemini', label: 'Image Blob', dashed: true },
  { from: 'gemini', to: 'threejs', label: 'Part JSON', dashed: true },
  { from: 'browser', to: 'voice', label: 'Speech API', dashed: false },
  { from: 'browser', to: 'mediapipe', label: 'Camera Stream', dashed: false },
];

export function toggleDataFlowOverlay() {
  if (visible) {
    _hide();
  } else {
    _show();
  }
}

export function isDataFlowVisible() {
  return visible;
}

function _show() {
  if (!overlayEl) _createOverlay();
  overlayEl.style.display = 'flex';
  visible = true;
  _animate();
}

function _hide() {
  if (overlayEl) overlayEl.style.display = 'none';
  visible = false;
  if (animFrame) cancelAnimationFrame(animFrame);
  animFrame = null;
}

function _createOverlay() {
  overlayEl = document.createElement('div');
  overlayEl.id = 'data-flow-overlay';
  overlayEl.innerHTML = `
    <div class="dfo-backdrop"></div>
    <div class="dfo-container">
      <div class="dfo-header">
        <h3>System Architecture — Data Flow</h3>
        <button class="dfo-close-btn" aria-label="Close">&times;</button>
      </div>
      <svg class="dfo-svg" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#00f7ff" opacity="0.7"/>
          </marker>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
      <div class="dfo-legend">
        <span class="dfo-legend-item"><span class="dfo-line-solid"></span> Sync</span>
        <span class="dfo-legend-item"><span class="dfo-line-dashed"></span> Async / Stream</span>
        <span class="dfo-legend-item"><span style="color:#ff5252;">●</span> Cloud API</span>
        <span class="dfo-legend-item"><span style="color:#536dfe;">●</span> Network</span>
        <span class="dfo-legend-item"><span style="color:#00bcd4;">●</span> Local</span>
      </div>
    </div>
  `;
  document.body.appendChild(overlayEl);

  overlayEl.querySelector('.dfo-close-btn').addEventListener('click', _hide);
  overlayEl.querySelector('.dfo-backdrop').addEventListener('click', _hide);

  const svg = overlayEl.querySelector('.dfo-svg');

  // Draw edges first (behind nodes)
  for (const edge of EDGES) {
    const from = NODES.find((n) => n.id === edge.from);
    const to = NODES.find((n) => n.id === edge.to);
    if (!from || !to) continue;

    const x1 = from.x * 10 + from.w / 2;
    const y1 = from.y * 6 + 25;
    const x2 = to.x * 10 + to.w / 2;
    const y2 = to.y * 6 + 25;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', '#00f7ff');
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-opacity', '0.45');
    line.setAttribute('marker-end', 'url(#arrowhead)');
    if (edge.dashed) {
      line.setAttribute('stroke-dasharray', '6 4');
      line.classList.add('dfo-animated-line');
    }
    svg.appendChild(line);

    // Edge label
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', midX);
    text.setAttribute('y', midY - 6);
    text.setAttribute('fill', '#8899aa');
    text.setAttribute('font-size', '10');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-family', 'Consolas, monospace');
    text.textContent = edge.label;
    svg.appendChild(text);
  }

  // Draw nodes
  for (const node of NODES) {
    const x = node.x * 10;
    const y = node.y * 6;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', node.w);
    rect.setAttribute('height', 50);
    rect.setAttribute('rx', 8);
    rect.setAttribute('fill', 'rgba(10,12,20,0.85)');
    rect.setAttribute('stroke', node.color);
    rect.setAttribute('stroke-width', '1.5');
    rect.setAttribute('filter', 'url(#glow)');
    svg.appendChild(rect);

    // Node label (split by \n)
    const lines = node.label.split('\n');
    lines.forEach((l, i) => {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x + node.w / 2);
      text.setAttribute('y', y + 22 + i * 14);
      text.setAttribute('fill', node.color);
      text.setAttribute('font-size', '11');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-family', 'Inter, system-ui, sans-serif');
      text.textContent = l;
      svg.appendChild(text);
    });
  }
}

function _animate() {
  // The CSS handles dashed line animation; we just keep the loop alive
  if (visible) {
    animFrame = requestAnimationFrame(_animate);
  }
}
