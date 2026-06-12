const sounds = {
  efootball: "/son-efootball.mp3",
  victory: "/victory.mp3",
  notification: "/notification.mp3",
  matchStart: "/match-start.mp3",
  score: "/score.mp3",
};

const audioCache = new Map<string, HTMLAudioElement>();

function getAudio(src: string): HTMLAudioElement {
  if (!audioCache.has(src)) {
    audioCache.set(src, new Audio(src));
  }
  return audioCache.get(src)!;
}

export function playSound(name: keyof typeof sounds) {
  try {
    const src = sounds[name];
    const audio = getAudio(src);
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {}
}

export function stopSound(name: keyof typeof sounds) {
  try {
    const src = sounds[name];
    const audio = getAudio(src);
    audio.pause();
    audio.currentTime = 0;
  } catch {}
}

export { sounds };
