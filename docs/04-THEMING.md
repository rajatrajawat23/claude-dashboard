# Claude Dashboard - Theming System

## Design Philosophy
Apple-inspired aesthetics: clean, minimal, purposeful. Every pixel serves a function.
SF Pro-inspired typography, subtle glassmorphism, precise shadows, smooth micro-animations.

---

## Theme Modes
1. **Light** - Clean white/gray palette
2. **Dark** - Rich slate/charcoal palette
3. **System** - Auto-detect OS preference

---

## 40 Dark Shades

```
dark-1:  #0a0a0b    (Deepest background)
dark-2:  #0d0d0f
dark-3:  #101013
dark-4:  #131316
dark-5:  #16161a    (Primary background)
dark-6:  #191920
dark-7:  #1c1c24
dark-8:  #1f1f28
dark-9:  #22222c
dark-10: #252530    (Card background)
dark-11: #282835
dark-12: #2b2b3a
dark-13: #2e2e3f
dark-14: #313144
dark-15: #343449    (Elevated surface)
dark-16: #37374e
dark-17: #3a3a53
dark-18: #3d3d58
dark-19: #40405d
dark-20: #434362    (Active surface)
dark-21: #4a4a6a
dark-22: #515172
dark-23: #58587a
dark-24: #5f5f82
dark-25: #66668a    (Subtle border)
dark-26: #6d6d92
dark-27: #74749a
dark-28: #7b7ba2
dark-29: #8282aa
dark-30: #8989b2    (Muted text)
dark-31: #9494ba
dark-32: #9f9fc2
dark-33: #aaaaca
dark-34: #b5b5d2
dark-35: #c0c0da    (Secondary text)
dark-36: #cbcbe2
dark-37: #d6d6ea
dark-38: #e1e1f2
dark-39: #ececfa
dark-40: #f7f7ff    (Primary text on dark)
```

## 40 Light Shades

```
light-1:  #ffffff    (Primary background)
light-2:  #fefefe
light-3:  #fdfdfd
light-4:  #fcfcfc
light-5:  #fafafa    (Secondary background)
light-6:  #f8f8f9
light-7:  #f6f6f8
light-8:  #f4f4f7
light-9:  #f2f2f6
light-10: #f0f0f5   (Card background)
light-11: #ededf2
light-12: #eaeaf0
light-13: #e7e7ee
light-14: #e4e4ec
light-15: #e1e1ea   (Border light)
light-16: #dddde7
light-17: #d9d9e4
light-18: #d5d5e1
light-19: #d1d1de
light-20: #cdcddb   (Divider)
light-21: #c5c5d4
light-22: #bdbdcd
light-23: #b5b5c6
light-24: #adadbf
light-25: #a5a5b8   (Placeholder text)
light-26: #9d9db1
light-27: #9595aa
light-28: #8d8da3
light-29: #85859c
light-30: #7d7d95   (Muted text)
light-31: #71718a
light-32: #65657f
light-33: #595974
light-34: #4d4d69
light-35: #41415e   (Secondary text)
light-36: #363652
light-37: #2b2b46
light-38: #20203a
light-39: #15152e
light-40: #0a0a22   (Primary text on light)
```

---

## 200 Named Colors

### Primary Palette (20)
```
brand-50:  #eef2ff    brand-100: #dbe4ff    brand-200: #bac8ff    brand-300: #91a7ff
brand-400: #748ffc    brand-500: #5c7cfa    brand-600: #4c6ef5    brand-700: #4263eb
brand-800: #3b5bdb    brand-900: #364fc7
accent-50: #fff0f6    accent-100: #ffdeeb    accent-200: #fcc2d7    accent-300: #faa2c1
accent-400: #f783ac    accent-500: #f06595    accent-600: #e64980    accent-700: #d6336c
accent-800: #c2255c    accent-900: #a61e4d
```

### Status Colors (20)
```
success-50:  #ebfbee    success-100: #d3f9d8    success-200: #b2f2bb    success-300: #8ce99a
success-400: #69db7c    success-500: #51cf66    success-600: #40c057    success-700: #37b24d
success-800: #2f9e44    success-900: #2b8a3e
warning-50:  #fff9db    warning-100: #fff3bf    warning-200: #ffec99    warning-300: #ffe066
warning-400: #ffd43b    warning-500: #fcc419    warning-600: #fab005    warning-700: #f59f00
warning-800: #f08c00    warning-900: #e67700
```

