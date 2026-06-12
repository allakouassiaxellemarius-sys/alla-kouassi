type SoundType = "click" | "notify" | "success" | "crowd";

const state = {
  enabled: true,
  volume: 0.5,
  crowdEnabled: false,
};

let audioCtx: AudioContext | null = null;
let crowdNodes: { source: AudioBufferSourceNode; gain: GainNode } | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function envelope(gain: GainNode, now: number, attack: number, decay: number, peak: number) {
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);
}

export function playSound(type: SoundType) {
  if (!state.enabled) return;
  const ctx = getCtx();
  const now = ctx.currentTime;

  if (type === "click") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    filter.type = "lowpass";
    filter.frequency.value = 1800;
    osc.type = "square";
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.06);
    envelope(gain, now, 0.01, 0.08, state.volume * 0.08);
    osc.start(now);
    osc.stop(now + 0.1);
    return;
  }

  if (type === "notify") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    filter.type = "lowpass";
    filter.frequency.value = 1800;
    osc.type = "sine";
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.setValueAtTime(760, now + 0.09);
    envelope(gain, now, 0.02, 0.2, state.volume * 0.09);
    osc.start(now);
    osc.stop(now + 0.24);
    return;
  }

  if (type === "success") {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    osc1.type = "triangle";
    osc2.type = "triangle";
    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(ctx.destination);
    gain2.connect(ctx.destination);
    osc1.frequency.setValueAtTime(440, now);
    osc1.frequency.linearRampToValueAtTime(660, now + 0.12);
    osc2.frequency.setValueAtTime(660, now + 0.05);
    osc2.frequency.linearRampToValueAtTime(880, now + 0.18);
    envelope(gain1, now, 0.02, 0.24, state.volume * 0.08);
    envelope(gain2, now + 0.04, 0.02, 0.2, state.volume * 0.06);
    osc1.start(now);
    osc2.start(now + 0.04);
    osc1.stop(now + 0.28);
    osc2.stop(now + 0.28);
    return;
  }

  if (type === "crowd") {
    playCrowdBurst();
    return;
  }
}

function playCrowdBurst() {
  if (!state.enabled) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  const bufferSize = ctx.sampleRate * 0.4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.35;
  }
  const src = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  src.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.value = 700;
  filter.Q.value = 0.7;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(state.volume * 0.05, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
  src.start(now);
  src.stop(now + 0.4);
}

export function startCrowdLoop() {
  const ctx = getCtx();
  stopCrowdLoop();
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.22;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 850;
  const gain = ctx.createGain();
  gain.gain.value = state.volume * 0.025;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
  crowdNodes = { source, gain };
  state.crowdEnabled = true;
}

export function stopCrowdLoop() {
  if (crowdNodes?.source) {
    try { crowdNodes.source.stop(); } catch {}
  }
  crowdNodes = null;
  state.crowdEnabled = false;
}

export function setSoundVolume(v: number) {
  state.volume = Math.max(0, Math.min(1, v));
  if (crowdNodes?.gain) {
    crowdNodes.gain.gain.value = state.volume * 0.025;
  }
}

export function setSoundEnabled(enabled: boolean) {
  state.enabled = enabled;
}

export function isCrowdEnabled() {
  return state.crowdEnabled;
}
