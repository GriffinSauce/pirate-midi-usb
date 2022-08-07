import pkg from './package.json';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { visualizer } from 'rollup-plugin-visualizer';

const basePlugins = [
  commonjs({
    include: /node_modules/,
  }),
  nodeResolve(),
  typescript({
    tsconfig: './tsconfig.build.json',
  }),
  process.env.ANALYSE_BUNDLE && visualizer(),
];

const browserPlugins = [...basePlugins, nodePolyfills()];

const nodeExternals = [
  '@serialport/bindings-cpp',
  '@serialport/parser-regex',
  'serialport',
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
    plugins: basePlugins,
    external: nodeExternals,
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
    plugins: basePlugins,
    external: nodeExternals,
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
    plugins: browserPlugins,
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
    plugins: browserPlugins,
  },
];
