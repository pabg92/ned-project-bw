import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    container: { 
      center: true, 
      padding: "1rem", 
      screens: { 
        "2xl": "1140px" 
      } 
    },
  	extend: {
  		fontFamily: {
  			'display': 'var(--font-display)',
  			'ui': 'var(--font-ui)',
  			'bebas-neue': ['var(--font-bebas-neue)'],
  			'akrive-grotesk': ['var(--font-akrive-grotesk)'],
  		},
  		lineHeight: {
  			'display-tight': 'var(--lh-display-tight)',
  		},
  		letterSpacing: {
  			'display': 'var(--track-display)',
  		},
  		colors: {
  			// NED Advisor Design System Tokens
  			'ink': 'var(--ink)',
  			'muted': 'var(--muted)',
  			'border': 'var(--border)',
  			'bg': 'var(--bg)',
  			'bg-subtle': 'var(--bg-subtle)',
  			
  			// Blue Family
  			'blue-family-a': 'var(--blue-family-a)',
  			'blue-family-b': 'var(--blue-family-b)',
  			'cta-start': 'var(--cta-start)',
  			'cta-end': 'var(--cta-end)',
  			'about-start': 'var(--about-start)',
  			'about-end': 'var(--about-end)',
  			'hover-start': 'var(--hover-start)',
  			'hover-end': 'var(--hover-end)',
  			
  			// Premium B2B color palette (legacy)
  			'brand': {
  				bg: '#0B1B2B',
  				ink: '#0F172A',
  				muted: '#334155',
  				border: '#E2E8F0',
  			},
  			'surface': {
  				subtle: '#F8FAFC',
  				white: '#FFFFFF',
  			},
  			'accent': {
  				DEFAULT: '#3B82F6',
  				hover: '#2563EB',
  				light: '#EFF6FF',
  			},
  			'support': '#0EA5A7',
  			'focus': '#1D4ED8',
  			// Legacy colors (maintain for backward compatibility)
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		fontSize: {
  			// Typography scale - NED Advisor Design System
  			'h1': ['44px', { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '700' }],
  			'h2': ['36px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '700' }],
  			'h3': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
  			'body': ['17px', { lineHeight: '28px' }],
  			'caption': ['14px', { lineHeight: '20px' }],
  			'overline': ['12px', { lineHeight: '16px', letterSpacing: '0.08em', fontWeight: '600' }],
  		},
  		spacing: {
  			'section': '96px',
  			'section-bottom': '72px',
  		},
  		backgroundImage: {
  			// NED Advisor Design System Gradients
  			'nav-grad': 'var(--nav-grad)',
  			'testi-grad-dark': 'var(--testi-grad-dark)',
  			'footer-grad': 'var(--footer-grad)',
  			'tertiary-grad': 'var(--tertiary-grad)',
  			'stats-grad': 'var(--stats-grad)',
  			'textbg-grad': 'var(--textbg-grad)',
  			'awards-grad': 'var(--awards-grad)',
  			'cta-grad': 'var(--cta-grad)',
  			'hover-grad': 'var(--hover-grad)',
  			'about-grad': 'var(--about-grad)',
  			'process-line': 'var(--process-line)',
  		},
  		borderRadius: {
  			'btn': '12px',
  			'card': '12px',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'bounce-slow': {
  				'0%, 100%': {
  					transform: 'translateY(-5%)',
  					animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
  				},
  				'50%': {
  					transform: 'translateY(0)',
  					animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
  				}
  			},
  			fadeIn: {
  				'0%': { opacity: '0', transform: 'translateY(10px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'bounce-slow': 'bounce-slow 3s infinite',
  			'fadeIn': 'fadeIn 0.5s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
