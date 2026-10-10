import { readFile, writeFile } from 'node:fs/promises';

let envText;
try {
  envText = await readFile(new URL('.env', import.meta.url), 'utf8');
} catch {
  console.error('Missing .env. Copy .env.example to .env and set WHATSAPP_BUSINESS_NUMBER.');
  process.exit(1);
}

const setting = envText
  .split(/\r?\n/)
  .map((line) => line.match(/^\s*WHATSAPP_BUSINESS_NUMBER\s*=\s*(.*?)\s*$/)?.[1])
  .find(Boolean);
const whatsappNumber = setting?.replace(/^(['"])(.*)\1$/, '$2');

if (!whatsappNumber || !/^\d{8,15}$/.test(whatsappNumber)) {
  console.error('WHATSAPP_BUSINESS_NUMBER must contain 8–15 digits, including the country code.');
  process.exit(1);
}

const config = `window.DROP_AZEG_CONFIG = Object.freeze({ whatsappNumber: ${JSON.stringify(whatsappNumber)} });\n`;
await writeFile(new URL('config.js', import.meta.url), config, 'utf8');
console.log('Generated ignored config.js from .env.');
