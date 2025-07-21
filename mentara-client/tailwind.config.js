/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        'community-calm': 'oklch(var(--community-calm) / <alpha-value>)',
        'community-warm': 'oklch(var(--community-warm) / <alpha-value>)',
        'community-soothing': 'oklch(var(--community-soothing) / <alpha-value>)',
        'community-heart': 'oklch(var(--community-heart) / <alpha-value>)',
        'community-accent': 'oklch(var(--community-accent) / <alpha-value>)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "gentle-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 5px oklch(var(--community-calm) / 0.3)" 
          },
          "50%": { 
            boxShadow: "0 0 15px oklch(var(--community-calm) / 0.5)" 
          },
        },
        "heart-beat": {
          "0%": { transform: "scale(1)" },
          "14%": { transform: "scale(1.2)" },
          "28%": { transform: "scale(1)" },
          "42%": { transform: "scale(1.2)" },
          "70%": { transform: "scale(1)" },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "loading-pulse": {
          "0%, 100%": { 
            opacity: "1",
            transform: "scale(1)",
          },
          "50%": { 
            opacity: "0.8",
            transform: "scale(1.02)",
          },
        },
        "slide-progress": {
          "0%": { 
            width: "0%",
            opacity: "0",
          },
          "10%": {
            opacity: "1",
          },
          "100%": { 
            width: "100%",
            opacity: "1",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gentle-glow": "gentle-glow 3s ease-in-out infinite",
        "heart-beat": "heart-beat 1.5s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite linear",
        "loading-pulse": "loading-pulse 2s ease-in-out infinite",
        "slide-progress": "slide-progress 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
      },
      backgroundImage: {
        'community-gradient': 'linear-gradient(135deg, oklch(var(--community-warm) / 0.1), oklch(var(--community-calm) / 0.1))',
        'community-soothing-gradient': 'linear-gradient(45deg, oklch(var(--community-soothing) / 0.1), oklch(var(--community-accent) / 0.1))',
      }
    },
  },
};
