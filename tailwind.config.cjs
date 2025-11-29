/** @type {import('tailwindcss').Config} */
// IMPORTANTE: Renomeie este arquivo para 'tailwind.config.cjs'
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'uni-bg': '#09090b',
        'uni-card': '#18181b',
        'uni-border': '#27272a',
        'uni-primary': '#3b82f6',
        'uni-primary-dark': '#2563eb',
        'uni-text': '#f4f4f5',
        'uni-muted': '#a1a1aa',
      },
      backgroundImage: {
        'uni-gradient': 'linear-gradient(to right, #3b82f6, #60a5fa)',
      }
    },
  },
  plugins: [],
}