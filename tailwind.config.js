/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 工业救援配色
        'dark-bg': '#0a0e27',
        'dark-panel': '#1a1f3a',
        'dark-border': '#2d3748',
        'rescue-orange': '#ff7043',
        'rescue-green': '#4ade80',
        'rescue-red': '#ef4444',
        'rescue-yellow': '#facc15',
        'rescue-blue': '#3b82f6',
        'tech-cyan': '#00f0ff',
        'tech-amber': '#ffcc00',
        'tech-bg': 'rgba(0, 20, 40, 0.8)',
      },
      fontFamily: {
        'mono': ['"Share Tech Mono"', 'Monaco', 'Courier New', 'monospace'],
        'tech': ['"Orbitron"', 'sans-serif'],
      },
      backgroundImage: {
        'tech-gradient': 'linear-gradient(to right, rgba(0, 240, 255, 0.1), transparent)',
        'tech-gradient-r': 'linear-gradient(to left, rgba(0, 240, 255, 0.1), transparent)',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink': 'blink 1s infinite',
        'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        blink: {
          '0%, 50%, 100%': { opacity: '1' },
          '25%, 75%': { opacity: '0.5' },
        },
        ping: {
          '75%, 100%': {
            transform: 'scale(2)',
            opacity: '0',
          },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
