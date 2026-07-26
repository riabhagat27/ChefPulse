/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#111111",
        surface: "#1A1A1A",
        primary: "#D4AF37",
        secondary: "#C28A2C",
        'primary-text': "#F5F5F5",
        'secondary-text': "#C8C8C8",
        'border-color': "#333333",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      borderRadius: {
        'card': '18px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
      }
    },
  },
  plugins: [],
}
