import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    webExtension({
      manifest: generateManifest,
      watchFilePaths: ['package.json', 'manifest.json'],
    }),
  ],
});
