/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#0d1117',
        surface:  '#161b22',
        surface2: '#21262d',
        border:   '#30363d',
        muted:    '#8b949e',
        dim:      '#484f58',
        accent:   '#58a6ff',
        green:    '#3fb950',
        red:      '#f85149',
        yellow:   '#d29922',
        purple:   '#a371f7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
