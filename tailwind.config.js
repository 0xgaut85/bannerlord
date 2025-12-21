/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        gold: '#c9a962',
        silver: '#A8A9AD',
        bronze: '#CD7F32',
      },
    },
  },
  plugins: [],
}


