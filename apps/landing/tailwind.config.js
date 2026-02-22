/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        tertiary: 'var(--tertiary)',
        community: {
          calm: {
            DEFAULT: 'var(--community-calm)',
            foreground: 'var(--community-calm-foreground)',
          },
          warm: {
            DEFAULT: 'var(--community-warm)',
            foreground: 'var(--community-warm-foreground)',
          },
          soothing: {
            DEFAULT: 'var(--community-soothing)',
            foreground: 'var(--community-soothing-foreground)',
          },
          heart: {
            DEFAULT: 'var(--community-heart)',
            foreground: 'var(--community-heart-foreground)',
          },
          accent: {
            DEFAULT: 'var(--community-accent)',
            foreground: 'var(--community-accent-foreground)',
          },
        },
      },
      fontFamily: {
        futura: ['Futura', 'sans-serif'],
        kollektif: ['Kollektif', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}

