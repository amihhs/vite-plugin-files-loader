import type { Alias } from 'vite'

export interface FilesLoaderFile {
  type: 'file'
  name: string
  content: string | (() => Promise<{ default: string }>)
  language: string
}

export interface FilesLoaderDir {
  type: 'directory'
  name: string
  children: (FilesLoaderDir | FilesLoaderFile)[]
}

export type FilesLoaderItem = FilesLoaderFile | FilesLoaderDir

export interface FilesLoaderPluginContext extends Required<FilesLoaderPluginOptions> {
  paths: Record<string, string>
  root: string
  alias: Alias[]
}

export interface FilesLoaderPluginOptions {
  /**
   * Relative paths will be based on root
   * @default process.cwd()
   */
  root?: string
  /**
   * ✅Support vite configuration alias
   * ⚠️If paths is string, it will be set to __default in output
   * ⚠️If the path is relative it will be based on root
   * @default {}
   * @example { __default: './src/content', '@components': '@components' }
   */
  paths?: Record<string, string> | string
  /**
   * @default [/^\./]
   */
  exclude?: (string | RegExp)[]
  /**
   * @default ['.html', '.css', '.js', '.ts']
   */
  extensions?: string[]
  /**
   * auto splice file directory, It only takes effect at the first level of subdirectories
   * @default /
   * @example virtual:demo-loader/button  + childrenResolvePath: 'src' => .../button/src/
   * @example virtual:demo-loader/button  + childrenResolvePath: 'demo' => .../button/demo/
   *
   * |- loader path@root(options.paths)
   *  |- button
   *   |- src (childrenResolvePath effect)
   *    |- index.html
   *    |- other
   *      |- src (not effect)
   */
  resolveChildrenBase?: string | ((id: string) => string)
  /**
   * @default true
   * @example virtual:demo-loader/button/basic + (childrenResolvePath: 'src', enableResolveLongChildren: true)
   *  => ...button/src/basic
   */
  enableResolveLongChildren?: boolean

  dynamicImport?: boolean
}
