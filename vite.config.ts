import { defineConfig } from 'vite';

export default defineConfig({
  // plugins: [reactRefresh()],
  root: './web',
  // build: {
  //   manifest: true,
  //   rollupOptions: {
  //     input: './src/app/main.tsx',
  //   },
  // },
  optimizeDeps: {
    // https://npm.runkit.com/glob-to-regexp
    exclude: /^.*$/,
    include: [
      'react',
      'react-dom',
      '@inertiajs/inertia-react',
      '@inertiajs/inertia',
    ],
  },
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'http://localhost:3004',
  //       // changeOrigin: true
  //     },
  //   },
  // },
});
