import { registerAudio } from './audioSettings.js';

export const ambience = registerAudio(new Audio('sfx/ambience.mp3'));
ambience.loop = true;
ambience.preload = 'auto';
