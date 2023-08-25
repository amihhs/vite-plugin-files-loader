# vite-plugin-loader-files

## Usage

1. NPM Install  

    ```bash
    npm i vite-plugin-files-loader -D
    ```

2. Vite Config

    ```js
    // vite.config.js
    import FilesLoader from 'vite-plugin-files-loader'

    export default {
      plugins: [
        FilesLoader()
      ],
    }
    ```

## Options

```ts
export interface DemoLoaderPluginOptions {
  /**
   * Relative paths will be based on root
   * @default process.cwd()
   */
  root?: string
  /**
   * ✅ Support vite configuration alias
   * ⚠️ If paths is string, it will be set to __default in output
   * ⚠️ If the path is relative it will be based on root
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
}
```