### Error & Info (20)
```
error-50:   #fff5f5    error-100:  #ffe3e3    error-200:  #ffc9c9    error-300:  #ffa8a8
error-400:  #ff8787    error-500:  #ff6b6b    error-600:  #fa5252    error-700:  #f03e3e
error-800:  #e03131    error-900:  #c92a2a
info-50:    #e7f5ff    info-100:   #d0ebff    info-200:   #a5d8ff    info-300:   #74c0fc
info-400:   #4dabf7    info-500:   #339af0    info-600:   #228be6    info-700:   #1c7ed6
info-800:   #1971c2    info-900:   #1864ab
```

### Chart & Data Viz (40)
```
chart-blue:     #4263eb    chart-cyan:     #15aabf    chart-teal:     #12b886
chart-green:    #40c057    chart-lime:     #82c91e    chart-yellow:   #fcc419
chart-orange:   #fd7e14    chart-red:      #fa5252    chart-pink:     #e64980
chart-grape:    #be4bdb    chart-violet:   #7950f2    chart-indigo:   #4c6ef5
chart-blue-l:   #74c0fc    chart-cyan-l:   #66d9e8    chart-teal-l:   #63e6be
chart-green-l:  #8ce99a    chart-lime-l:   #c0eb75    chart-yellow-l: #ffe066
chart-orange-l: #ffc078    chart-red-l:    #ffa8a8    chart-pink-l:   #fcc2d7
chart-grape-l:  #e599f7    chart-violet-l: #b197fc    chart-indigo-l: #91a7ff
chart-blue-d:   #1864ab    chart-cyan-d:   #0b7285    chart-teal-d:   #087f5b
chart-green-d:  #2b8a3e    chart-lime-d:   #5c940d    chart-yellow-d: #e67700
chart-orange-d: #d9480f    chart-red-d:    #c92a2a    chart-pink-d:   #a61e4d
chart-grape-d:  #862e9c    chart-violet-d: #5f3dc4    chart-indigo-d: #364fc7
(8 additional gradients for special charts)
chart-g1-start: #667eea  chart-g1-end: #764ba2
chart-g2-start: #f093fb  chart-g2-end: #f5576c
chart-g3-start: #4facfe  chart-g3-end: #00f2fe
chart-g4-start: #43e97b  chart-g4-end: #38f9d7
```

### Terminal Colors (16)
```
term-black:       #1e1e2e    term-red:         #f38ba8    term-green:       #a6e3a1
term-yellow:      #f9e2af    term-blue:        #89b4fa    term-magenta:     #cba6f7
term-cyan:        #94e2d5    term-white:       #cdd6f4    term-bright-black:#585b70
term-bright-red:  #f38ba8    term-bright-green:#a6e3a1    term-bright-yellow:#f9e2af
term-bright-blue: #89b4fa    term-bright-magenta:#cba6f7  term-bright-cyan: #94e2d5
term-bright-white:#a6adc8
```

### Git Colors (16)
```
git-added:    #40c057    git-modified: #fcc419    git-deleted:  #fa5252
git-renamed:  #339af0    git-conflict: #e64980    git-untracked:#868e96
git-staged:   #51cf66    git-unstaged: #ff6b6b    git-branch:   #7950f2
git-tag:      #fd7e14    git-remote:   #15aabf    git-stash:    #be4bdb
git-merge:    #4263eb    git-rebase:   #e64980    git-cherry:   #f06595
git-bisect:   #82c91e
```

### Sidebar Colors (12)
```
sidebar-bg:         var(--dark-5)     sidebar-bg-hover:     var(--dark-10)
sidebar-bg-active:  var(--dark-15)    sidebar-border:       var(--dark-25)
sidebar-text:       var(--dark-35)    sidebar-text-active:  var(--dark-40)
sidebar-icon:       var(--dark-30)    sidebar-icon-active:  var(--brand-500)
sidebar-badge:      var(--brand-600)  sidebar-badge-text:   var(--dark-40)
sidebar-section:    var(--dark-30)    sidebar-divider:      var(--dark-20)
```

### Badge & Tag Colors (24)
```
badge-blue:   #dbe4ff/#4263eb    badge-green:  #d3f9d8/#2b8a3e
badge-red:    #ffe3e3/#c92a2a    badge-yellow: #fff3bf/#e67700
badge-purple: #e5dbff/#5f3dc4    badge-pink:   #ffdeeb/#a61e4d
badge-cyan:   #c3fae8/#087f5b    badge-orange: #ffe8cc/#d9480f
badge-gray:   #e9ecef/#495057    badge-indigo: #dbe4ff/#364fc7
badge-teal:   #c3fae8/#0b7285    badge-lime:   #e9fac8/#5c940d
(each has bg/text pair = 24 colors)
```

