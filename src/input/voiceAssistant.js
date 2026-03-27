/**
 * Voice Assistant for Drone Assembly IDE.
 *
 * Wake word  : "drone manager wake up"
 * Shutdown   : "shut down" | "go to sleep" | "drone manager sleep"
 * Commands   :
 *   "describe [this component]" → speaks the selected part's overview
 *   "assemble"                  → triggers ASSEMBLE command
 *   "take off" / "fly"          → triggers FLY command
 *   "land" / "stop"             → triggers LAND command
 *
 * Uses the Web Speech API — no external dependencies.
 */

const WAKE_PHRASES = [
  'drone manager wake up',
  'drone manager wakeup',
  'wake up drone manager',
  'hey drone',
];

const SLEEP_PHRASES = ['shut down', 'go to sleep', 'drone manager sleep', 'goodbye'];

let recognition = null;
let isActive = false;
let supported = false;

/** Callbacks injected at init time */
let _onCommand = null;
let _onStatusChange = null;

/**
 * Initialise the voice assistant.
 * @param {object} options
 * @param {function} options.onCommand     Called with (commandName, data) when a command is recognised.
 * @param {function} options.onStatusChange Called with ('WAITING'|'ACTIVE'|'SPEAKING'|'UNSUPPORTED').
 * @returns {boolean} true if the browser supports the required APIs.
 */
export function initVoiceAssistant({ onCommand, onStatusChange } = {}) {
  _onCommand = onCommand || null;
  _onStatusChange = onStatusChange || null;

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR || !window.speechSynthesis) {
    console.warn('[Voice] SpeechRecognition or SpeechSynthesis not supported in this browser.');
    _onStatusChange?.('UNSUPPORTED');
    return false;
  }

  supported = true;
  recognition = new SR();
  recognition.continuous = true;
  // interimResults enables faster wake-word detection from partial transcripts.
  // Commands are only processed from final results to avoid false positives.
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;

  recognition.onresult = _handleResult;
  recognition.onerror = _handleError;
  recognition.onend = () => {
    // Auto-restart so the assistant keeps listening.
    if (recognition && supported) {
      try { recognition.start(); } catch (_) { /* already started */ }
    }
  };

  _startRecognition();
  return true;
}

/**
 * Stop and tear down the voice assistant.
 */
export function stopVoiceAssistant() {
  supported = false;
  if (recognition) {
    recognition.onend = null;
    try { recognition.stop(); } catch (_) { /* ignore */ }
    recognition = null;
  }
  isActive = false;
}

/**
 * Whether the assistant is in active (post-wake-word) mode.
 */
export function isVoiceAssistantActive() {
  return isActive;
}

// ─── Internal ────────────────────────────────────────────────────────────────

function _startRecognition() {
  try {
    recognition.start();
    _setStatus('WAITING');
  } catch (e) {
    console.warn('[Voice] Could not start recognition:', e.message);
  }
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
    // ── Idle mode: listen only for the wake word ──
    if (WAKE_PHRASES.some((p) => text.includes(p))) {
      _activate();
    }
  } else {
    // ── Active mode: process commands from finalised speech only ──
    if (finalText.trim()) {
      _processCommand(finalText.trim());
    }
  }
}

function _activate() {
  isActive = true;
  _setStatus('ACTIVE');
  speak("Drone manager active. How can I help?");
}

function _deactivate() {
  isActive = false;
  _setStatus('WAITING');
  speak("Going to sleep. Say 'drone manager wake up' to activate me again.");
}

function _processCommand(text) {
  // ── Check for sleep phrases first ──
  if (SLEEP_PHRASES.some((p) => text.includes(p))) {
    _deactivate();
    return;
  }

  // ── Describe command ──
  if (
    text.includes('describe') ||
    text.includes('what is this') ||
    text.includes('tell me about') ||
    text.includes('explain this') ||
    text.includes('what part')
  ) {
    _onCommand?.('DESCRIBE', {});
    return;
  }

  // ── Assemble command ──
  if (
    text.includes('assemble') ||
    text.includes('build') ||
    text.includes('put together') ||
    text.includes('snap')
  ) {
    _onCommand?.('ASSEMBLE', {});
    return;
  }

  // ── Fly / take off command ──
  if (
    text.includes('take off') ||
    text.includes('takeoff') ||
    text.includes('launch') ||
    text.includes('start flight') ||
    text.includes('fly') ||
    text.includes('start flying')
  ) {
    _onCommand?.('FLY', {});
    return;
  }

  // ── Land / stop command ──
  if (
    text.includes('land') ||
    text.includes('stop flight') ||
    text.includes('come down') ||
    text.includes('stop flying')
  ) {
    _onCommand?.('LAND', {});
    return;
  }

  // ── Unknown ──
  speak(
    "I didn't catch that. Try saying: describe this component, assemble, take off, or land."
  );
}

function _handleError(event) {
  // 'no-speech' and 'audio-capture' are common non-critical errors — ignore them.
  if (event.error === 'no-speech' || event.error === 'audio-capture') return;
  console.warn('[Voice] Recognition error:', event.error);
}

function _setStatus(status) {
  _onStatusChange?.(status);
}

// ─── Text-to-Speech ───────────────────────────────────────────────────────────

function _pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.name === 'Google US English') ||
    voices.find((v) => v.name.includes('Samantha')) ||
    voices.find((v) => v.name.includes('Alex')) ||
    voices.find((v) => v.lang === 'en-US' && !v.localService) ||
    voices.find((v) => v.lang.startsWith('en')) ||
    null
  );
}

/**
 * Speak text via the Web Speech Synthesis API.
 * @param {string} text
 */
export function speak(text) {
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 1.05;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Voices may not be available yet on first call; load them and then speak.
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const preferred = _pickVoice();
    if (preferred) utterance.voice = preferred;
    _doSpeak(utterance);
  } else {
    // Wait for the voices list to populate (typically fires once).
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      const preferred = _pickVoice();
      if (preferred) utterance.voice = preferred;
      _doSpeak(utterance);
    };
  }
}

function _doSpeak(utterance) {
  utterance.onstart = () => _setStatus('SPEAKING');
  utterance.onend = () => _setStatus(isActive ? 'ACTIVE' : 'WAITING');
  utterance.onerror = (e) => {
    if (e.error !== 'interrupted') {
      console.warn('[Voice] TTS error:', e.error);
    }
    _setStatus(isActive ? 'ACTIVE' : 'WAITING');
  };
  window.speechSynthesis.speak(utterance);
}
