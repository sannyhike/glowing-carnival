/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#18201d',
        cream: '#f7f8f3',
        lime: '#d5f36b',
        coral: '#ff7d68',
      },
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'sans-serif'],
        display: ['Space Grotesk', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 16px 44px rgba(24, 32, 29, 0.08)',
      },
    },
  },
  plugins: [],
}
