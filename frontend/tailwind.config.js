/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        scope: {
          bg: '#0A0E14',
          panel: '#0F1620',
          panel2: '#121B27',
          grid: '#1B2836',
          border: '#22303F',
        },
        signal: {
          cyan: '#5EEAD4',
          amber: '#FBBF24',
          coral: '#FB7185',
          green: '#34D399',
          violet: '#A78BFA',
        },
        muted: '#7C8B9C',
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        sans: ['"Inter"', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(94, 234, 212, 0.35)',
        glowAmber: '0 0 16px rgba(251, 191, 36, 0.35)',
      },
    },
  },
  plugins: [],
}
