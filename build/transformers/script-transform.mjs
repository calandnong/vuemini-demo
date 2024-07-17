import path from 'node:path';
import babel from '@babel/core';
import traverse from '@babel/traverse';
import t from '@babel/types';
import { minify } from 'terser';
import { rollup } from 'rollup';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { NODE_ENV, __PROD__ } from '../constants/index.mjs';


const terserOptions = {
  ecma: 2016,
  toplevel: true,
  safari10: true,
  format: { comments: false },
};

const bundledModules = new Set();
async function bundleModule(module) {
  if (bundledModules.has(module)) return;
  bundledModules.add(module);

  const bundle = await rollup({
    input: module,
    plugins: [
      commonjs(),
      replace({
        preventAssignment: true,
        values: {
          'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
        },
      }),
      resolve(),
      __PROD__ && terser(terserOptions),
    ].filter(Boolean),
  });
  bundle.write({
    exports: 'named',
    file: `dist/miniprogram_npm/${module}/index.js`,
    format: 'cjs',
  });
}

/**
 * @returns {import('./transform-type').Transform}
 */
export function scriptTramsform() {
  return {
    test: /\.ts$/,
    async transform(_, id){
      let { ast, code } = await babel.transformFileAsync(path.resolve(id), {
        ast: true,
      });

      if (id.endsWith('app.ts')) {
        /**
         * IOS 小程序 Promise 使用的内置的 Polyfill，但这个 Polyfill 有 Bug 且功能不全，
         * 在某些情况下 Promise 回调不会执行，并且不支持 Promise.prototype.finally。
         * 这里将全局的 Promise 变量重写为自定义的 Polyfill，如果你不需要兼容 iOS10 也可以使用以下方式：
         * Promise = Object.getPrototypeOf((async () => {})()).constructor;
         * 写在此处是为了保证 Promise 重写最先被执行。
         */
        code = code.replace(
          '"use strict";',
          '"use strict";\n\nvar PromisePolyfill = require("promise-polyfill");\nPromise = PromisePolyfill.default;',
        );
        bundleModule('promise-polyfill');
      }
    
      traverse.default(ast, {
        CallExpression({ node }) {
          if (
            node.callee.name !== 'require' ||
            !t.isStringLiteral(node.arguments[0]) ||
            node.arguments[0].value.startsWith('.')
          ) {
            return;
          }
    
          bundleModule(node.arguments[0].value);
        },
      });
    
      if (__PROD__) {
        code = (await minify(code, terserOptions)).code;
      }

      return {
        code,
        ext: '.js'
      }
    },
  }
}
