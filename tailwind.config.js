/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bharat: {
          saffron: '#FF9933',
          white: '#FFFFFF',
          green: '#138808',
          navy: '#000080',
          dark: '#0B132B',
          accent: '#4A90E2',
        }
      }
    },
  },
  plugins: [],
}
