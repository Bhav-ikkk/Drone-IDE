import * as THREE from 'three';

/**
 * Gemini 2.5 Flash integration for analyzing drone part images
 * and creating procedural 3D parts from the analysis.
 *
 * Uses @google/generative-ai SDK (client-side only).
 * API key is entered by user at runtime — never stored.
 */

let genAI = null;
let model = null;

const SYSTEM_PROMPT = `You are a professional drone engineer. Analyze this photo. Return ONLY a JSON object with: partType (motor/battery/frame/propeller/flightController/camera/esc/vtx/antenna/receiver), name, massKg, dimensionsMm (object with x/y/z), colorHex, description, suggestedSnapOffset (object with x/y/z). Be extremely precise.`;

/**
 * Initialize the Gemini AI client with user-provided API key.
 * @param {string} apiKey - Google AI API key
 */
export async function initGeminiClient(apiKey) {
  if (!apiKey) throw new Error('API key is required');

  // Dynamic import of @google/generative-ai
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    return true;
  } catch (err) {
    console.error('Failed to initialize Gemini client:', err);
    throw new Error('Failed to initialize Gemini. Ensure @google/generative-ai is installed.');
  }
}

/**
 * Check if Gemini client is initialized.
 */
export function isGeminiReady() {
  return model !== null;
}

/**
 * Analyze a drone part image using Gemini 2.5 Flash.
 * @param {File} imageFile - Image file from file input
 * @returns {Promise<object>} Parsed part analysis JSON
 */
export async function analyzePartImage(imageFile) {
  if (!model) throw new Error('Gemini not initialized. Enter API key first.');

  // Convert file to base64
  const base64 = await fileToBase64(imageFile);
  const mimeType = imageFile.type || 'image/jpeg';

  const result = await model.generateContent([
    SYSTEM_PROMPT,
    {
      inlineData: {
        data: base64,
        mimeType,
      },
    },
  ]);

  const responseText = result.response.text();

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, responseText];
  const jsonStr = jsonMatch[1].trim();

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse Gemini response as JSON:', responseText);
    throw new Error('Invalid response from Gemini. Please try again.');
  }
}

/**
 * Create a procedural Three.js mesh from Gemini analysis data.
 * @param {object} partData - Analysis result from Gemini
 * @returns {THREE.Group} The created mesh group
 */
export function createMeshFromAnalysis(partData) {
  const group = new THREE.Group();
  group.name = partData.name || 'Custom Part';

  const dims = partData.dimensionsMm || { x: 50, y: 50, z: 50 };
  // Convert mm to scene units (1 unit ≈ 100mm)
  const sx = (dims.x || 50) / 100;
  const sy = (dims.y || 50) / 100;
  const sz = (dims.z || 50) / 100;

  const color = new THREE.Color(partData.colorHex || '#888888');
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.5,
    metalness: 0.3,
  });

  let geometry;
  switch (partData.partType) {
    case 'motor':
      geometry = new THREE.CylinderGeometry(sx * 0.5, sx * 0.5, sy, 16);
      break;
    case 'propeller':
      geometry = new THREE.BoxGeometry(sx, sy * 0.2, sz * 0.15);
      break;
    case 'battery':
      geometry = new THREE.BoxGeometry(sx, sy, sz);
      break;
    case 'frame':
      geometry = new THREE.BoxGeometry(sx, sy * 0.3, sz);
      break;
    case 'camera':
      geometry = new THREE.CylinderGeometry(sx * 0.3, sx * 0.3, sy, 12);
      break;
    default:
      geometry = new THREE.BoxGeometry(sx, sy, sz);
  }

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  return group;
}

/**
 * Export a Three.js mesh as GLB using GLTFExporter.
 * @param {THREE.Object3D} object - The 3D object to export
 * @param {string} filename - Download filename
 */
export async function exportAsGLB(object, filename = 'drone-part.glb') {
  const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
  const exporter = new GLTFExporter();

  return new Promise((resolve, reject) => {
    exporter.parse(
      object,
      (result) => {
        const blob = new Blob([result], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        resolve(url);
      },
      reject,
      { binary: true }
    );
  });
}

// ========== Helpers ==========

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Remove data URL prefix
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
