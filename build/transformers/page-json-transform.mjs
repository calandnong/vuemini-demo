import path from 'path';
import fs from 'fs-extra';
import { getPackageInfo } from 'local-pkg';
import { MINIPROGRAM_NPM_PATH } from '../constants/index.mjs';


const RE_SCOPED = /^(@[^\/]+\/[^@\/]+)(?:@([^\/]+))?(\/.*)?$/;
const RE_NON_SCOPED = /^([^@\/]+)(?:@([^\/]+))?(\/.*)?$/;
function parse(input) {
  const m = RE_SCOPED.exec(input) || RE_NON_SCOPED.exec(input);
  if (!m) {
    return null;
  }
  return {
    name: m[1] || "",
    version: m[2] || "latest",
    path: m[3] || ""
  };
}

async function hasPkg(pkgName) {
  const info = await getPackageInfo(pkgName);
  return !!info;
}

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
    if (!pkgInfo.packageJson.miniprogram) throw new Error('组件库请设置miniprogram字段'); 
    const miniprogramPath = pkgInfo.packageJson.miniprogram;
    const pkgRootPath = path.dirname(pkgInfo.packageJsonPath);
    await fs.copy(path.resolve(pkgRootPath, miniprogramPath), path.resolve(MINIPROGRAM_NPM_PATH, pkgName));
  }
}

/**
 * @param {import('./page-json-transform-types').PageJsonTransfromOptions} options
 * @returns {import('../transform-type').Transform}
 */
export function pageJsonTransform(options = {}) {
  const {
    alias
  } = options;
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
        const pkgPathInfo = parse(componentPath);
        if (pkgPathInfo && (await hasPkg(pkgPathInfo.name))) {
          await addComponentPackage(pkgPathInfo.name);
        }
      }
    },
    async transform(code) {
      /** @type {Record<string, string>} */
      let finalCode = JSON.parse(code);
      const usingComponents = finalCode['usingComponents'] || {};
      for (const key in usingComponents) {
        /** @type {string} */
        let componentPath = usingComponents[key];
        // 获取别名并按长度降序排序，确保更长的别名优先匹配
        const aliasKeys = Object.keys(alias).sort((a, b) => b.length - a.length);
        // 支持alias
        for (let key of aliasKeys) {
          const regex = new RegExp(`^${key}(\\/|$)`);
          if (regex.test(componentPath)) {
            const aliasItem = alias[key];
            componentPath = componentPath.replace(key, aliasItem);
          }
        }
        usingComponents[key] = componentPath;
      }
      return {
        code: JSON.stringify(finalCode, null, 2),
        ext: '.json'
      }
    }
  }
}
