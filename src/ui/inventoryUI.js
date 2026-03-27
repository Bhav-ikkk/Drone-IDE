/**
 * Inventory UI panel for managing custom drone parts.
 * Provides file upload, Gemini analysis, and drag-into-scene functionality.
 */

import { initGeminiClient, isGeminiReady, analyzePartImage, createMeshFromAnalysis, exportAsGLB } from '../inventory/imageToPart.js';
import { addToInventory, getAllInventoryItems, removeFromInventory } from '../inventory/inventoryManager.js';

let panelEl = null;
let listEl = null;
let onPartCreated = null; // Callback when a new part is added to scene

/**
 * Initialize the inventory UI.
 * @param {Function} onPartCreatedCallback - Called with { mesh, partData } when user adds a part to scene
 */
export function initInventoryUI(onPartCreatedCallback) {
  onPartCreated = onPartCreatedCallback;

  panelEl = document.getElementById('inventory-panel');
  listEl = document.getElementById('inventory-list');

  const apiKeyInput = document.getElementById('gemini-api-key');
  const setKeyBtn = document.getElementById('set-api-key-btn');
  const fileInput = document.getElementById('part-image-input');
  const analyzeBtn = document.getElementById('analyze-part-btn');
  const statusEl = document.getElementById('inventory-status');

  if (!panelEl) return;

  // Set API key
  if (setKeyBtn) {
    setKeyBtn.addEventListener('click', async () => {
      const key = apiKeyInput ? apiKeyInput.value.trim() : '';
      if (!key) {
        if (statusEl) statusEl.textContent = 'Please enter an API key.';
        return;
      }
      try {
        await initGeminiClient(key);
        if (statusEl) statusEl.textContent = '✓ Gemini connected';
        if (analyzeBtn) analyzeBtn.disabled = false;
      } catch (err) {
        if (statusEl) statusEl.textContent = `✗ ${err.message}`;
      }
    });
  }

  // Analyze image
  if (analyzeBtn) {
    analyzeBtn.disabled = true;
    analyzeBtn.addEventListener('click', async () => {
      if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        if (statusEl) statusEl.textContent = 'Select an image first.';
        return;
      }
      if (!isGeminiReady()) {
        if (statusEl) statusEl.textContent = 'Set API key first.';
        return;
      }

      if (statusEl) statusEl.textContent = 'Analyzing image…';
      try {
        const partData = await analyzePartImage(fileInput.files[0]);
        const mesh = createMeshFromAnalysis(partData);
        const id = addToInventory({ ...partData, mesh });

        if (statusEl) statusEl.textContent = `✓ ${partData.name} added to inventory`;
        refreshInventoryList();
      } catch (err) {
        if (statusEl) statusEl.textContent = `✗ ${err.message}`;
      }
    });
  }
}

/**
 * Refresh the displayed inventory list.
 */
function refreshInventoryList() {
  if (!listEl) return;
  listEl.innerHTML = '';

  const items = getAllInventoryItems();
  if (items.length === 0) {
    listEl.innerHTML = '<div style="color:#556677;font-size:0.8rem;padding:8px;">No items yet. Upload a photo to get started.</div>';
    return;
  }

  for (const item of items) {
    const el = document.createElement('div');
    el.className = 'inventory-item';
    el.innerHTML = `
      <div class="inv-item-name">${escapeHtml(item.name)}</div>
      <div class="inv-item-type">${escapeHtml(item.partType)} · ${item.massKg}kg</div>
      <div class="inv-item-actions">
        <button class="inv-add-btn" data-id="${item.id}">Add to Scene</button>
        <button class="inv-export-btn" data-id="${item.id}">Export GLB</button>
        <button class="inv-remove-btn" data-id="${item.id}">✕</button>
      </div>
    `;
    listEl.appendChild(el);
  }

  // Bind buttons
  listEl.querySelectorAll('.inv-add-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = getAllInventoryItems().find((i) => i.id === btn.dataset.id);
      if (item && onPartCreated) {
        onPartCreated({ mesh: item.mesh.clone(), partData: item });
      }
    });
  });

  listEl.querySelectorAll('.inv-export-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const item = getAllInventoryItems().find((i) => i.id === btn.dataset.id);
      if (item && item.mesh) {
        await exportAsGLB(item.mesh, `${item.name.replace(/\s+/g, '-').toLowerCase()}.glb`);
      }
    });
  });

  listEl.querySelectorAll('.inv-remove-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      removeFromInventory(btn.dataset.id);
      refreshInventoryList();
    });
  });
}

/**
 * Toggle inventory panel visibility.
 */
export function toggleInventoryPanel() {
  if (panelEl) panelEl.classList.toggle('open');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
