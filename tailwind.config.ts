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
        'terminal-bg': 'var(--terminal-bg)',
        'terminal-text': 'var(--terminal-text)',
        'terminal-border': 'var(--terminal-border)',
        'terminal-header': 'var(--terminal-header)',
      },
    },
  },
  plugins: [],
};

export default config; 