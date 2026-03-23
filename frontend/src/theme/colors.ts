// 200 Named Color Palette for Claude Dashboard

export const colors = {
  // -- Brand (10) --
  brand: {
    50: '#eef2ff', 100: '#dbe4ff', 200: '#bac8ff', 300: '#91a7ff',
    400: '#748ffc', 500: '#5c7cfa', 600: '#4c6ef5', 700: '#4263eb',
    800: '#3b5bdb', 900: '#364fc7',
  },
  // -- Accent (10) --
  accent: {
    50: '#fff0f6', 100: '#ffdeeb', 200: '#fcc2d7', 300: '#faa2c1',
    400: '#f783ac', 500: '#f06595', 600: '#e64980', 700: '#d6336c',
    800: '#c2255c', 900: '#a61e4d',
  },
  // -- Success (10) --
  success: {
    50: '#ebfbee', 100: '#d3f9d8', 200: '#b2f2bb', 300: '#8ce99a',
    400: '#69db7c', 500: '#51cf66', 600: '#40c057', 700: '#37b24d',
    800: '#2f9e44', 900: '#2b8a3e',
  },
  // -- Warning (10) --
  warning: {
    50: '#fff9db', 100: '#fff3bf', 200: '#ffec99', 300: '#ffe066',
    400: '#ffd43b', 500: '#fcc419', 600: '#fab005', 700: '#f59f00',
    800: '#f08c00', 900: '#e67700',
  },
  // -- Error (10) --
  error: {
    50: '#fff5f5', 100: '#ffe3e3', 200: '#ffc9c9', 300: '#ffa8a8',
    400: '#ff8787', 500: '#ff6b6b', 600: '#fa5252', 700: '#f03e3e',
    800: '#e03131', 900: '#c92a2a',
  },
  // -- Info (10) --
  info: {
    50: '#e7f5ff', 100: '#d0ebff', 200: '#a5d8ff', 300: '#74c0fc',
    400: '#4dabf7', 500: '#339af0', 600: '#228be6', 700: '#1c7ed6',
    800: '#1971c2', 900: '#1864ab',
  },
  // -- Chart primary (12) --
  chart: {
    blue: '#4263eb', cyan: '#15aabf', teal: '#12b886',
    green: '#40c057', lime: '#82c91e', yellow: '#fcc419',
    orange: '#fd7e14', red: '#fa5252', pink: '#e64980',
    grape: '#be4bdb', violet: '#7950f2', indigo: '#4c6ef5',
  },
  // -- Chart light (12) --
  chartLight: {
    blue: '#74c0fc', cyan: '#66d9e8', teal: '#63e6be',
    green: '#8ce99a', lime: '#c0eb75', yellow: '#ffe066',
    orange: '#ffc078', red: '#ffa8a8', pink: '#fcc2d7',
    grape: '#e599f7', violet: '#b197fc', indigo: '#91a7ff',
  },
  // -- Chart dark (12) --
  chartDark: {
    blue: '#1864ab', cyan: '#0b7285', teal: '#087f5b',
    green: '#2b8a3e', lime: '#5c940d', yellow: '#e67700',
    orange: '#d9480f', red: '#c92a2a', pink: '#a61e4d',
    grape: '#862e9c', violet: '#5f3dc4', indigo: '#364fc7',
  },
  // -- Chart gradients (8) --
  gradients: {
    g1: { start: '#667eea', end: '#764ba2' },
    g2: { start: '#f093fb', end: '#f5576c' },
    g3: { start: '#4facfe', end: '#00f2fe' },
    g4: { start: '#43e97b', end: '#38f9d7' },
  },
  // -- Terminal (16) --
  terminal: {
    black: '#1e1e2e', red: '#f38ba8', green: '#a6e3a1',
    yellow: '#f9e2af', blue: '#89b4fa', magenta: '#cba6f7',
    cyan: '#94e2d5', white: '#cdd6f4',
    brightBlack: '#585b70', brightRed: '#f38ba8', brightGreen: '#a6e3a1',
    brightYellow: '#f9e2af', brightBlue: '#89b4fa', brightMagenta: '#cba6f7',
    brightCyan: '#94e2d5', brightWhite: '#a6adc8',
  },
  // -- Git (16) --
  git: {
    added: '#40c057', modified: '#fcc419', deleted: '#fa5252',
    renamed: '#339af0', conflict: '#e64980', untracked: '#868e96',
    staged: '#51cf66', unstaged: '#ff6b6b', branch: '#7950f2',
    tag: '#fd7e14', remote: '#15aabf', stash: '#be4bdb',
    merge: '#4263eb', rebase: '#e64980', cherry: '#f06595',
    bisect: '#82c91e',
  },
  // -- Badge backgrounds & text (24 = 12 pairs) --
  badge: {
    blueBg: '#dbe4ff', blueText: '#4263eb',
    greenBg: '#d3f9d8', greenText: '#2b8a3e',
    redBg: '#ffe3e3', redText: '#c92a2a',
    yellowBg: '#fff3bf', yellowText: '#e67700',
    purpleBg: '#e5dbff', purpleText: '#5f3dc4',
    pinkBg: '#ffdeeb', pinkText: '#a61e4d',
    cyanBg: '#c3fae8', cyanText: '#087f5b',
    orangeBg: '#ffe8cc', orangeText: '#d9480f',
    grayBg: '#e9ecef', grayText: '#495057',
    indigoBg: '#dbe4ff', indigoText: '#364fc7',
    tealBg: '#c3fae8', tealText: '#0b7285',
    limeBg: '#e9fac8', limeText: '#5c940d',
  },
  // -- Icon colors (16) --
  icon: {
    default: '#8989b2', active: '#5c7cfa',
    success: '#40c057', error: '#fa5252',
    warning: '#fcc419', info: '#339af0',
    terminal: '#a6e3a1', git: '#f06595',
    folder: '#fcc419', file: '#74c0fc',
    settings: '#868e96', plugin: '#be4bdb',
    memory: '#15aabf', database: '#fd7e14',
    task: '#7950f2', theme: '#f783ac',
  },
  // -- Surface & Overlay (16) --
  overlay: {
    5: 'rgba(0,0,0,0.05)', 10: 'rgba(0,0,0,0.10)',
    20: 'rgba(0,0,0,0.20)', 40: 'rgba(0,0,0,0.40)',
    60: 'rgba(0,0,0,0.60)', 80: 'rgba(0,0,0,0.80)',
    glassLight: 'rgba(255,255,255,0.08)', glassMedium: 'rgba(255,255,255,0.12)',
    glassHeavy: 'rgba(255,255,255,0.18)', glassBorder: 'rgba(255,255,255,0.06)',
    shadowXs: 'rgba(0,0,0,0.05)', shadowSm: 'rgba(0,0,0,0.10)',
    shadowMd: 'rgba(0,0,0,0.15)', shadowLg: 'rgba(0,0,0,0.20)',
    shadowXl: 'rgba(0,0,0,0.25)', shadow2xl: 'rgba(0,0,0,0.35)',
  },
} as const;

export type ColorKey = keyof typeof colors;
