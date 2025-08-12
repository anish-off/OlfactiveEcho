/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    container: { center: true, padding: '2rem', screens: { '2xl': '1320px' } },
    extend: {
      height: {
        'letter-tall': '1.2em',
        'letter-short': '0.8em',
      },
      translate: {
        'letter-up': '-0.1em',
        'letter-down': '0.2em',
      },
      backgroundImage: {
        'gold-ghost': 'linear-gradient(135deg, rgba(198, 154, 45, 0.1), rgba(184, 134, 11, 0.15), rgba(160, 104, 0, 0.1))',
      },
      
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
      },
      boxShadow: {
        'custom-light': '0 5px 15px rgba(0, 0, 0, 0.08)',
        'custom-hover': '0 8px 25px rgba(0, 0, 0, 0.12)',
      },
      keyframes: {
        'float-slow': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        'fade-in-up': { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        wheel: { '0%': { transform: 'translateY(-6px)', opacity: '0' }, '30%': { opacity: '1' }, '70%': { transform: 'translateY(6px)', opacity: '0' }, '100%': { opacity: '0' } },
      },
      animation: {
        'float-slow': 'float-slow 7s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 1.1s cubic-bezier(.19,1,.22,1) both',
        wheel: 'wheel 2.4s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'custom-ease': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      height: {
        'letter-tall': '1em',
        'letter-short': '0.6em',
      },
      translate: {
        'letter-down': '0.1em',
        'letter-up': '0.05em',
      },
      fontSize: {
        'brand-lg': '10rem', // This is based on the value in Login.jsx: "top-[15%] text-[14rem]"
        'brand-sm': '8rem', // This is based on the value in Login.jsx: "top-[55%] text-[12rem]"
      }
    }
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/line-clamp'),
  ],
};