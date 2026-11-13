/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        bg: '#fafaf7',
        surface: '#ffffff',
        ink: '#1a1a1a',
        'ink-muted': '#6b6560',
        border: '#e5e2dd',
        accent: {
          DEFAULT: '#1e3a5f',
          hover: '#15304f',
          light: '#e8eef5'
        },
        success: {
          DEFAULT: '#2d5016',
          bg: '#e8f0e0'
        },
        danger: {
          DEFAULT: '#a13b2b',
          bg: '#f5e5e2'
        },
        warning: {
          DEFAULT: '#8a5a00',
          bg: '#fdf0d5'
        }
      },
      fontFamily: {
        display: ['Georgia', '"Times New Roman"', 'serif'],
        body: ['system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        mono: ['ui-monospace', '"SF Mono"', 'monospace']
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }]
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px'
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
        md: '0 2px 8px rgba(0, 0, 0, 0.06)',
        lg: '0 4px 16px rgba(0, 0, 0, 0.08)'
      },
      spacing: {
        touch: '48px'
      },
      minWidth: {
        touch: '48px'
      },
      minHeight: {
        touch: '48px'
      }
    }
  },
  plugins: []
};
