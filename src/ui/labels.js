import * as THREE from 'three';

const labelSprites = [];

/**
 * Create floating text labels above each drone part using canvas sprites.
 */
export function createLabels(parts, scene) {
  for (const part of parts) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 256, 64);
    ctx.font = 'bold 24px Consolas, monospace';
    ctx.fillStyle = '#00ffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(part.label, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.5, 0.4, 1);
    sprite.visible = true;
    scene.add(sprite);

    labelSprites.push({ sprite, partId: part.id });
  }
}

export function updateLabels(parts) {
  for (const ls of labelSprites) {
    const part = parts.find((p) => p.id === ls.partId);
    if (part) {
      const pos = part.rigidBody.translation();
      ls.sprite.position.set(pos.x, pos.y + 0.6, pos.z);
    }
  }
}

export function setLabelsVisible(visible) {
  for (const ls of labelSprites) {
    ls.sprite.visible = visible;
  }
}
