/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#080a0f',
          surface: '#0d111a',
          card: '#121824',
          cardHover: '#182030',
          border: '#1f293d',
          borderGlow: '#2e3d5b',
          muted: '#64748b',
          text: '#f1f5f9',
          cyan: '#00f3ff',
          cyanGlow: '#00f3ff40',
          purple: '#a855f7',
          purpleGlow: '#a855f740',
          blue: '#3b82f6',
          green: '#10b981',
          greenGlow: '#10b98140',
          crimson: '#f43f5e',
          crimsonGlow: '#f43f5e40',
          amber: '#f59e0b',
          amberGlow: '#f59e0b40',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        display: ['"Rajdhani"', '"Orbitron"', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px -2px rgba(0, 243, 255, 0.4), 0 0 8px 0 rgba(0, 243, 255, 0.2)',
        'neon-purple': '0 0 20px -2px rgba(168, 85, 247, 0.4), 0 0 8px 0 rgba(168, 85, 247, 0.2)',
        'neon-green': '0 0 20px -2px rgba(16, 185, 129, 0.4), 0 0 8px 0 rgba(16, 185, 129, 0.2)',
        'neon-crimson': '0 0 20px -2px rgba(244, 63, 94, 0.4), 0 0 8px 0 rgba(244, 63, 94, 0.2)',
        'neon-amber': '0 0 20px -2px rgba(245, 158, 11, 0.4), 0 0 8px 0 rgba(245, 158, 11, 0.2)',
        'cyber-card': '0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(31, 41, 61, 0.6)',
      },
      animation: {
        'radar-sweep': 'sweep 4s linear infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.9' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
      },
    },
  },
  plugins: [],
}
