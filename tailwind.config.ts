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
          DEFAULT: '#003c90',
          container: '#0f52ba',
          hover: '#002b66',
        },
        secondary: {
          DEFAULT: '#006b5f',
          container: '#6df5e1',
          hover: '#005048',
        },
        background: '#f8f9ff',
        surface: {
          DEFAULT: '#ffffff',
          dim: '#cbdbf5',
          bright: '#f8f9ff',
          container: {
            lowest: '#ffffff',
            low: '#eff4ff',
            DEFAULT: '#e5eeff',
            high: '#dce9ff',
            highest: '#d3e4fe',
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
        sans: ['Inter', 'sans-serif'],
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
