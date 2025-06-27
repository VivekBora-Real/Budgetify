const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Clean dist directory
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true });
}
fs.mkdirSync(distPath);

// Build with esbuild
esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/index.js',
  external: [
    // Node built-ins
    'crypto',
    'fs',
    'path',
    'http',
    'https',
    'stream',
    'util',
    'url',
    'zlib',
    'events',
    'buffer',
    'querystring',
    'child_process',
    'cluster',
    'dgram',
    'dns',
    'net',
    'os',
    'readline',
    'repl',
    'tls',
    'tty',
    'v8',
    'vm',
    'worker_threads',
    // Dependencies
    'express',
    'mongoose',
    'bcryptjs',
    'jsonwebtoken',
    'cors',
    'helmet',
    'compression',
    'dotenv',
    'express-rate-limit',
    'express-validator',
    'date-fns',
    'bcrypt'
  ],
  sourcemap: true,
  minify: false,
  format: 'cjs',
  loader: {
    '.ts': 'ts'
  }
}).then(() => {
  console.log('Build completed successfully!');
}).catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});