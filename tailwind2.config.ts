import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
	content: ['./src/*/.{html,js,svelte,ts}'],
	theme: {
		container: {
			center: true,
			padding: '2rem'
		},
		extend: {
			colors: {
				border: 'oklch(var(--p) / <alpha-value>)',
				input: 'oklch(var(--s) / <alpha-value>)',
				ring: 'oklch(var(--in) / <alpha-value>)',
				background: 'oklch(var(--b1) / <alpha-value>)',
				foreground: 'oklch(var(--bc) / <alpha-value>)',
				primary: {
					DEFAULT: 'oklch(var(--p) / <alpha-value>)',
					foreground: 'oklch(var(--pc) / <alpha-value>)'
				},
				secondary: {
					DEFAULT: 'oklch(var(--s) / <alpha-value>)',
					foreground: 'oklch(var(--sc) / <alpha-value>)'
				},
				destructive: {
					DEFAULT: 'oklch(var(--er) / <alpha-value>)',
					foreground: 'oklch(var(--erc) / <alpha-value>)'
				},
				muted: {
					DEFAULT: 'oklch(var(--n) / <alpha-value>)',
					foreground: 'oklch(var(--nc) / <alpha-value>)'
				},
				accent: {
					DEFAULT: 'oklch(var(--a) / <alpha-value>)',
					foreground: 'oklch(var(--ac) / <alpha-value>)'
				},
				popover: {
					DEFAULT: 'oklch(var(--b2) / <alpha-value>)',
					foreground: 'oklch(var(--bc) / <alpha-value>)'
				},
				card: {
					DEFAULT: 'oklch(var(--n) / <alpha-value>)',
					foreground: 'oklch(var(--nc) / <alpha-value>)'
				},
				sidebar: {
					DEFAULT: 'oklch(var(--b2) / <alpha-value>)',
					foreground: 'oklch(var(--bc) / <alpha-value>)',
					primary: 'oklch(var(--p) / <alpha-value>)',
					'primary-foreground': 'oklch(var(--pc) / <alpha-value>)',
					accent: 'oklch(var(--a) / <alpha-value>)',
					'accent-foreground': 'oklch(var(--ac) / <alpha-value>)',
					border: 'oklch(var(--in) / <alpha-value>)',
					ring: 'oklch(var(--in) / <alpha-value>)'
				}
			},
			borderRadius: {
				xl: 'calc(var(--radius) + 4px)',
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--bits-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--bits-accordion-content-height)' },
					to: { height: '0' }
				},
				'caret-blink': {
					'0%,70%,100%': { opacity: '1' },
					'20%,50%': { opacity: '0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'caret-blink': 'caret-blink 1.25s ease-out infinite'
			}
		}
	},

	plugins: [daisyui, tailwindcssAnimate],
	daisyui: {
		themes: [
			'bumblebee',
			'light',
			'dark',
			'cupcake',
			'emerald',
			'corporate',
			'synthwave',
			'retro',
			'cyberpunk',
			'valentine',
			'halloween',
			'garden',
			'forest',
			'aqua',
			'lofi',
			'pastel',
			'fantasy',
			'wireframe',
			'black',
			'luxury',
			'dracula',
			'cmyk',
			'autumn',
			'business',
			'acid',
			'lemonade',
			'night',
			'coffee',
			'winter',
			'dim',
			'nord',
			'sunset'
		]
	}
} satisfies Config;