import pkg from './package.json';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';

const plugins = [
  commonjs({
    include: /node_modules/,
  }),
  nodeResolve(),
  nodePolyfills(),
  typescript({
    tsconfig: './tsconfig.build.json',
  }),
];

export default [
  // ES module build for Node
  {
    input: './src/index.ts',
    output: {
      file: pkg.module,
      format: 'esm',
      exports: 'named',
      sourcemap: true,
    },
    plugins,
  },
  // CommonJS build for Node
  {
    input: './src/index.ts',
    output: {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    plugins,
  },
  // ES module build for Browsers
  {
    input: './src/index.browser.ts',
    output: {
      file: pkg.browser[pkg.module],
      format: 'esm',
      exports: 'named',
      sourcemap: true,
    },
    plugins,
  },
  // CommonJS build for Browsers
  {
    input: './src/index.browser.ts',
    output: {
      file: pkg.browser[pkg.main],
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    plugins,
  },
];
