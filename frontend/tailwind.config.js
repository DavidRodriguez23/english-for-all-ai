/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep midnight background
        night: {
          950: '#0F0E17',
          900: '#16151F',
          800: '#1E1D2A',
          700: '#252435',
          600: '#2E2D3E',
        },
        // Electric violet — brand primary
        violet: {
          400: '#9D8DF1',
          500: '#6C63FF',
          600: '#5A52E0',
        },
        // Warm coral — accents and highlights
        coral: {
          400: '#FF8C69',
          500: '#FF6B47',
        },
        // Mint — success and positive feedback
        mint: {
          400: '#4ECDC4',
          500: '#3DBDB5',
        },
        // Text
        cloud: {
          100: '#FFFFFE',
          200: '#E8E8F0',
          400: '#A8A8B8',
          600: '#6B6B80',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'typing': 'typing 1.2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    }
  },
  plugins: []
}
