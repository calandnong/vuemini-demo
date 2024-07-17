export interface TransformResult {
  code: string;
  ext?: string;
}

export interface Transform {
  test: RegExp | string;
  transform: (code: string, id: string) => TransformResult;
  include?: string | RegExp | (string | RegExp)[];
  exclude?: string | RegExp | (string | RegExp)[];
}

export interface TransformMannagerOptions {
  targetDir?: string;
  transforms?: Transform[];
}

