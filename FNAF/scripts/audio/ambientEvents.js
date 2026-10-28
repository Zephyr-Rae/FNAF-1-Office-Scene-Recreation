import { registerAudio, setAudioMultiplier, subscribeSfxVolume } from './audioSettings.js';

const events = [
  { audio: registerAudio(new Audio('sfx/footsteps.mp3')), minDelay: 25000, maxDelay: 65000, volume: 0.35 },
  { audio: registerAudio(new Audio('sfx/freddy_laugh.mp3')), minDelay: 30000, maxDelay: 70000, volume: 0.4 },
  { audio: registerAudio(new Audio('sfx/foxy_hum.mp3')), minDelay: 45000, maxDelay: 90000, volume: 0.4 },
];

for (const { audio, volume } of events) {
  audio.preload = 'auto';
  audio.addEventListener('ended', () => {
    audio.currentTime = 0;
  });
  setAudioMultiplier(audio, volume);
}

let active = false;
let audible = true;

subscribeSfxVolume((volume) => {
  audible = volume > 0;
  if (!audible) {
    for (const { audio } of events) {
      audio.pause();
      audio.currentTime = 0;
    }
  }
});

function scheduleEvent(event) {
  const delay = event.minDelay + Math.random() * (event.maxDelay - event.minDelay);
  event.timer = window.setTimeout(async () => {
    if (!active) return;
    if (audible) {
      event.audio.currentTime = 0;
      try {
        await event.audio.play();
      } catch (error) {
        console.error(`Could not play ${event.audio.src}:`, error);
      }
    }
    if (active) scheduleEvent(event);
  }, delay);
}

export function startAmbientEvents() {
  if (active) return;
  active = true;
  for (const event of events) scheduleEvent(event);
}

export function stopAmbientEvents() {
  active = false;
  for (const { audio, timer } of events) {
    window.clearTimeout(timer);
    audio.pause();
    audio.currentTime = 0;
  }
}
