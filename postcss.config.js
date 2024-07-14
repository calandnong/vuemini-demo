import pxtorpx from 'postcss-pxtorpx-pro';

const config = {
  syntax: 'postcss-scss',
  parser: 'postcss-scss',
  plugins: [pxtorpx({ transform: (x) => x })],
};

export default config;
