// Builds the whole simulator into ONE self-contained HTML file
// (download/trinity-jv-simulator.html) that opens in any browser with no server.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: { outDir: 'download', emptyOutDir: true },
});
