// const { createGlobPatternsForDependencies } = require('@nx/next/tailwind');

// The above utility import will not work if you are using Next.js' --turbo.
// Instead you will have to manually add the dependent paths to be included.
// For example
// ../libs/buttons/**/*.{ts,tsx,js,jsx,html}',                 <--- Adding a shared lib
// !../libs/buttons/**/*.{stories,spec}.{ts,tsx,js,jsx,html}', <--- Skip adding spec/stories files from shared lib

// If you are **not** using `--turbo` you can uncomment both lines 1 & 19.
// A discussion of the issue can be found: https://github.com/nrwl/nx/issues/26510

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    //     ...createGlobPatternsForDependencies(__dirname)
  ],
  theme: {
    extend: {
      colors: {
        mentara: {
          surface: '#EDF1D6',
          accent: '#9DC08B',
          primary: '#609966',
          deep: '#40513B',
        },
      },
      backdropBlur: {
        mentara: '12px',
      },
      borderRadius: {
        mentara: '24px',
      },
      boxShadow: {
        'mentara-glass': '0 8px 32px 0 rgba(64, 81, 59, 0.1)',
      },
      fontFamily: {
        mentara: ['var(--font-outfit)', 'var(--font-quicksand)', 'sans-serif'],
        sans: ['var(--font-outfit)', 'var(--font-quicksand)', 'ui-sans-serif', 'system-ui'],
      },
      animation: {
        'slow-flow': 'slow-flow 60s ease infinite',
        'pulse-mentara': 'pulse-mentara 3s ease-in-out infinite',
      },
      keyframes: {
        'slow-flow': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'pulse-mentara': {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.05)', 'box-shadow': '0 0 20px #609966' },
        },
      },
    },
  },
  plugins: [],
};
