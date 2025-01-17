
import path from 'path';
import postcss from 'postcss';
import postcssrc from 'postcss-load-config';
import * as sass from 'sass';

/**
 * @returns {import('../transform-type').Transform}
 */
export function scssTramsform() {
  return {
    test: /\.scss$/,
    exclude: [
      `${path.resolve('src/styles')}/**/*.scss`
    ],
    async transform(code, id) {
      const { plugins, options } = await postcssrc({ from: undefined });
      const _code = await sass.compileStringAsync(code, {
        loadPaths: [
          path.dirname(id),
          path.resolve('src'),
        ],
      });
      const { css } = await postcss(plugins).process(_code.css, options);
      return {
        code: css,
        ext: '.wxss'
      }
    }
  }
}