/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
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
      keyframes: {
        slideToggle: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(1.5rem)' },
        },
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        slideToggle: 'slideToggle 0.3s ease-in-out',
        spin: 'rotate 1s linear infinite',
      },
    },
  },
  plugins: [],
}

