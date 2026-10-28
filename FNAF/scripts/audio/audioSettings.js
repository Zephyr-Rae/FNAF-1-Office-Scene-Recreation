let sfxVolume = 0.5;
let sfxMuted = false;
const audioMultipliers = new Map();
const volumeListeners = new Set();

function getSfxVolume() {
  return sfxMuted ? 0 : sfxVolume;
}

function updateAudioVolumes() {
  const volume = getSfxVolume();
  for (const [audio, multiplier] of audioMultipliers) audio.volume = volume * multiplier;
  for (const listener of volumeListeners) listener(volume);
}

export function registerAudio(audio) {
  audioMultipliers.set(audio, 1);
  audio.volume = getSfxVolume();
  return audio;
}

export function setAudioMultiplier(audio, multiplier) {
  const normalizedMultiplier = Math.max(0, Math.min(1, multiplier));
  audioMultipliers.set(audio, normalizedMultiplier);
  audio.volume = getSfxVolume() * normalizedMultiplier;
}

export function setSfxVolume(volume) {
  sfxVolume = Math.max(0, Math.min(1, volume));
  updateAudioVolumes();
}

export function setSfxMuted(muted) {
  sfxMuted = muted;
  updateAudioVolumes();
}

export function subscribeSfxVolume(listener) {
  volumeListeners.add(listener);
  listener(getSfxVolume());
  return () => volumeListeners.delete(listener);
}
