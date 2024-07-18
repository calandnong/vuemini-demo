
import postcss from 'postcss';
import postcssrc from 'postcss-load-config';

/**
 * @returns {import('../transform-type').Transform}
 */
export function cssTramsform() {
  return {
    test: /\.css$/,
    async transform(code) {
      const { plugins, options } = await postcssrc({ from: undefined });
      const { css } = await postcss(plugins).process(code, options);

      return {
        code: css,
        ext: '.wxss'
      }
    }
  }
}