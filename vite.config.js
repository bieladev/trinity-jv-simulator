import { readPorts } from './.biela/ports.mjs';
const bielaPorts = readPorts();
import { defineConfig } from 'vite'
import { existsSync } from 'node:fs';
const bielaDesignBridgeUrl = new URL('./.biela/vite-design-bridge.mjs', import.meta.url);
const bielaDesignBridge = existsSync(bielaDesignBridgeUrl)
  ? (await import(bielaDesignBridgeUrl.href)).default
  : () => null;
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative asset paths so the build also works from a GitHub Pages subpath.
  base: './',
  plugins: [react(), bielaDesignBridge()],
  server: {
    host: true,
    allowedHosts: true,
    port: bielaPorts.web
  }
})