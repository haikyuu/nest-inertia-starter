import { defineConfig } from 'vite';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import marko from '@marko/rollup';

export default defineConfig({
  // plugins: [reactRefresh()],
  root: './web',
  build: {
    rollupOptions: {
      plugins: [
        marko(),
        nodeResolve({
          browser: true,
          extensions: ['.js', '.marko'],
        }),
        // NOTE: Marko 4 compiles to commonjs, this plugin is also required.
        commonjs({
          extensions: ['.js', '.marko'],
        }),
        // If using `style` blocks with Marko you must use an appropriate plugin.
        // postcss({
        //   external: true,
        // }),
      ],
    },
  },
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
