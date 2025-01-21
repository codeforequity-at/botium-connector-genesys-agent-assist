import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import copy from 'rollup-plugin-copy'

export default {
  input: 'index.js',
  output: [
    {
      file: 'dist/botium-connector-genesys-agent-assist-es.js',
      format: 'es',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: 'dist/botium-connector-genesys-agent-assist-cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    }
  ],
  external: ['fs', 'path', 'debug', 'lodash'],
  plugins: [
    commonjs({
      exclude: 'node_modules/**'
    }),
    json(),
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true
    }),
    copy({
      targets: [
        { src: 'logo.png', dest: 'dist' }
      ]
    })
  ]
}
