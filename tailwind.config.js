/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Barlow', 'system-ui', 'sans-serif'],
          display: ['"Barlow Condensed"', 'system-ui', 'sans-serif'],
        },
        colors: {
          // App surfaces — light
          cream: '#f5f1ea',   // app bg (light)
          surface: '#fffdf9', // cards (light)
          surface2: '#efe9df', // set-index chip, segmented track (light)
          ink: '#1c1a17',     // primary text / inverse card (light)
          // App surfaces — dark
          night: '#16130f',       // app bg (dark)
          'surface-d': '#201c17',  // cards (dark)
          'surface2-d': '#2a251d', // timer, set-index (dark)
          // Text
          'ink-d': '#f6f2ea',   // primary text (dark) — pairs with `ink` for light
          muted: '#8a8378',     // secondary (light)
          'muted-2': '#a29d93', // tertiary (light)
          faint: '#c8bfae',     // placeholder/disabled (light)
          'muted-d': '#a49a8b',  // secondary (dark)
          'muted-2d': '#6f665a', // tertiary (dark)
          // Lines
          line: '#e9e2d6',         // hairline/border (light)
          'line-input': '#e4ddd0',
          'line-d': '#2e2921',     // hairline (dark)
          'line-input-d': '#362f26',
          // Accent (the one energy color)
          accent: '#e8622a',        // light
          'accent-d': '#ff7440',    // dark
          'accent-soft': '#fbe6db', // tint bg (light)
          'accent-soft-d': '#32211a', // tint bg (dark)
          'accent-ink': '#c26a3a',  // accent text on cream (contrast-safe)
          // Workout types — light [color, tint]
          push: '#3f7cae', 'push-soft': '#e4edf4',
          pull: '#7d6bb3', 'pull-soft': '#ece8f5',
          legs: '#5f8f5a', 'legs-soft': '#e7f0e5',
          other: '#b98a3f', 'other-soft': '#f6ecda',
          // Workout types — dark
          'push-d': '#6ea0d0', 'push-soft-d': '#1a2531',
          'pull-d': '#a894d8', 'pull-soft-d': '#241f31',
          'legs-d': '#7fb079', 'legs-soft-d': '#1a2618',
          'other-d': '#d3a45f', 'other-soft-d': '#2a2113',
          // Overflow palette for custom workout types beyond the 4 presets
          // (Push/Pull/Legs/Other). getTypeStyles() in workoutTypeTheme.js
          // deterministically hashes a type name onto one of these 10, so any
          // "Add workout type" beyond the presets still gets a stable, distinct
          // color everywhere without storing a color choice in Firestore.
          extra1: '#2f8f82', 'extra1-soft': '#e2f0ee', 'extra1-d': '#5cb8aa', 'extra1-soft-d': '#172b28', // teal
          extra2: '#5b6bbf', 'extra2-soft': '#e6e8f5', 'extra2-d': '#8b96d9', 'extra2-soft-d': '#21243a', // indigo
          extra3: '#b85c7a', 'extra3-soft': '#f5e6ea', 'extra3-d': '#d98aa3', 'extra3-soft-d': '#2e1f24', // rose
          extra4: '#8a5ba3', 'extra4-soft': '#efe4f4', 'extra4-d': '#b98fd0', 'extra4-soft-d': '#291f30', // plum
          extra5: '#7a8f3f', 'extra5-soft': '#eef2e0', 'extra5-d': '#a3b869', 'extra5-soft-d': '#262b17', // olive
          extra6: '#b0524a', 'extra6-soft': '#f6e5e3', 'extra6-d': '#d98074', 'extra6-soft-d': '#301f1c', // crimson
          extra7: '#3f8fa3', 'extra7-soft': '#e3eff2', 'extra7-d': '#6fb8cc', 'extra7-soft-d': '#1a2b2e', // cyan
          extra8: '#a3467d', 'extra8-soft': '#f4e3ee', 'extra8-d': '#cf7cae', 'extra8-soft-d': '#301f2a', // magenta
          extra9: '#8a6142', 'extra9-soft': '#f0e6db', 'extra9-d': '#b98f68', 'extra9-soft-d': '#282017', // brown
          extra10: '#8a7a68', 'extra10-soft': '#f0ebe2', 'extra10-d': '#bfae98', 'extra10-soft-d': '#2a2620', // taupe
        },
        borderRadius: {
          chip: '9px', card: '13px', bar: '14px', win: '16px',
        },
        boxShadow: {
          card: '0 2px 10px -6px rgba(30,28,24,.12)',
          dock: '0 10px 24px -12px rgba(30,28,24,.22)',
          modal: '0 30px 60px -20px rgba(0,0,0,.7)',
        },
        keyframes: {
          confettiFall: {
            '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '0' },
            '15%': { opacity: '1' },
            '100%': { transform: 'translateY(240px) rotate(300deg)', opacity: '0' },
          },
        },
        animation: { confetti: 'confettiFall 2.8s ease-in infinite' },
      },
    },
    plugins: [],
  }