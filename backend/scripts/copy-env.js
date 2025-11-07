import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const env = process.argv[2] || 'development';
const source = join(projectRoot, `.env.${env}`);
const dest = join(projectRoot, '.env');

try {
    if (!existsSync(source)) {
        console.error(`Error: Source file ${source} does not exist`);
        process.exit(1);
    }
    
    copyFileSync(source, dest);
    console.log(`Successfully copied ${source} to ${dest}`);
} catch (err) {
    console.error(`Error copying ${source} to ${dest}:`, err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
}