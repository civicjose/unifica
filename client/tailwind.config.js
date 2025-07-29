// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Aquí definimos tu paleta de colores
      colors: {
        'primary': '#e5007e', // Magenta
        'secondary': '#6c3b5d', // Morado
        'accent-1': '#6bcbb8', // Verde agua
        'accent-2': '#00bed6', // Cian
      },
    fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}