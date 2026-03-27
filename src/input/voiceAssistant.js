/**
 * Siri-Style Voice Assistant for Drone Assembly IDE.
 *
 * Features:
 *   - Configurable hotword activation ("Hey Drone", "Drone IDE")
 *   - 8-second active listening window after wake
 *   - Elegant floating Siri-like orb (cyan glow + subtle pulse)
 *   - Natural TTS feedback with calm voice
 *   - Full command set: zoom, assemble/disassemble, fly/land/hover, fun zone, details
 *
 * Uses the Web Speech API — no external dependencies.
 */

const WAKE_PHRASES = [
  'hey drone',
  'drone ide',
  'drone manager wake up',
  'drone manager wakeup',
  'wake up drone manager',
];

const SLEEP_PHRASES = [
  'shut down',
  'go to sleep',
  'drone manager sleep',
  'goodbye',
  'stop listening',
];

const ACTIVE_TIMEOUT_MS = 8000;

let recognition = null;
let isActive = false;
let supported = false;
let activeTimer = null;

let _onCommand = null;
let _onStatusChange = null;

let orbEl = null;

function _createOrb() {
  if (orbEl) return;
  orbEl = document.createElement('div');
  orbEl.id = 'voice-orb';
  orbEl.setAttribute('role', 'status');
  orbEl.setAttribute('aria-live', 'polite');
  orbEl.setAttribute('aria-label', 'Voice assistant');
  orbEl.innerHTML = `
    <div class="voice-orb-ring"></div>
    <div class="voice-orb-ring voice-orb-ring-2"></div>
    <div class="voice-orb-core"></div>
    <div class="voice-orb-label">Say "Hey Drone"</div>
  `;
  document.body.appendChild(orbEl);
}

function _setOrbState(state) {
  if (!orbEl) return;
  orbEl.dataset.state = state;
  const label = orbEl.querySelector('.voice-orb-label');
  if (!label) return;
  switch (state) {
    case 'idle': label.textContent = '🎤 Say "Hey Drone"'; break;
    case 'active': label.textContent = '🗣️ Listening...'; break;
    case 'speaking': label.textContent = '💬 Speaking...'; break;
    case 'unsupported': label.textContent = '🚫 Voice N/A'; break;
    default: label.textContent = '';
  }
}

export function initVoiceAssistant({ onCommand, onStatusChange } = {}) {
  _onCommand = onCommand || null;
  _onStatusChange = onStatusChange || null;

  _createOrb();

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR || !window.speechSynthesis) {
    _setStatus('UNSUPPORTED');
    _setOrbState('unsupported');
    return false;
  }

  supported = true;
  recognition = new SR();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;

  try {
    const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    if (SpeechGrammarList) {
      const grammar = '#JSGF V1.0; grammar commands; public <command> = hey drone | drone ide | zoom in | zoom out | assemble | disassemble | fly | land | hover | fun zone ;';
      const grammarList = new SpeechGrammarList();
      grammarList.addFromString(grammar, 1);
      recognition.grammars = grammarList;
    }
  } catch (_e) { /* Grammar API optional */ }

  recognition.onresult = _handleResult;
  recognition.onerror = _handleError;
  recognition.onend = () => {
    if (recognition && supported) {
      try { recognition.start(); } catch (_e) { /* already started */ }
    }
  };

  _startRecognition();
  _setOrbState('idle');
  return true;
}

export function stopVoiceAssistant() {
  supported = false;
  if (activeTimer) clearTimeout(activeTimer);
  if (recognition) {
    recognition.onend = null;
    try { recognition.stop(); } catch (_e) { /* ignore */ }
    recognition = null;
  }
  isActive = false;
  if (orbEl && orbEl.parentNode) orbEl.parentNode.removeChild(orbEl);
  orbEl = null;
}

export function isVoiceAssistantActive() {
  return isActive;
}

// ─── Internal ────────────────────────────────────────────────────────────────

function _startRecognition() {
  try {
    recognition.start();
    _setStatus('WAITING');
  } catch (_e) { /* already started */ }
}

function _handleResult(event) {
  let finalText = '';
  let interimText = '';

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const r = event.results[i];
    const t = r[0].transcript.toLowerCase().trim();
    if (r.isFinal) finalText += t + ' ';
    else interimText += t + ' ';
  }

  const text = (finalText || interimText).trim();
  if (!text) return;

  if (!isActive) {
    if (WAKE_PHRASES.some((p) => text.includes(p))) {
      _activate();
    }
  } else {
    if (finalText.trim()) {
      _processCommand(finalText.trim());
    }
  }
}

function _activate() {
  isActive = true;
  _setStatus('ACTIVE');
  _setOrbState('active');
  speak('How can I help?');

  if (activeTimer) clearTimeout(activeTimer);
  activeTimer = setTimeout(() => {
    if (isActive) _deactivate();
  }, ACTIVE_TIMEOUT_MS);
}

