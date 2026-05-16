import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#05070d',
        panel: '#0b111c',
        line: 'rgba(148, 163, 184, 0.18)',
        signal: '#27d8ff',
        lime: '#b7ff5a',
        ember: '#ffb454',
        rose: '#ff5c8a'
      },
      boxShadow: {
        glow: '0 0 36px rgba(39, 216, 255, 0.17)',
        panel: '0 20px 70px rgba(0, 0, 0, 0.42)'
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)'
      }
    }
  },
  plugins: []
};

export default config;
