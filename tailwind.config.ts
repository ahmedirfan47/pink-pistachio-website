import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        pink: {
          50:  '#FDF5F7',
          100: '#FADED9',
          200: '#F5C0CC',
          300: '#ECA0B5',
          400: '#E07B98',
          500: '#CC5078',
          600: '#B03862',
          700: '#8C2A4E',
          800: '#6A1E3A',
          900: '#481428',
        },
        pistachio: {
          50:  '#F4F8F0',
          100: '#E3EDDA',
          200: '#C6DAB7',
          300: '#A5C490',
          400: '#82AE68',
          500: '#6A9652',
          600: '#527842',
          700: '#3E5C32',
        },
        cream: {
          DEFAULT: '#FDF8F2',
          50:  '#FFFDF9',
          100: '#FDF8F2',
          200: '#F7EEE2',
        },
        charcoal: {
          DEFAULT: '#2E2424',
          600:     '#5C4848',
        },
        gold: {
          DEFAULT: '#C9A96E',
          600:     '#A8843A',
        },
        blush: {
          DEFAULT: '#F2D4DD',
          dark:    '#E8B8C8',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans:    ['var(--font-sans)', 'sans-serif'],
      },
      boxShadow: {
        card:   '0 2px 16px 0 rgba(46,36,36,0.07)',
        hover:  '0 8px 30px 0 rgba(46,36,36,0.13)',
        float:  '0 20px 60px -10px rgba(176,56,98,0.20)',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%':      { transform: 'translateY(-14px) rotate(2deg)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },
      animation: {
        fadeUp:    'fadeUp 0.6s ease-out both',
        fadeIn:    'fadeIn 0.4s ease-out both',
        floatSlow: 'floatSlow 7s ease-in-out infinite',
        shimmer:   'shimmer 2s linear infinite',
        slideDown: 'slideDown 0.25s ease-out both',
        pulse:     'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '3xl':   '1.5rem',
        '4xl':   '2rem',
      },
    },
  },
  plugins: [],
};

export default config;