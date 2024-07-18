import path from 'path';
import { parse } from 'parse-package-name';
import hasPkg from 'has-pkg';
import fs from 'fs-extra';
import { getPackageInfo } from 'local-pkg';
import { MINIPROGRAM_NPM_PATH } from '../constants/index.mjs';

const components = new Set();

/**
 * 编译npm安装的组件
 * @param {string} pkgName 包名称
 * @returns 
 */
async function addComponentPackage(pkgName) {
  // 已导入，不处理
  if (components.has(pkgName)) return;
  // 未导入，则导入
  components.add(pkgName);
  const pkgInfo = await getPackageInfo(pkgName);
  if (pkgInfo) {
    const pkgRootPath = path.dirname(pkgInfo.packageJsonPath);
    fs.copy(pkgRootPath, path.resolve(MINIPROGRAM_NPM_PATH, pkgName));
  }
}

/**
 * @param {import('./page-json-transform-types').PageJsonTransfromOptions} options
 * @returns {import('../transform-type').Transform}
 */
export function pageJsonTransform() {
  return {
    test: /\.json$/,
    async load(code) {
      const pageJson = JSON.parse(code);
      const usingComponents = pageJson['usingComponents'] || {};
      for (const key in usingComponents) {
        /** @type {string} */
        let componentPath = usingComponents[key];
        // 不解析以绝对路径开头
        if (path.isAbsolute(componentPath)) {
          return;
        }
        // 解析是否使用npm包
        const { name: pkgName } = parse(componentPath);
        if (hasPkg(pkgName)) {
          await addComponentPackage(pkgName);
          return;
        }
      }
    }
  }
}
