// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        // Define your custom keyframes for the scaling pulse
        'pulse-dot': {
          '0%, 100%': { transform: 'scale(0)' }, // Starts and ends at normal size
          '50%': { transform: 'scale(1.5)' },    // Scales up to 150% in the middle
        },
      },
      animation: {
        // Define a custom animation utility using your keyframes
        'pulse-dot': 'pulse-dot 1.2s infinite ease-in-out', // Name, duration, timing, infinite loop
      },
    },
  },
  plugins: [],
};