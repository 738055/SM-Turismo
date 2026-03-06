/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-jakarta)', 'sans-serif'],
      },
      colors: {
        // PALETA FOZ TURISMO SM
        brand: {
          50:  '#FFF0FD',
          100: '#FFD6FA',
          200: '#FFADF5',
          300: '#FF99F0',
          400: '#FF8EEE',
          500: '#FF88ED', // Cor principal
          600: '#E670D4', // Cor hover/botoes fortes
          700: '#C455B5',
          800: '#A03A96',
          900: '#7D2074'
        },
        dark: { 900:'#2C3229', 800:'#3D4537', 700:'#4E5845' }
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(40px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } }
      }
    },
  },
  plugins: [],
}