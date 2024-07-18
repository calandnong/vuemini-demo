import path from "path";

export const NODE_ENV = process.env.NODE_ENV || 'production';
export const __PROD__ = NODE_ENV === 'production';

export const DIST_PATH = path.resolve('dist');

export const MINIPROGRAM_NPM_PATH = path.resolve(DIST_PATH, './miniprogram_npm')