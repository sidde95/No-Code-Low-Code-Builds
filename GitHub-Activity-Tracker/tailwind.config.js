/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/renderer/**/*.{js,jsx,ts,tsx,html}'
  ],
  theme: {
    extend: {
      colors: {
        'github-dark': '#0d1117',
        'github-card': '#161b22',
        'github-border': '#30363d',
        'github-green': '#3fb950',
        'github-yellow': '#d29922',
        'github-red': '#f85149'
      }
    }
  },
  plugins: []
}
