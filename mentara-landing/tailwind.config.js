/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'oklch(0.56 0.1223 127.47)',
          foreground: 'oklch(0.98 0 0)',
        },
        secondary: {
          DEFAULT: 'oklch(0.4 0.0812 92.8)',
          foreground: 'oklch(0.98 0 0)',
        },
        tertiary: 'oklch(0.98 0.0464 124.31)',
        community: {
          calm: {
            DEFAULT: 'oklch(0.85 0.05 180)',
            foreground: 'oklch(0.25 0.08 180)',
          },
          warm: {
            DEFAULT: 'oklch(0.92 0.03 60)',
            foreground: 'oklch(0.35 0.06 60)',
          },
          soothing: {
            DEFAULT: 'oklch(0.88 0.04 280)',
            foreground: 'oklch(0.3 0.07 280)',
          },
          heart: {
            DEFAULT: 'oklch(0.82 0.06 350)',
            foreground: 'oklch(0.4 0.1 350)',
          },
          accent: {
            DEFAULT: 'oklch(0.75 0.08 160)',
            foreground: 'oklch(0.98 0.01 160)',
          },
        },
      },
      fontFamily: {
        futura: ['Futura', 'sans-serif'],
        kollektif: ['Kollektif', 'sans-serif'],
      },
      borderRadius: {
        lg: '1.25rem',
        md: 'calc(1.25rem - 2px)',
        sm: 'calc(1.25rem - 4px)',
      },
    },
  },
  plugins: [],
}

