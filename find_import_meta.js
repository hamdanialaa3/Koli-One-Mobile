const fs = require('fs');
const path = require('path');

function searchDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (file === '.bin' || file.startsWith('.')) continue; // Skip .bin and hidden

        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            searchDir(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.ts') || file.endsWith('.tsx')) {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                if (content.includes('import.meta')) {
                    console.log(`Found import.meta in: ${fullPath}`);
                }
            } catch (e) {
                // Ignore matching errors
            }
        }
    }
}

console.log('Searching node_modules for import.meta...');
searchDir(path.join(__dirname, 'node_modules'));
console.log('Search complete.');
