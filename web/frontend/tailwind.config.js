/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ore: {
          accent: '#4EFFA0',
          'accent-hover': '#3de890',
          'accent-muted': '#6dffb8',
          'bg-primary': '#0f0f1e',
          'bg-secondary': '#1a1a2e',
          'bg-tertiary': '#2d3a52',
          'bg-input': '#0f0f1e',
          border: '#2d2d4d',
          'text-primary': '#ffffff',
          'text-secondary': '#b0b0c0',
          'text-tertiary': '#8899bb',
          'text-muted': '#6d7d9d',
          error: '#ff6666',
          'error-border': '#ff4444',
          success: '#4EFFA0',
          warning: '#facc15',
          info: '#60a5fa'
        }
      },
      borderRadius: {
        ore: '8px',
        'ore-sm': '4px'
      },
      fontSize: {
        'ore-display': ['clamp(1.875rem, 5vw, 2.25rem)', { lineHeight: '1.1', fontWeight: '700' }],
        'ore-headline': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
        'ore-title': ['1rem', { lineHeight: '1.5', fontWeight: '600' }],
        'ore-body': ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],
        'ore-label': ['0.75rem', { lineHeight: '1.5', fontWeight: '500' }],
        'ore-mono': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }]
      },
      transitionTimingFunction: {
        ore: 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      fontFamily: {
        mono: ["Monaco", "Courier New", "monospace"]
      }
    }
  },
  plugins: []
};
