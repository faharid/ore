/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ore: {
          accent: '#2563eb',
          'accent-hover': '#1d4ed8',
          'accent-muted': '#3b82f6',
          'bg-primary': '#111827',
          'bg-secondary': '#1f2937',
          'bg-tertiary': '#374151',
          border: '#4b5563',
          'text-primary': '#f3f4f6',
          'text-secondary': '#d1d5db',
          'text-tertiary': '#9ca3af',
          error: '#f87171',
          success: '#4ade80',
          warning: '#facc15',
          info: '#60a5fa',
          'module-vpc': '#2563eb',
          'module-ecs': '#ea580c',
          'module-rds': '#16a34a',
          'module-alb': '#0891b2',
          'module-monitoring': '#7c3aed',
          'module-secondary': '#ec4899',
          'module-tertiary': '#14b8a6'
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
