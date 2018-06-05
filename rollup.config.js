import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-re'
import pkg from './package.json'

export default [
  // browser-friendly UMD build
  {
    input: 'src/index.js',
    output: {
      file: pkg.browser,
      format: 'umd',
      name: 'OpenKnowledge',
    },
    plugins: [
      resolve({
        preferBuiltins: true,
        browser: true,
        extensions: ['.js', '.json', '.node']
      }),
      replace({
        patterns: [
          {
            include: 'node_modules/ldf-client/ldf-client.js',
            test: 'require = function (path) { return function () { return require(path); } };',
            replace: ''
          },
          {
            include: 'node_modules/ldf-client/ldf-client.js',
            test: 'require = globalRequire;',
            replace: ''
          },
          {
            include: 'node_modules/n3/N3.js',
            test: 'require = function () {};',
            replace: ''
          },
        ]
      }),
      commonjs(),
      json(),
      babel({
        runtimeHelpers: true,
        exclude: ['node_modules/**', '**/*.json']
      })
    ]
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // the `targets` option which can specify `dest` and `format`)
  {
    input: 'src/index.js',
    external: [],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ],
    plugins: [
      json(),
      babel({
        runtimeHelpers: true,
        exclude: ['node_modules/**']
      })
    ]
  }
]
