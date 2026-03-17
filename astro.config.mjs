import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'node:path';

export default defineConfig({
  output: 'static',
  vite: {
    resolve: {
      alias: {
        "@components": path.resolve("./src/components"),
        "@assets": path.resolve("./src/assets"),
        "@layouts": path.resolve("./src/layouts"),
         "@stores": path.resolve("./src/stores"),
      },
    },
    plugins: [
      tailwindcss(),
      viteStaticCopy({
        targets: [
          {
            src: "src/assets/images",
            dest: "assets",
          },
        ],
        hook: 'writeBundle', 
      }),
    ],
    server: {
      allowedHosts: ['.ngrok-free.app'],
    },
  },
});
