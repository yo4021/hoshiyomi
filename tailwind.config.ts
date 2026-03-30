import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        deep:    '#2d1f5e',
        mid:     '#534AB7',
        light:   '#EEEDFE',
        gold:    '#c9a84c',
        gold2:   '#e8c96a',
        ink:     '#1a1816',
        paper:   '#faf8f3',
        muted:   '#6b6560',
        border:  '#e0dbd0',
      },
      fontFamily: {
        sans:  ['var(--font-noto-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-noto-serif)', 'Georgia', 'serif'],
        display: ['var(--font-cinzel)', 'serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'twinkle': 'twinkle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        twinkle: {
          '0%,100%': { opacity: '0.1' },
          '50%':     { opacity: '0.9' },
        },
      },
    },
  },
  plugins: [],
}

export default config
