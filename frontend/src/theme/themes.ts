// Premium Multi-Theme Preset System

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  mode: 'dark' | 'light';
  accent: string; // primary accent color
  shades: Record<number, string>; // 1-40 shades
  accentScale: Record<number, string>; // 50-900 accent scale
}

export const themePresets: ThemePreset[] = [
  // 1. Midnight Ocean (Dark) - Deep blue-purple
  {
    id: 'midnight-ocean',
    name: 'Midnight Ocean',
    description: 'Deep sea blues with purple accents',
    mode: 'dark',
    accent: '#6366f1',
    shades: {
      1: '#030318', 2: '#05052a', 3: '#07073c', 4: '#0a0a4e',
      5: '#0c0c5a', 6: '#0f0f66', 7: '#111172', 8: '#14147e',
      9: '#17178a', 10: '#1a1a96', 11: '#1e1ea0', 12: '#2222aa',
      13: '#2626b4', 14: '#2a2abe', 15: '#2e2ec8', 16: '#3333cc',
      17: '#3838d0', 18: '#3d3dd4', 19: '#4242d8', 20: '#4747dc',
      21: '#5050e0', 22: '#5959e4', 23: '#6262e8', 24: '#6b6bec',
      25: '#7474f0', 26: '#7d7df3', 27: '#8686f5', 28: '#8f8ff7',
      29: '#9898f9', 30: '#a1a1fb', 31: '#aaaafc', 32: '#b3b3fd',
      33: '#bcbcfe', 34: '#c5c5fe', 35: '#ceceff', 36: '#d7d7ff',
      37: '#e0e0ff', 38: '#e9e9ff', 39: '#f2f2ff', 40: '#fafaff',
    },
    accentScale: {
      50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
      400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
      800: '#3730a3', 900: '#312e81',
    },
  },

  // 2. Forest Emerald (Dark) - Rich greens
  {
    id: 'forest-emerald',
    name: 'Forest Emerald',
    description: 'Deep forest greens with emerald glow',
    mode: 'dark',
    accent: '#10b981',
    shades: {
      1: '#020f0a', 2: '#041a14', 3: '#06251e', 4: '#083028',
      5: '#0a3b32', 6: '#0c463c', 7: '#0e5146', 8: '#105c50',
      9: '#12675a', 10: '#147264', 11: '#177a6c', 12: '#1a8274',
      13: '#1d8a7c', 14: '#209284', 15: '#239a8c', 16: '#26a294',
      17: '#2aaa9c', 18: '#2eb2a4', 19: '#32baac', 20: '#36c2b4',
      21: '#3ec8ba', 22: '#46cec0', 23: '#4ed4c6', 24: '#56dacc',
      25: '#5ee0d2', 26: '#66e6d8', 27: '#6eecde', 28: '#76f0e2',
      29: '#80f4e6', 30: '#8af8ea', 31: '#94faee', 32: '#9efcf2',
      33: '#a8fdf4', 34: '#b2fef6', 35: '#bcfef8', 36: '#c6fefa',
      37: '#d0fffc', 38: '#dafffd', 39: '#e4fffe', 40: '#f0ffff',
    },
    accentScale: {
      50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
      400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
      800: '#065f46', 900: '#064e3b',
    },
  },

  // 3. Rose Gold (Light) - Warm pinks and golds
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    description: 'Elegant warm pinks with golden highlights',
    mode: 'light',
    accent: '#e11d48',
    shades: {
      1: '#fffbfc', 2: '#fff8f9', 3: '#fff5f7', 4: '#fff2f5',
      5: '#ffeff3', 6: '#ffecf1', 7: '#ffe9ef', 8: '#ffe6ed',
      9: '#ffe3eb', 10: '#ffe0e9', 11: '#ffdbe5', 12: '#ffd6e1',
      13: '#ffd1dd', 14: '#ffccd9', 15: '#ffc7d5', 16: '#ffc2d1',
      17: '#ffbdcd', 18: '#ffb8c9', 19: '#ffb3c5', 20: '#ffaec1',
      21: '#f5a0b5', 22: '#eb92a9', 23: '#e1849d', 24: '#d77691',
      25: '#cd6885', 26: '#c35a79', 27: '#b94c6d', 28: '#af3e61',
      29: '#a53055', 30: '#9b2249', 31: '#8e1c42', 32: '#81163b',
      33: '#741034', 34: '#670a2d', 35: '#5a0426', 36: '#4d001f',
      37: '#400018', 38: '#330011', 39: '#26000a', 40: '#190003',
    },
    accentScale: {
      50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af',
      400: '#fb7185', 500: '#e11d48', 600: '#be123c', 700: '#9f1239',
      800: '#881337', 900: '#4c0519',
    },
  },

  // 4. Arctic Frost (Light) - Cool icy blues
  {
    id: 'arctic-frost',
    name: 'Arctic Frost',
    description: 'Crystal clear icy blue tones',
    mode: 'light',
    accent: '#0ea5e9',
    shades: {
      1: '#f8fdff', 2: '#f2fbff', 3: '#ecf9ff', 4: '#e6f7ff',
      5: '#e0f5ff', 6: '#daf3ff', 7: '#d4f1ff', 8: '#ceefff',
      9: '#c8edff', 10: '#c2ebff', 11: '#b8e7ff', 12: '#aee3ff',
      13: '#a4dfff', 14: '#9adbff', 15: '#90d7ff', 16: '#86d3ff',
      17: '#7ccfff', 18: '#72cbff', 19: '#68c7ff', 20: '#5ec3ff',
      21: '#54bafc', 22: '#4ab1f9', 23: '#40a8f6', 24: '#369ff3',
      25: '#2c96f0', 26: '#228ded', 27: '#1884ea', 28: '#0e7be7',
      29: '#0472e4', 30: '#0069d9', 31: '#005ecc', 32: '#0053bf',
      33: '#0048b2', 34: '#003da5', 35: '#003298', 36: '#00278b',
      37: '#001c7e', 38: '#001171', 39: '#000664', 40: '#000050',
    },
    accentScale: {
      50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc',
      400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1',
      800: '#075985', 900: '#0c4a6e',
    },
  },

  // 5. Obsidian Ember (Dark) - Black with orange/red accents
  {
    id: 'obsidian-ember',
    name: 'Obsidian Ember',
    description: 'Dark obsidian with fiery ember accents',
    mode: 'dark',
    accent: '#f97316',
    shades: {
      1: '#0a0604', 2: '#120c08', 3: '#1a120c', 4: '#221810',
      5: '#2a1e14', 6: '#322418', 7: '#3a2a1c', 8: '#423020',
      9: '#4a3624', 10: '#523c28', 11: '#5a422c', 12: '#624830',
      13: '#6a4e34', 14: '#725438', 15: '#7a5a3c', 16: '#826040',
      17: '#8a6644', 18: '#926c48', 19: '#9a724c', 20: '#a27850',
      21: '#aa8058', 22: '#b28860', 23: '#ba9068', 24: '#c29870',
      25: '#caa078', 26: '#d2a880', 27: '#dab088', 28: '#e0b890',
      29: '#e6c098', 30: '#ecc8a0', 31: '#f0d0a8', 32: '#f4d8b0',
      33: '#f8e0b8', 34: '#fae8c0', 35: '#fcf0c8', 36: '#fef5d0',
      37: '#fff8d8', 38: '#fffbe0', 39: '#fffde8', 40: '#fffef4',
    },
    accentScale: {
      50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
      400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
      800: '#9a3412', 900: '#7c2d12',
    },
  },
];
