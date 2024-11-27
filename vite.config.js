import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig(function (_a) {
    var mode = _a.mode;
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    var env = loadEnv(mode, process.cwd(), '');
    // Validate required environment variables
    var requiredEnvVars = [
        'VITE_STRIPE_PUBLISHABLE_KEY',
        'VITE_STRIPE_BASIC_PRICE_ID_MONTHLY',
        'VITE_STRIPE_BASIC_PRICE_ID_YEARLY',
        'VITE_STRIPE_PRO_PRICE_ID_MONTHLY',
        'VITE_STRIPE_PRO_PRICE_ID_YEARLY'
    ];
    var missingEnvVars = requiredEnvVars.filter(function (key) { return !env[key]; });
    if (missingEnvVars.length > 0) {
        console.warn('\nMissing required environment variables:');
        missingEnvVars.forEach(function (key) {
            console.warn("- ".concat(key));
        });
        console.warn('\nPlease check your .env file\n');
    }
    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            port: 5173,
            proxy: {
                '/api': {
                    target: 'http://localhost:3000',
                    changeOrigin: true,
                    secure: false,
                    onError: function (err) {
                        console.error('Proxy error:', err);
                    },
                },
            },
        },
        define: {
            // Ensure import.meta.env has access to all env vars
            'import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify(env.VITE_STRIPE_PUBLISHABLE_KEY),
            'import.meta.env.VITE_STRIPE_BASIC_PRICE_ID_MONTHLY': JSON.stringify(env.VITE_STRIPE_BASIC_PRICE_ID_MONTHLY),
            'import.meta.env.VITE_STRIPE_BASIC_PRICE_ID_YEARLY': JSON.stringify(env.VITE_STRIPE_BASIC_PRICE_ID_YEARLY),
            'import.meta.env.VITE_STRIPE_PRO_PRICE_ID_MONTHLY': JSON.stringify(env.VITE_STRIPE_PRO_PRICE_ID_MONTHLY),
            'import.meta.env.VITE_STRIPE_PRO_PRICE_ID_YEARLY': JSON.stringify(env.VITE_STRIPE_PRO_PRICE_ID_YEARLY),
        },
    };
});
