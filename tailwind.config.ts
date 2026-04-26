import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:          'var(--bg)',
        surface:     'var(--surface)',
        surface2:    'var(--surface2)',
        surface3:    'var(--surface3)',
        gold:        'var(--gold)',
        'gold-dim':  'var(--gold-dim)',
        'gold-faint':'var(--gold-faint)',
        ink:         'var(--text)',
        'ink-dim':   'var(--text-dim)',
        'ink-faint': 'var(--text-faint)',
        border:      'var(--border)',
        crimson:     'var(--red)',
        'crimson-dim':'var(--red-dim)',
      },
      fontFamily: {
        cinzel:   ['Cinzel', 'serif'],
        garamond: ['EB Garamond', 'Georgia', 'serif'],
      },
      borderRadius: {
        DEFAULT: '2px',
      },
    },
  },
  plugins: [],
};
export default config;
