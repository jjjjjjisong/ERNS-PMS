/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // shadcn/ui style muted color palette
                border: "hsl(214.3 31.8% 91.4%)",
                input: "hsl(214.3 31.8% 91.4%)",
                ring: "hsl(221.2 83.2% 53.3%)",
                background: "hsl(0 0% 100%)",
                foreground: "hsl(222.2 84% 4.9%)",
                primary: {
                    DEFAULT: "hsl(221.2 83.2% 53.3%)",
                    foreground: "hsl(210 40% 98%)",
                    50: '#f0f5ff',
                    100: '#e0ebff',
                    200: '#c7d9fe',
                    300: '#a4c0fc',
                    400: '#7b9ef8',
                    500: '#5a7cf2',
                    600: '#4361e6',
                    700: '#364fd3',
                    800: '#2f42ab',
                    900: '#2b3c87',
                },
                secondary: {
                    DEFAULT: "hsl(210 40% 96.1%)",
                    foreground: "hsl(222.2 47.4% 11.2%)",
                },
                muted: {
                    DEFAULT: "hsl(210 40% 96.1%)",
                    foreground: "hsl(215.4 16.3% 46.9%)",
                },
                accent: {
                    DEFAULT: "hsl(210 40% 96.1%)",
                    foreground: "hsl(222.2 47.4% 11.2%)",
                },
                destructive: {
                    DEFAULT: "hsl(0 84.2% 60.2%)",
                    foreground: "hsl(210 40% 98%)",
                },
                card: {
                    DEFAULT: "hsl(0 0% 100%)",
                    foreground: "hsl(222.2 84% 4.9%)",
                },
                surface: {
                    50: '#fafbfc',
                    100: '#f4f6f8',
                    200: '#e9ecf0',
                    300: '#d4dae3',
                    400: '#b3bdcc',
                    500: '#8c99ad',
                    600: '#6b7a94',
                    700: '#566379',
                    800: '#475163',
                    900: '#3c4452',
                    950: '#272d38',
                }
            },
            borderRadius: {
                lg: "0.625rem",
                md: "0.5rem",
                sm: "0.375rem",
            },
            boxShadow: {
                'soft': '0 1px 2px 0 rgb(0 0 0 / 0.03), 0 1px 3px 0 rgb(0 0 0 / 0.05)',
                'soft-md': '0 2px 4px -1px rgb(0 0 0 / 0.04), 0 4px 6px -1px rgb(0 0 0 / 0.06)',
                'soft-lg': '0 4px 6px -2px rgb(0 0 0 / 0.03), 0 10px 15px -3px rgb(0 0 0 / 0.06)',
                'soft-xl': '0 10px 25px -5px rgb(0 0 0 / 0.05), 0 20px 40px -10px rgb(0 0 0 / 0.08)',
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
            },
        },
    },
    plugins: [],
}