### Icon Colors (16)
```
icon-default:  var(--dark-30)    icon-active:   var(--brand-500)
icon-success:  #40c057           icon-error:    #fa5252
icon-warning:  #fcc419           icon-info:     #339af0
icon-terminal: #a6e3a1           icon-git:      #f06595
icon-folder:   #fcc419           icon-file:     #74c0fc
icon-settings: #868e96           icon-plugin:   #be4bdb
icon-memory:   #15aabf           icon-database: #fd7e14
icon-task:     #7950f2           icon-theme:    #f783ac
```

### Surface & Overlay (16)
```
overlay-5:   rgba(0,0,0,0.05)    overlay-10:  rgba(0,0,0,0.10)
overlay-20:  rgba(0,0,0,0.20)    overlay-40:  rgba(0,0,0,0.40)
overlay-60:  rgba(0,0,0,0.60)    overlay-80:  rgba(0,0,0,0.80)
glass-light: rgba(255,255,255,0.08)   glass-medium: rgba(255,255,255,0.12)
glass-heavy: rgba(255,255,255,0.18)   glass-border: rgba(255,255,255,0.06)
shadow-xs:   rgba(0,0,0,0.05)    shadow-sm:   rgba(0,0,0,0.10)
shadow-md:   rgba(0,0,0,0.15)    shadow-lg:   rgba(0,0,0,0.20)
shadow-xl:   rgba(0,0,0,0.25)    shadow-2xl:  rgba(0,0,0,0.35)
```

**Total: 200 named colors**

---

## Dynamic Border Radius Scale

```
radius-none: 0px
radius-xs:   2px
radius-sm:   4px
radius-md:   6px
radius-default: 8px
radius-lg:   10px
radius-xl:   12px
radius-2xl:  16px
radius-3xl:  20px
radius-4xl:  24px
radius-full: 9999px
```

User can set a **global radius multiplier** (0.0 to 2.0) that scales all radii.

---

## 6 Sidebar Variants

### 1. Minimal
- Width: 60px (icons only)
- Expands to 240px on hover
- Tooltip labels on hover
- Perfect for maximizing content area

### 2. Compact
- Width: 180px
- Small icons (16px) + truncated labels
- No section headers
- Dense information display

### 3. Standard
- Width: 260px
- Regular icons (20px) + full labels
- Section headers with collapse
- Most balanced option

### 4. Floating
- Width: 280px
- Overlay with backdrop blur
- Slides in from left
- Auto-hides after selection
- Glass morphism effect

### 5. Docked (VS Code style)
- Activity bar (48px) + Side panel (260px)
- Activity bar has icon-only navigation
- Side panel shows context for active section
- Resizable panels

### 6. Rail
- Rail width: 48px (icon buttons)
- Flyout panel: 280px (on click)
- Panel shows sub-navigation
- Click outside to dismiss flyout

---

## Theme Token Structure (CSS Custom Properties)

```css
:root {
  /* Mode: light or dark */
  --theme-mode: light;

  /* Shades (40 per mode) */
  --shade-1 through --shade-40

  /* Brand */
  --brand-50 through --brand-900
  --accent-50 through --accent-900

  /* Status */
  --success-50 through --success-900
  --warning-50 through --warning-900
  --error-50 through --error-900
  --info-50 through --info-900

  /* Semantic */
  --bg-primary: var(--shade-1);
  --bg-secondary: var(--shade-5);
  --bg-card: var(--shade-10);
  --bg-elevated: var(--shade-15);
  --bg-active: var(--shade-20);
  --border-default: var(--shade-25);
  --text-muted: var(--shade-30);
  --text-secondary: var(--shade-35);
  --text-primary: var(--shade-40);

  /* Dynamic Radius */
  --radius-multiplier: 1.0;
  --radius-sm: calc(4px * var(--radius-multiplier));
  --radius-md: calc(6px * var(--radius-multiplier));
  --radius-lg: calc(10px * var(--radius-multiplier));
  /* ... etc */

  /* Sidebar */
  --sidebar-variant: standard;
  --sidebar-width: 260px;
}
```
