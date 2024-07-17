import { minimatch } from 'minimatch';

/**
 * 检查给定的值是否匹配某个模式（字符串、正则表达式或路径模式）。
 * @param {string|RegExp} pattern - 要匹配的模式，可以是字符串、正则表达式或路径模式。
 * @param {string} value - 要检查的值。
 * @returns {boolean} 如果值匹配模式，则返回true；否则返回false。
 */
function matchesPattern(pattern, value) {
  console.log(' minimatch(value, pattern)', pattern, value, minimatch(value, pattern));
  if (typeof pattern === 'string') {
      return minimatch(value, pattern);
  } else if (pattern instanceof RegExp) {
      return pattern.test(value);
  }
  return false;
}

/**
* 根据include和exclude规则判断文件路径是否应该被包含。
* @param {string} filePath - 要检查的文件路径。
* @param {string|RegExp|(string|RegExp)[]} [include] - 包含模式，可以是字符串、正则表达式或它们的数组。
* @param {string|RegExp|(string|RegExp)[]} [exclude] - 排除模式，可以是字符串、正则表达式或它们的数组。
* @returns {boolean} 如果文件路径应该被包含，则返回true；否则返回false。
*/
export function shouldInclude(filePath, include, exclude) {
  let includeMatch = true; // 默认包含所有文件
  let excludeMatch = false;

  // 检查包含模式
  if (include) {
      if (Array.isArray(include)) {
          includeMatch = include.some(pattern => matchesPattern(pattern, filePath));
      } else {
          includeMatch = matchesPattern(include, filePath);
      }
  }

  // 检查排除模式
  if (exclude) {
      if (Array.isArray(exclude)) {
          excludeMatch = exclude.some(pattern => matchesPattern(pattern, filePath));
      } else {
          excludeMatch = matchesPattern(exclude, filePath);
      }
  }

  return includeMatch && !excludeMatch;
}