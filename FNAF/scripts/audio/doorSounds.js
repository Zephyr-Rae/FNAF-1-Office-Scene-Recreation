import { subscribeSfxVolume } from './audioSettings.js';

const doorAudioContext = new AudioContext();
const masterGain = doorAudioContext.createGain();
masterGain.connect(doorAudioContext.destination);
subscribeSfxVolume((volume) => {
  masterGain.gain.setTargetAtTime(volume, doorAudioContext.currentTime, 0.01);
});
let doorSoundBuffers;

export async function playDoorSound() {
  try {
    await doorAudioContext.resume();
    if (!doorSoundBuffers) {
      doorSoundBuffers = fetch('sfx/door_slam.mp3')
        .then((response) => {
          if (!response.ok) throw new Error(`Door sound request failed: ${response.status}`);
          return response.arrayBuffer();
        })
        .then((data) => doorAudioContext.decodeAudioData(data));
    }
    const buffer = await doorSoundBuffers;
    const source = doorAudioContext.createBufferSource();
    const gain = doorAudioContext.createGain();
    source.buffer = buffer;
    gain.gain.value = 0.35;
    source.connect(gain);
    gain.connect(masterGain);
    source.start();
  } catch (error) {
    console.error('Could not play door sound:', error);
  }
}
