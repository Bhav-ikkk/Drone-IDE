/**
 * Session-only inventory manager.
 * Stores custom drone parts created from image analysis via Gemini.
 * All data is wiped on tab close — no persistent storage.
 */

const inventory = new Map();
let nextId = 1;

/**
 * Add a part definition to the session inventory.
 * @param {object} partDef - { name, partType, massKg, dimensionsMm, colorHex, description, suggestedSnapOffset, mesh, rigidBody }
 * @returns {string} Unique inventory item ID
 */
export function addToInventory(partDef) {
  const id = `inv_${nextId++}`;
  inventory.set(id, {
    id,
    name: partDef.name || 'Unknown Part',
    partType: partDef.partType || 'generic',
    massKg: partDef.massKg || 0.1,
    dimensionsMm: partDef.dimensionsMm || { x: 50, y: 50, z: 50 },
    colorHex: partDef.colorHex || '#888888',
    description: partDef.description || '',
    suggestedSnapOffset: partDef.suggestedSnapOffset || { x: 0, y: 0, z: 0 },
    mesh: partDef.mesh || null,
    rigidBody: partDef.rigidBody || null,
    createdAt: Date.now(),
  });
  return id;
}

/**
 * Remove a part from inventory.
 */
export function removeFromInventory(id) {
  return inventory.delete(id);
}

/**
 * Get a specific inventory item.
 */
export function getInventoryItem(id) {
  return inventory.get(id);
}

/**
 * Get all inventory items as an array.
 */
export function getAllInventoryItems() {
  return Array.from(inventory.values());
}

/**
 * Get inventory count.
 */
export function getInventoryCount() {
  return inventory.size;
}

/**
 * Clear the entire inventory (called on cleanup).
 */
export function clearInventory() {
  inventory.clear();
  nextId = 1;
}
