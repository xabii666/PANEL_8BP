import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#07090f',
          secondary: '#0d1117',
          card: '#111827',
          border: '#1e2533',
        },
        accent: {
          cyan: '#00c8ff',
          purple: '#7c3aed',
          green: '#10b981',
          red: '#ef4444',
          yellow: '#f59e0b',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
