// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/pages/**/*.{js,ts,jsx,tsx}",
      "./src/components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: { // <-- Make sure colors are inside extend
        colors: { // <-- And inside colors
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
          background: '#f9fafb', // Your custom background color
          surface: '#ffffff',
          text_primary: '#111827',
          text_secondary: '#6b7280',
        },
        fontFamily: {
           sans: ['Inter', 'sans-serif'],
        },
      },
    },
    plugins: [
       require('@tailwindcss/forms'),
       // Ensure you are using @tailwindcss/postcss in postcss.config.js now
    ],
  }