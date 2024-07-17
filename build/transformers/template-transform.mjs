/**
 * @returns {import('./transform-type').Transform}
 */
export function templateTramsform() {
  return {
    test: /\.html$/,
    transform(code) {
      return {
        code,
        ext: '.wxml'
      }
    }
  }
}