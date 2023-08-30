import fs from 'node:fs'
import path from 'node:path/posix'
import { RESOLVE_VIRTUAL_MODULE_ID } from './const'
import type { FilesLoaderFile, FilesLoaderItem, FilesLoaderPluginContext } from './types'
import { isString } from './shared'
import { getDirectoryChildrenPath, resolveNormalToChildPath, resolveVirtualToChildPath, toPosix } from './fs'

export function getVirtualModuleContent(id: string, context: FilesLoaderPluginContext) {
  const { paths } = context
  if (!isString(paths) && Object.keys(paths).length === 0)
    return { content: {}, files: [] }

  const isChildren = id.startsWith(RESOLVE_VIRTUAL_MODULE_ID) && id !== RESOLVE_VIRTUAL_MODULE_ID
  if (isChildren)
    return getChildrenModuleContent(id, context)
  else
    return getRootModuleContent(id, context)
}

export function getChildrenModuleContent(id: string, context: FilesLoaderPluginContext) {
  const name = id.replace(RESOLVE_VIRTUAL_MODULE_ID, '').replace(/^\//, '').split('/').pop()
  const childPath = resolveVirtualToChildPath(id, context)
  const children: FilesLoaderItem[] = getDirectoryFabric(childPath, context)

  const content = children

  const files = getFilesPath(children, childPath)
  return {
    content,
    files,
  }
}

export function getRootModuleContent(_id: string, context: FilesLoaderPluginContext) {
  const { paths } = context
  const contents: Record<string, FilesLoaderItem[]> = {}

  for (const key in paths) {
    const dirPath = paths[key]
    const childPaths = getDirectoryChildrenPath(dirPath)
    const children: FilesLoaderItem[] = []
    for (const p of childPaths) {
      let childPath = path.join(dirPath, p)

      if (fs.statSync(childPath).isDirectory()) {
        childPath = resolveNormalToChildPath(childPath, context)
        children.push({
          type: 'directory',
          name: p,
          children: getDirectoryFabric(childPath, context),
        })
        continue
      }

      children.push(getFileContent(childPath, context))
    }
    contents[key] = children
  }

  const files: string[] = []
  for (const key in contents) {
    const items = contents[key]
    files.push(...getFilesPath(items, paths[key]))
  }

  return {
    content: contents,
    files,
  }
}

export function getFileContent(filePath: string, context: FilesLoaderPluginContext): FilesLoaderFile {
  filePath = toPosix(filePath)
  const content = fs.readFileSync(filePath, 'utf-8')
  const ext = filePath.split('.').pop()
  const name = filePath.split('/').pop() || filePath
  const file = {
    type: 'file',
    name,
    content: context.dynamicImport ? `() => import('/@fs/${filePath}?raw')` : content,
    language: ext || '',
  }
  return {
    ...file,
    content: context.dynamicImport ? evalFn(file.content) : file.content,
  } as FilesLoaderFile
}

function evalFn(fn: string) {
  // eslint-disable-next-line no-new-func
  return new Function(`return ${fn}`)()
}

export function getDirectoryFabric(dirPath: string, context: FilesLoaderPluginContext): FilesLoaderItem[] {
  if (!fs.existsSync(dirPath))
    throw new Error(`[vite-plugin-demo] getDirectoryFabric:can not find directory: ${dirPath}`)

  if (!fs.statSync(dirPath).isDirectory())
    throw new Error(`[vite-plugin-demo]  isn't directory: ${dirPath}`)

  const files = fs.readdirSync(dirPath)
  const children: FilesLoaderItem[] = []
  for (const item of files) {
    const itemPath = `${dirPath}/${item}`
    const stat = fs.statSync(itemPath)
    if (stat.isDirectory()) {
      children.push({
        type: 'directory',
        name: item,
        children: getDirectoryFabric(itemPath, context),
      })
    }
    else if (stat.isFile()) {
      const ext = item.split('.').pop()
      if (context.extensions.includes(`.${ext}`)) {
        const content = fs.readFileSync(itemPath, 'utf-8')
        const childItem = {
          type: 'file',
          name: item,
          content: context.dynamicImport ? `() => import('/@fs/${itemPath}?raw')` : content,
          language: ext || '',
        } as const

        children.push({
          ...childItem,
          content: context.dynamicImport ? evalFn(childItem.content) : childItem.content,
        })
      }
    }
  }

  return children
}

export function getFilesPath(items: FilesLoaderItem[], parentPath: string): string[] {
  const files: string[] = []
  for (const item of items) {
    // @ts-expect-error eslint-disable-line @typescript-eslint/ban-ts-comment
    if (item.children) {
      const p = path.join(parentPath, item.name)
      // @ts-expect-error eslint-disable-line @typescript-eslint/ban-ts-comment
      files.push(...getFilesPath(item.children, p))
    }
    else {
      files.push(path.join(parentPath, item.name))
    }
  }
  return files
}
