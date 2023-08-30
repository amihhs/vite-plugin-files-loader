# vite-plugin-files-loader

[![npm](https://img.shields.io/npm/v/vite-plugin-files-loader.svg)](https://npmjs.com/package/vite-plugin-files-loader)
![npm](https://img.shields.io/npm/dm/vite-plugin-files-loader)

A vite plugin that reads file content in batches.

Emmmm....

You can use `import.meta.glob` to achieve similar functionality. It can also use `alias` and `{ as: 'raw' }` to import corresponding files. This package may not mean much to you.

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
        FilesLoader({
          paths: './demos',
          resolveChildrenBase: 'src',
          enableResolveLongChildren: true,
        })
      ],
    }
    ```

3. Usage

    ```ts
    /**
     * |-demos
    *    |-button
    *        |-src
    *          |-basic
    *            |-index.html
    */
    import DEMOS from 'virtual:files-loader' // =>  /demos/..
    import BUTTON_DEMOS from 'virtual:files-loader/button' // => /demos/button/src/..
    import BUTTON_BASIC_DEMOS from 'virtual:demo-loader/button/basic' // => /demos/button/src/basic/..

    ```

    > If you want to use dynamicImport option, you can to use the following function to resolve/import the content of the file

    ```ts
    import { resolveImportPaths, resolveImportFiles } from 'vite-plugin-files-loader'
    const demos = resolveImportPaths(DEMOS)
    const childDemos = resolveImportFiles(BUTTON_DEMOS)
    ```

    ```ts
    // virtual:files-loader
    {
      "__default": [
        {
          "name": "button",
          "children": [
            {
              "name": "basic",
              "children": [
                {
                  "name": "index.html",
                  "content": "...",
                  "language": "html"
                }
              ]
            }
          ]
        },
        {
          "name": "index.html",
          "content": "...",
          "language": "html"
        }
      ]
    }
    // virtual:files-loader/button
    [
        {
          "name": "basic",
          "children": [
            {
              "name": "index.html",
              "content": "...",
              "language": "html"
            }
          ]
        }
    ]
    // virtual:demo-loader/button/basic
    [
        {
          "name": "index.html",
          "content": "...",
          "language": "html"
        }
    ]
    ```

## Options

```ts
export interface FilesLoaderPluginOptions {
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
  /**
   * @default false
   * If true, the file content will be imported dynamically, and matched files are by default lazy-loaded via dynamic import and will be split into separate chunks during build
   */
  dynamicImport?: boolean
}
```
