/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        vigor: {
          teal:      '#1a6b5c',
          tealLight: '#2d9e87',
          tealPale:  '#d4ebe5',
          bg:        '#0d4a3e',
          bgDark:    '#0a3830',
          bgLight:   '#e8f4f0',
          accent:    '#3bbfa0',
          card:      'rgba(255,255,255,0.12)',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'mesh-dark':  'radial-gradient(ellipse at 20% 50%, #1a6b5c 0%, #0a3830 40%, #062e24 100%)',
        'mesh-light': 'radial-gradient(ellipse at 60% 40%, #d4ebe5 0%, #b8ddd4 30%, #e8f4f0 100%)',
      },
      animation: {
        'float-slow':   'float 6s ease-in-out infinite',
        'float-medium': 'float 4s ease-in-out infinite 1s',
        'fade-up':      'fadeUp 0.7s ease both',
        'fade-up-delay':'fadeUp 0.7s ease 0.2s both',
        'count':        'countUp 2s ease both',
        'pulse-soft':   'pulseSoft 3s ease-in-out infinite',
        'shimmer':      'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float:      { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
        fadeUp:     { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft:  { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        shimmer:    { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'glow-teal': '0 0 40px rgba(59,191,160,0.25)',
        'card':      '0 8px 32px rgba(0,0,0,0.12)',
        'input':     '0 2px 16px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
}