function _deactivate() {
  isActive = false;
  if (activeTimer) clearTimeout(activeTimer);
  activeTimer = null;
  _setStatus('WAITING');
  _setOrbState('idle');
}

function _resetActiveTimer() {
  if (activeTimer) clearTimeout(activeTimer);
  activeTimer = setTimeout(() => {
    if (isActive) _deactivate();
  }, ACTIVE_TIMEOUT_MS);
}

function _processCommand(text) {
  _resetActiveTimer();

  if (SLEEP_PHRASES.some((p) => text.includes(p))) {
    speak('Going to sleep.');
    _deactivate();
    return;
  }

  if (text.includes('zoom in')) { _onCommand?.('ZOOM_IN', {}); speak('Zooming in.'); return; }
  if (text.includes('zoom out')) { _onCommand?.('ZOOM_OUT', {}); speak('Zooming out.'); return; }

  if (text.includes('disassemble') || text.includes('take apart') || text.includes('break apart')) {
    _onCommand?.('DISASSEMBLE', {});
    return;
  }
  if (text.includes('assemble') || text.includes('build') || text.includes('put together') || text.includes('snap')) {
    _onCommand?.('ASSEMBLE', {});
    return;
  }

  if (text.includes('show detail') || text.includes('describe') || text.includes('what is this') ||
      text.includes('tell me about') || text.includes('explain this') || text.includes('what part')) {
    const partNames = ['frame', 'motor', 'propeller', 'battery', 'flight controller', 'camera'];
    let foundPart = null;
    for (const pn of partNames) {
      if (text.includes(pn)) { foundPart = pn; break; }
    }
    _onCommand?.('DESCRIBE', { partName: foundPart });
    return;
  }

  if (text.includes('take off') || text.includes('takeoff') || text.includes('launch') ||
      text.includes('start flight') || text.includes('fly') || text.includes('start flying')) {
    _onCommand?.('FLY', {});
    return;
  }

  if (text.includes('land') || text.includes('stop flight') || text.includes('come down') || text.includes('stop flying')) {
    _onCommand?.('LAND', {});
    return;
  }

  if (text.includes('hover')) { _onCommand?.('HOVER', {}); return; }

  if (text.includes('enter fun zone') || text.includes('fun zone') || text.includes('funzone')) {
    _onCommand?.('ENTER_FUN_ZONE', {});
    return;
  }
  if (text.includes('exit fun zone') || text.includes('leave fun zone') || text.includes('normal mode')) {
    _onCommand?.('EXIT_FUN_ZONE', {});
    return;
  }

  speak("Try: zoom in, assemble, fly, land, show details, or enter fun zone.");
}

function _handleError(event) {
  if (event.error === 'no-speech' || event.error === 'audio-capture' || event.error === 'aborted') return;
  if (event.error === 'not-allowed') {
    _setStatus('UNSUPPORTED');
    _setOrbState('unsupported');
  }
}

function _setStatus(status) {
  _onStatusChange?.(status);
  const indicator = document.getElementById('voice-indicator');
  if (indicator) {
    indicator.dataset.status = status;
    const labels = {
      WAITING: '🎤 Say "Hey Drone"',
      ACTIVE: '🗣️ Listening...',
      SPEAKING: '💬 Speaking...',
      UNSUPPORTED: '🚫 Voice N/A',
    };
    indicator.textContent = labels[status] || '🎤';
  }
}

// ─── Text-to-Speech ───────────────────────────────────────────────────────────

function _pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.name.includes('Samantha')) ||
    voices.find((v) => v.name === 'Google US English') ||
    voices.find((v) => v.name.includes('Karen')) ||
    voices.find((v) => v.name.includes('Zira')) ||
    voices.find((v) => v.name.includes('Alex')) ||
    voices.find((v) => v.lang === 'en-US' && !v.localService) ||
    voices.find((v) => v.lang.startsWith('en')) ||
    null
  );
}

export function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.95;
  utterance.pitch = 1.05;
  utterance.volume = 0.85;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const preferred = _pickVoice();
    if (preferred) utterance.voice = preferred;
    _doSpeak(utterance);
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      const preferred = _pickVoice();
      if (preferred) utterance.voice = preferred;
      _doSpeak(utterance);
    };
  }
}

function _doSpeak(utterance) {
  utterance.onstart = () => { _setStatus('SPEAKING'); _setOrbState('speaking'); };
  utterance.onend = () => { _setStatus(isActive ? 'ACTIVE' : 'WAITING'); _setOrbState(isActive ? 'active' : 'idle'); };
  utterance.onerror = () => { _setStatus(isActive ? 'ACTIVE' : 'WAITING'); _setOrbState(isActive ? 'active' : 'idle'); };
  window.speechSynthesis.speak(utterance);
}
