import fs from 'fs';
import path from 'path';
import { scriptTramsform } from './transformers/script-transform.mjs';
import { templateTramsform } from './transformers/template-transform.mjs';
import { cssTramsform } from './transformers/css-transform.mjs';
import { scssTramsform } from './transformers/scss-transform.mjs'
import { shouldInclude } from './helper.mjs';

async function writeFileWithDirs(filePath, content) {
  const dir = path.dirname(filePath);

  await fs.promises.mkdir(dir, { recursive: true });

  fs.writeFileSync(filePath, content, 'utf8');
}

export class TransformManager {
  sourceDir = 'src'
  targetDir = 'dist';
  /**
   * @type {(import('./transform-type').Transform)[]}
   */
  transforms = [];

  /**
   * 
   * @param {import('./transform-type').TransformMannagerOptions} options 
   */
  constructor(options = {}) {
    if (options.targetDir) {
      this.targetDir = options.targetDir;
    }
    if (options.transforms) {
      this.use(...options.transforms);
    }
  }

  /**
   * 
   * @param  {...import('./transform-type').Transform} transforms 
   */
  use(...transforms) {
    this.transforms.push(...transforms);
  }

  /**
   * 
   * @param {string} id 
   */
  async excute(id) {
    for (const transformItem of this.transforms) {
      if (!transformItem.test) return;
      
      if (!shouldInclude(path.resolve(id), transformItem.include, transformItem.exclude)) return;

      // 为字符串的时候，匹配关键词
      if (
        (typeof transformItem.test === 'string' && id.includes(transformItem.test))
        || (transformItem.test instanceof RegExp && transformItem.test.test(id))
      ) {
        const code = fs.readFileSync(id, 'utf-8').toString();
        const result = await transformItem.transform(code, id);
        let destination = id
          .replace(this.sourceDir, this.targetDir);
        if (result.ext) {
          destination = destination.replace(path.extname(id), result.ext);
        }
        await writeFileWithDirs(destination, result.code);
        return;
      }
    }
  }
}


export const transformManager = new TransformManager({
  transforms: [
    scriptTramsform(),
    templateTramsform(),
    cssTramsform(),
    scssTramsform(),
  ],
});
