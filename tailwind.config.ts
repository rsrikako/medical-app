import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7C6AEE',
          container: '#7C6AEE',
          hover: '#5A55C0',
        },
        secondary: {
          DEFAULT: '#006b5f',
          container: '#6df5e1',
          hover: '#005048',
        },
        background: '#f8f9ff',
        surface: {
          DEFAULT: '#F0F1F3',
          dim: '#D1D5DB',
          bright: '#F8F9FF',
          container: {
            lowest: '#FFFFFF',
            low: '#E5EEFF',
            DEFAULT: '#E5EEFF',
            high: '#D1D5DB',
            highest: '#B8C2E7',
          },
        },
        'on-surface': '#0b1c30',
        'on-surface-variant': '#434653',
        outline: {
          DEFAULT: '#737784',
          variant: '#c3c6d5',
        },
        whatsapp: {
          DEFAULT: '#25D366',
          hover: '#1EBE5D',
          dark: '#128C7E',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
      },
      fontFamily: {
        sans: ['Geist', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
      },
    },
  },
  plugins: [],
}
export default config
