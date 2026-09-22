/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // A calm, easy-on-the-eyes palette — soft sage green + gentle sky
        // blue on an off-white background. No neon, no pure black/white.
        void: '#FFFFFF',        // text placed on top of a filled primary/accent
        space: '#F6F9F7',       // page background — soft mint-white
        panel: '#FFFFFF',       // card surface
        panelLight: '#EFF5F1',  // hovered / raised surface
        line: '#E2EAE5',        // hairline borders
        cyan: '#4F9D82',        // primary — soft sage teal-green
        cyanSoft: '#8FC9B4',    // lighter tint (icon chip borders, accents)
        blue: '#6FA8DC',        // secondary accent — soft sky blue
        blueDeep: '#4A86C5',
        ink: '#25322C',         // primary text — soft near-black, green-tinted
        subtle: '#5F7268',      // secondary text
        faint: '#93A79C',       // tertiary / placeholder text
        warn: '#B9820F',
        danger: '#C4564D',
        ok: '#4F9D82',
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 1px 2px rgba(37,50,44,0.04), 0 8px 24px rgba(37,50,44,0.06)',
        glowHover: '0 4px 10px rgba(37,50,44,0.06), 0 16px 32px rgba(37,50,44,0.09)',
        glowBtn: '0 4px 14px rgba(79,157,130,0.30)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        rise: 'rise 0.5s ease-out both',
        floaty: 'floaty 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
