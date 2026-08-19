/** @type {import('tailwindcss').Config} */
export default {
 content: [
   './src/app/**/*.{js,ts,tsx,jsx}',
   './src/components/**/*.{js,ts,tsx,jsx}',
   './src/lib/**/*.{js,ts,tsx,jsx}',
 ],
 theme: {
   extend: {
     fontFamily: {
       sans: ['Inter', 'system-ui', 'sans-serif'],
     },
     colors: {
       brand: {
         50: '#f0f0ff',
         100: '#e0e0ff',
         200: '#c4c4ff',
         300: '#a0a0ff',
         400: '#8080ff',
         500: '#6060ff',
         600: '#4040dd',
         700: '#2020aa',
         800: '#101088',
         900: '#080860',
       },
       warm: {
         100: '#faf8f0',
         200: '#fdf6ec',
         300: '#fef0e0',
         400: '#fcd6b5',
         500: '#fed7aa',
         600: '#fdba74',
         700: '#f59e0b',
         800: '#d97706',
         900: '#b45309',
       },
     },
   },
 },
 plugins: [require('autoprefixer')()],
} as any;