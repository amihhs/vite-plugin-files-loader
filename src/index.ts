import process from 'node:process'
import type { ModuleNode, PluginOption, ViteDevServer } from 'vite'
import { PLUGIN_NAME, RESOLVE_VIRTUAL_MODULE_ID, VIRTUAL_MODULE_ID } from './const'
import { getVirtualModuleContent } from './content'
import type { FilesLoaderPluginContext, FilesLoaderPluginOptions } from './types'
import { resolvePath, resolveVirtualToChildPath, toPosix } from './fs'
import { isFunction, isString } from './shared'

export * from './types'

function FilesLoaderPlugin(options: FilesLoaderPluginOptions = {}): PluginOption {
  const {
    root = process.cwd(),
    paths = {},
    exclude = [/^\./],
    extensions = ['.html', '.css', '.js', '.ts'],
    resolveChildrenBase = '/',
    enableResolveLongChildren = true,
  } = options

  const context: FilesLoaderPluginContext = {
    root,
    alias: [],
    paths: isString(paths) ? { __default: paths } : paths,
    exclude,
    extensions,
    resolveChildrenBase,
    enableResolveLongChildren,
  }

  let server: ViteDevServer | undefined
  const map = new Map<string, string[]>()

  function filter(file: string) {
    const { exclude, extensions, paths } = context
    for (const reg of exclude) {
      if (reg instanceof RegExp && reg.test(file))
        return false
      else if (isString(reg) && reg.includes(file))
        return false
    }

    const ext = file.substring(file.lastIndexOf('.'))
    if (!extensions.includes(ext))
      return false

    for (const key in paths) {
      if (file.startsWith(paths[key]))
        return true
    }

    return false
  }

  function affectedModules(file: string) {
    file = toPosix(file)
    const modules: ModuleNode[] = []

    for (const [id, files] of map.entries()) {
      if (files.includes(file) || (id === RESOLVE_VIRTUAL_MODULE_ID && filter(file))) {
        modules.push(server?.moduleGraph.getModuleById(id) as ModuleNode)
        continue
      }
      else if (id === RESOLVE_VIRTUAL_MODULE_ID) {
        continue
      }

      const idResolvePath = resolveVirtualToChildPath(id, context)
      if (file.includes(idResolvePath))
        modules.push(server?.moduleGraph.getModuleById(id) as ModuleNode)
    }
    return modules
  }
  const rootOutsidePaths: string[] = []

  const plugin: PluginOption = {
    name: PLUGIN_NAME,
    configResolved(e) {
      context.root = toPosix(e.root)
      context.alias = e.resolve.alias.filter(i => typeof i.find === 'string').map(i => ({
        ...i,
        replacement: toPosix(i.replacement),
      }))

      const viteRoot = e.root
      const paths: Record<string, string> = isString(options.paths) ? { __default: options.paths } : (options.paths || {})
      for (const key in paths) {
        const path = resolvePath(toPosix(paths[key]), { alias: context.alias, root: context.root })
        paths[key] = path
        if (!path.startsWith(viteRoot))
          rootOutsidePaths.push(path)
      }
      context.paths = paths
    },
    configureServer(_server) {
      server = _server
      const handleFileAddUnlink = (file: string) => {
        const modules = affectedModules(file)

        let reload = false
        modules.forEach((i) => {
          if (i?.file) {
            _server.moduleGraph.onFileChange(i.file)
            reload = true
          }
        })
        reload && _server.ws.send({ type: 'full-reload' })
      }
      server.watcher.add(rootOutsidePaths)
      server.watcher.on('unlink', handleFileAddUnlink)
      server.watcher.on('add', () => _server.ws.send({ type: 'full-reload' }))
    },
    buildStart() {
      map.clear()
    },
    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID || id.startsWith(VIRTUAL_MODULE_ID))
        return RESOLVE_VIRTUAL_MODULE_ID + id.replace(VIRTUAL_MODULE_ID, '')
    },
    load(id) {
      if (id === RESOLVE_VIRTUAL_MODULE_ID || id.startsWith(RESOLVE_VIRTUAL_MODULE_ID)) {
        const { files, content } = getVirtualModuleContent(id, context)
        map.set(id, files)
        return content
      }
    },
    async handleHotUpdate(ctx) {
      if (!filter(ctx.file))
        return
      const modules = affectedModules(ctx.file)

      if (modules.length > 0)
        return [...ctx.modules, ...modules]
    },
  }

  return plugin
}

export default FilesLoaderPlugin
