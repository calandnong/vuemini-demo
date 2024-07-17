import pxtorpx from 'postcss-pxtorpx-pro';
import postcssImport from 'postcss-import';
import poscssUrl from 'postcss-url';

const config = {
  syntax: 'postcss-scss',
  parser: 'postcss-scss',
  plugins: [
    pxtorpx({ transform: (x) => x }),
    postcssImport({
      skipDuplicates: true
    }),
    // poscssUrl(),
  ],
};

export default config;
