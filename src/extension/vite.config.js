import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'vite';
import webExtension, { readJsonFile } from 'vite-plugin-web-extension';

const manifest = readJsonFile('src/manifest.json');
const pkg = readJsonFile('package.json');

function humanize(str) {
  return str.split('-')
    .map((s) => s.charAt(0)
      .toUpperCase() + s.slice(1))
    .join(' ');
}

function generateManifest() {
  return {
    ...manifest,
    name: humanize(pkg.name),
    description: pkg.description,
    version: pkg.version,
  };
}

function assertNoDevArtifacts(distDir = 'dist') {
  const badPatterns = [/localhost:5173/, /@vite\/client/, /src\/popup\.ts/];
  const filesToCheck = [];

  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (fullPath.endsWith('.html') || fullPath.endsWith('.js') || fullPath.endsWith('.json')) {
        filesToCheck.push(fullPath);
      }
    }
  };

  walk(distDir);

  for (const file of filesToCheck) {
    const content = readFileSync(file, 'utf8');
    if (badPatterns.some((pattern) => pattern.test(content))) {
      throw new Error(`Dev artifact leak detected in ${file}. Rebuild with production settings before publishing.`);
    }
  }
}

const verifyExtensionDistPlugin = {
  name: 'verify-extension-dist',
  closeBundle() {
    assertNoDevArtifacts('dist');
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    svelte(),
    webExtension({
      manifest: generateManifest,
      watchFilePaths: ['package.json', 'manifest.json'],
    }),
    verifyExtensionDistPlugin,
  ],
});
