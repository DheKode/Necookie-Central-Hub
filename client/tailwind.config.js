/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-highlight': 'rgb(var(--surface-highlight) / <alpha-value>)',
        primary: 'rgb(var(--primary) / <alpha-value>)',
        'text-main': 'rgb(var(--text-main) / <alpha-value>)',
        'text-muted': 'rgb(var(--text-muted) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        nc: {
          primary: 'rgb(var(--primary) / <alpha-value>)',
          accent: 'rgb(var(--accent) / <alpha-value>)',
          bg: 'rgb(var(--background) / <alpha-value>)',
          surface: 'rgb(var(--surface) / <alpha-value>)',
          surfaceElevated: 'rgb(var(--surface-highlight) / <alpha-value>)',
          border: 'rgb(var(--border) / <alpha-value>)',
          text: 'rgb(var(--text-main) / <alpha-value>)',
          muted: 'rgb(var(--text-muted) / <alpha-value>)',
          success: 'rgb(var(--success) / <alpha-value>)',
          warning: 'rgb(var(--warning) / <alpha-value>)',
          error: 'rgb(var(--error) / <alpha-value>)',
        }
      },
      boxShadow: {
        'card': 'var(--card-shadow)',
      }
    },
  },
  plugins: [],
}