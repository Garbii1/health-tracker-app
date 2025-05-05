/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // --- PASTE YOUR CUSTOM THEME EXTENSIONS BACK IN ---
      colors: {
        primary: {
          light: '#6ee7b7',
          DEFAULT: '#10b981',
          dark: '#047857',
        },
        secondary: {
          light: '#93c5fd',
          DEFAULT: '#3b82f6',
          dark: '#1d4ed8',
        },
        background: '#f9fafb',
        surface: '#ffffff',
        text_primary: '#111827',
        text_secondary: '#6b7280',
      },
      fontFamily: {
         sans: ['Inter', 'sans-serif'], // Or your chosen font
      },
      // --- END OF CUSTOM THEME ---
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Add forms plugin back if needed
  ],
}