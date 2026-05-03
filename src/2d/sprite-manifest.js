export const PALETTE = {
  outline: '#223047',
  skin: '#ffd7c2',
  skinShadow: '#e9ad9b',
  blush: '#ff8fa3',
  hairLight: '#b8d8ee',
  hairMain: '#8eb8d4',
  hairShadow: '#5f86a3',
  dress: '#234987',
  dressShadow: '#172f5d',
  apron: '#ffffff',
  apronShadow: '#d7e1ed',
  bow: '#3a6cc4',
  pucciMain: '#5a2d86',
  pucciShadow: '#321947',
  pucciHighlight: '#7b4bb0',
  pucciTooth: '#ffffff',
  shadow: 'rgba(0, 0, 0, 0.25)',
  carrot: '#ff7a3d',
  carrotShadow: '#c4501f',
  carrotLeaf: '#5fb04a',
  laptop: '#9aa5b1',
  laptopShadow: '#5a6470',
  laptopScreen: '#7ec8e3',
};

export const RABBIT_SPRITE = {
  id: 'rabbit-maid',
  frameSize: { w: 128, h: 128 },
  anchor: { x: 64, y: 120 },
  hitboxes: {
    head: { x: 34, y: 8, w: 60, h: 60 },
    body: { x: 36, y: 62, w: 56, h: 56 },
  },
  animations: {
    idle:    { frames: ['idle_a', 'idle_b', 'idle_c', 'idle_d'],                         fps: 4,  loop: true },
    wave:    { frames: ['wave_a', 'wave_b', 'wave_c', 'wave_d', 'wave_e', 'wave_f'],     fps: 8,  loop: true },
    run:     { frames: ['run_a', 'run_b', 'run_c', 'run_d', 'run_e', 'run_f'],           fps: 10, loop: true },
    sleep:   { frames: ['sleep_a', 'sleep_b', 'sleep_c', 'sleep_d'],                     fps: 2,  loop: true },
    eat:     { frames: ['eat_a', 'eat_b', 'eat_c', 'eat_d'],                             fps: 6,  loop: true },
    typing:  { frames: ['type_a', 'type_b', 'type_c', 'type_d'],                         fps: 8,  loop: true },
    headpat: { frames: ['pat_a', 'pat_b', 'pat_c', 'pat_d'],                             fps: 12, loop: true },
  },
};

export const PUCCI_SPRITE = {
  id: 'pucci',
  frameSize: { w: 32, h: 32 },
  anchor: { x: 16, y: 30 },
  hitboxes: {
    body: { x: 4, y: 6, w: 24, h: 24 },
  },
  animations: {
    idle: { frames: ['idle_a', 'idle_b'], fps: 2, loop: true },
    hop:  { frames: ['hop_a', 'hop_b'],   fps: 6, loop: true },
  },
};
