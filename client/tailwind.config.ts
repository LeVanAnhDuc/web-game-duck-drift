import type { Config } from 'tailwindcss'

// Mọi giá trị dưới đây đến từ docs/design-system/asteroids/MASTER.md §0.
// Không thêm màu mới ở đây — sửa MASTER.md trước, rồi mới sửa file này.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#08090F',
        surface: '#13151D',
        hairline: 'rgba(255,255,255,0.10)',
        fg: '#F2F5F9',
        muted: '#98A2B3',
        primary: '#4F7CFF',
        accent: '#FFD166',
        danger: '#F04438',
        power: {
          shield: '#22D3EE',
          rapid: '#FFD166',
          spread: '#A78BFA',
          pierce: '#FB7185',
          life: '#34D399',
        },
      },
      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 8px rgba(79,124,255,0.35)',
        'glow-md': '0 0 16px rgba(79,124,255,0.30)',
        'glow-lg': '0 0 32px rgba(79,124,255,0.25)',
      },
      transitionDuration: {
        DEFAULT: '180ms',
      },
    },
  },
  plugins: [],
}

export default config
