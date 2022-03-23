import process from 'process';
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { copy } from 'fs-extra';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import cssModulesPlugin from 'esbuild-css-modules-plugin';
import { build } from 'esbuild';

import env from './src/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const transformEnv = (env) => {
  if (env === 'undefined' || env === 'null') return env;
  return env ? `'${env}'` : 'undefined';
};

const define = Object.keys(env).reduce((acc, val) => {
  return { ...acc, [`process.env.${val}`]: transformEnv(env[val]) };
}, {});

const compile = (production = false) =>
  build({
    entryPoints: ['src/main.tsx'],
    target: 'es2020',
    bundle: true,
    minify: production,
    sourcemap: production,
    loader: {
      '.png': 'dataurl',
      '.jpg': 'dataurl',
    },
    outfile: 'dist/index.js',
    define: {
      ...define,
      global: 'globalThis',
    },
    plugins: [
      cssModulesPlugin(),
      NodeGlobalsPolyfillPlugin({
        process: true,
        buffer: true,
      }),
      NodeModulesPolyfillPlugin(),
    ],
  });

const copyIndexHtml = async () => {
  const html = await fs.readFile(join(__dirname, 'index.html'), 'utf8');
  const transformed = html
    .split('\n')
    .map((line) => {
      if (
        line.includes('<script type="module" src="/src/main.tsx"></script>')
      ) {
        line = '  <script type="module" crossorigin src="/index.js"></script>';
      }
      return line;
    })
    .join('\n');
  await fs.writeFile(join(__dirname, 'dist/index.html'), transformed, 'utf8');
};

const copyPublicAssets = async () => {
  await copy(join(__dirname, 'public'), join(__dirname, 'dist'));
};

const main = async () => {
  const production = process.env.NODE_ENV === 'production';
  if (production) {
    process.stdout.write('Building Production Bundle\n');
  } else {
    process.stdout.write('Building Development Bundle\n');
  }
  await compile(production);
  await copyIndexHtml();
  await copyPublicAssets();
};

main().catch((error) => process.stderr.write(error.message));
