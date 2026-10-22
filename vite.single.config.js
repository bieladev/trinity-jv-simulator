// Builds the whole simulator into ONE self-contained HTML file
// (download/trinity-jv-simulator.html) that opens in any browser with no
// server and no internet connection: scripts, styles and fonts are inlined.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Swap the Google Fonts links for locally bundled copies of the same fonts.
const embedFonts = () => ({
  name: 'embed-fonts',
  // 'pre' so Vite still bundles the injected stylesheet (and inlines its fonts).
  transformIndexHtml: {
    enforce: 'pre',
    transform: (html) => html
      .replace(/\s*<link[^>]*fonts\.(googleapis|gstatic)\.com[^>]*>/g, '')
      // The platform's broken-image guard points at an online placeholder; the
      // simulator has no images, so it is dropped from the offline file.
      .replace(/\s*<!-- Biela: broken-image fallback[\s\S]*?<script data-biela-img-guard="1">[\s\S]*?<\/script>/, '')
      .replace('</head>', '  <link rel="stylesheet" href="/src/offline-fonts.css">\n  </head>'),
  },
});

export default defineConfig({
  plugins: [react(), embedFonts(), viteSingleFile()],
  build: { outDir: 'download', emptyOutDir: true, assetsInlineLimit: 100000000 },
});
