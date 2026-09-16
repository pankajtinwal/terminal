import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        terminal: {
          bg: '#09090b',
          surface: '#121215',
          subpanel: '#18181b',
          card: '#121215',
          border: '#27272a',
          borderSubtle: 'rgba(39, 39, 42, 0.6)',
          borderHover: '#3f3f46',
          text: '#f4f4f5',
          secondary: '#a1a1aa',
          muted: '#71717a',
          dim: '#52525b',
          bull: '#10b981',
          bullMuted: 'rgba(16, 185, 129, 0.12)',
          bear: '#f43f5e',
          bearMuted: 'rgba(244, 63, 94, 0.12)',
          accent: '#06b6d4',
          accentMuted: 'rgba(6, 182, 212, 0.12)',
        },
        brand: {
          dark: '#09090b',
          surface: '#121215',
          border: '#27272a',
          borderSubtle: 'rgba(39, 39, 42, 0.6)',
          accent: '#06b6d4',
          up: '#10b981',
          upGlow: 'rgba(16, 185, 129, 0.12)',
          down: '#f43f5e',
          downGlow: 'rgba(244, 63, 94, 0.12)',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
