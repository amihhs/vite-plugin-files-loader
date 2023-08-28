import fs from 'node:fs'
import path from 'node:path/posix'
import type { FilesLoaderPluginContext } from './types'
import { RESOLVE_VIRTUAL_MODULE_ID } from './const'
import { isFunction } from './shared'

export function toPosix(path: string): string {
  return path.replace(/\\/g, '/')
}

export function getDirectoryChildrenPath(dirPath: string): string[] {
  if (!fs.existsSync(dirPath))
    throw new Error(`[vite-plugin-demo] getDirectoryChildrenPath:can not find directory: ${dirPath}`)

  if (!fs.statSync(dirPath).isDirectory())
    throw new Error(`[vite-plugin-demo]  isn't directory: ${dirPath}`)
  const files = fs.readdirSync(dirPath)
  return files
}

export function resolvePath(filePath: string, context: Pick<FilesLoaderPluginContext, 'alias' | 'root'>): string {
  const { alias, root } = context

  let newFilePath = filePath
  if (filePath.startsWith('./') || filePath.startsWith('../') || filePath.startsWith('/')) {
    newFilePath = path.join(root, filePath)
  }
  else {
    const aliasItem = alias.find(i => filePath.startsWith(i.find as string))
    if (aliasItem)
      newFilePath = filePath.replace(aliasItem.find, aliasItem.replacement)
    else
      throw new Error(`[vite-plugin-demo] can not resolve path: ${filePath}`)
  }

  return newFilePath
}

/**
 * Parse subpaths from virtual filepaths
 * @param id virtual filepaths
 * @param context  plugin context
 */
export function resolveVirtualToChildPath(id: string, context: Pick<FilesLoaderPluginContext, 'paths' | 'resolveChildrenBase' | 'enableResolveLongChildren'>): string {
  const { paths, enableResolveLongChildren } = context
  const childPath = toPosix(id.replace(RESOLVE_VIRTUAL_MODULE_ID, ''))

  let resolveChildrenBase = (isFunction(context.resolveChildrenBase) ? context.resolveChildrenBase(id) : context.resolveChildrenBase) || ''

  if (resolveChildrenBase.startsWith('/'))
    resolveChildrenBase = resolveChildrenBase.slice(1)

  const childPaths = childPath.split('/').filter(i => i)
  if (childPaths.length === 1) {
    if (Object.keys(paths).length === 1 && paths.__default)
      return path.join(paths.__default, childPath, resolveChildrenBase)

    for (const key in paths) {
      if (childPath.startsWith(key))
        return path.join(paths[key], childPath.replace(new RegExp(`^${key}`), ''), resolveChildrenBase)
    }
  }
  else if (enableResolveLongChildren) {
    if (Object.keys(paths).length === 1 && paths.__default) {
      const dirName = childPaths.shift() as string
      const otherPath = childPaths.join('/')
      if (otherPath.startsWith(resolveChildrenBase))
        return path.join(paths.__default, dirName, otherPath)
      else
        return path.join(paths.__default, dirName, resolveChildrenBase, otherPath)
    }

    const key = childPaths.shift() as string
    for (const k in paths) {
      if (key === k) {
        const dirName = childPaths.shift() as string
        const otherPath = childPaths.join('/')
        if (otherPath.startsWith(resolveChildrenBase))
          return path.join(paths[k], dirName, otherPath)
        else
          return path.join(paths[k], dirName, resolveChildrenBase, otherPath)
      }
    }
  }
  else {
    const key = childPaths.shift() as string
    if (Object.keys(paths).length === 1 && paths.__default && key === paths.__default)
      return path.join(paths.__default, childPaths.join('/'))

    for (const k in paths) {
      if (key === k)
        return path.join(paths[k], childPaths.join('/'))
    }
  }

  throw new Error(`[vite-plugin-demo] can not resolve child path: ${childPath}, id: ${id}`)
}

/**
 * Parse subpaths from normal filepaths
 * @param normalPath
 * @param context
 *
 * e.g. /a/b/c => /a/b/c/src(this is resolveChildrenBase)
 */
export function resolveNormalToChildPath(normalPath: string, context: Pick<FilesLoaderPluginContext, 'paths' | 'resolveChildrenBase'>): string {
  normalPath = toPosix(normalPath)

  const { paths } = context

  let resolveChildrenBase = (isFunction(context.resolveChildrenBase)
    ? context.resolveChildrenBase(normalPath)
    : context.resolveChildrenBase)
    || ''

  if (resolveChildrenBase.startsWith('/'))
    resolveChildrenBase = resolveChildrenBase.slice(1)

  if (Object.keys(paths).length === 1 && paths.__default && normalPath.startsWith(paths.__default))
    return path.join(normalPath, resolveChildrenBase)

  for (const key in paths) {
    const alias = paths[key]
    if (normalPath.startsWith(alias))
      return path.join(normalPath, resolveChildrenBase)
  }

  throw new Error(`[vite-plugin-demo] Unexpected file/folder path: ${normalPath}`)
}
