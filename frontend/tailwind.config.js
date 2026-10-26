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
        // Dark Cinematic Palette
        canvas: '#05070A',
        'canvas-subtle': '#080B0F',
        surface: {
          DEFAULT: '#0D1217',
          card: '#10161C',
          elevated: '#151B22',
          hover: '#181E25',
          well: '#11171D',
        },
        border: {
          DEFAULT: '#252C34',
          subtle: '#1B2027',
          card: '#252D35',
          secondary: '#303840',
          gold: 'rgba(232, 201, 130, 0.30)',
        },
        // Champagne Gold Primary Brand Accent
        gold: {
          DEFAULT: '#E8C982',
          primary: '#E8C982',
          light: '#F5DFA8',
          dark: '#B18D4F',
          soft: 'rgba(232, 201, 130, 0.10)',
          border: 'rgba(232, 201, 130, 0.30)',
          glow: 'rgba(232, 201, 130, 0.12)',
        },
        // Secondary Colors (Data / Semantic)
        status: {
          teal: '#20D3C2',
          success: '#35D07F',
          danger: '#FF5A5F',
          blue: '#5D9CFF',
          purple: '#9B7CFF',
          warning: '#F2B84B',
        },
        content: {
          primary: '#F7F7F5',
          secondary: '#A9B0BA',
          muted: '#68717D',
          gold: '#E8C982',
        },
        // Backwards compatibility mappings
        brand: {
          50: '#fcf8ee',
          100: '#f5dfa8',
          500: '#e8c982',
          600: '#c5a363',
          700: '#b18d4f',
        },
        dark: {
          bg: '#05070A',
          surface: '#0D1217',
          card: '#10161C',
          elevated: '#151B22',
          border: '#252C34',
          'border-hover': 'rgba(232, 201, 130, 0.30)',
          muted: '#A9B0BA',
        }
      },
      fontFamily: {
        sans: ['Inter', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 18px 50px rgba(0, 0, 0, 0.30)',
        'elevated': '0 20px 60px rgba(0, 0, 0, 0.45)',
        'gold-glow': '0 0 24px -4px rgba(232, 201, 130, 0.25)',
        'gold-sm': '0 0 12px -2px rgba(232, 201, 130, 0.20)',
        'inner-subtle': 'inset 0 1px rgba(255, 255, 255, 0.04)',
      }
    },
  },
  plugins: [],
}
