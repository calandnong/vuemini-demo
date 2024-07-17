import fs from 'fs-extra';
import chokidar from 'chokidar';
import { transformManager } from './build/transform.mjs';
import { __PROD__ } from './build/constants/index.mjs';

async function dev() {
  await fs.remove('dist');
  const cb = (filePath) => {
    transformManager.excute(filePath);
  };

  chokidar
    .watch(['src'], {
      ignored: ['**/.{gitkeep,DS_Store}'],
    })
    .on('add', (filePath) => {
      cb(filePath);
    })
    .on('change', (filePath) => {
      cb(filePath);
    });
}

async function prod() {
  await fs.remove('dist');
  const watcher = chokidar.watch(['src'], {
    ignored: ['**/.{gitkeep,DS_Store}'],
  });
  const cb = (filePath) => {
    transformManager.excute(filePath);
  };
  watcher.on('add', (filePath) => {
    cb(filePath);
  });
  watcher.on('ready', () => watcher.close());
}

if (__PROD__) {
  await prod();
} else {
  await dev();
}
