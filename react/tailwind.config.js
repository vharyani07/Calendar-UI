/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0b1220',
        },
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '18px',
      },
      boxShadow: {
        '2xl': '0 12px 30px rgba(0, 0, 0, 0.35)',
      },
    }
  },
  plugins: []
};
