/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        muted: 'hsl(240,3.7%,15.9%)',
        background: 'hsl(240,10%,3.9%)',
      }
    },
  },
  plugins: [],
}

