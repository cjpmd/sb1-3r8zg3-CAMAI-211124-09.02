import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '.env.local') });

console.log('Key length:', process.env.STRIPE_SECRET_KEY.length);
console.log('First 7 chars:', process.env.STRIPE_SECRET_KEY.substring(0, 7));
console.log('Last 4 chars:', process.env.STRIPE_SECRET_KEY.substring(process.env.STRIPE_SECRET_KEY.length - 4));
