import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'gn-black': '#0B0A0A',
        'gn-surface': '#161313',
        'gn-surface-light': '#211B1B',
        'gn-border': '#2E2627',
        'gn-border-light': '#3F3435',
        'gn-maroon': '#7A1F25',
        'gn-maroon-dark': '#4A1216',
        'gn-gold': '#F2B91D',
        'gn-ivory': '#F4EFE8',
        'gn-muted': '#9E928A',
      },
      fontFamily: {
        heading: ['var(--font-barlow-condensed)', 'sans-serif'],
        accent: ['var(--font-allura)', 'cursive'],
        sans: ['var(--font-manrope)', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0px',
        none: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        full: '0px',
      },
    },
  },
  plugins: [],
};

export default config;
