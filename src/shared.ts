import type { FilesLoaderItem } from './types'

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isFunction(value: unknown): value is (...args: any) => any {
  return typeof value === 'function'
}

export async function resolveImportPaths(data: Record<string, FilesLoaderItem[]>) {
  const newData: Record<string, FilesLoaderItem[]> = Object.assign({}, data)
  for (const key in newData) {
    const items = newData[key]
    newData[key] = await resolveImportFiles(items)
  }
  return newData
}

export async function resolveImportFiles(data: FilesLoaderItem[]) {
  const newData: FilesLoaderItem[] = [...data]
  for (const index in newData) {
    const item = newData[index]
    if (item.type === 'file')
      item.content = typeof item.content === 'function' ? (await item.content()).default : item.content

    else
      item.children = await resolveImportFiles(item.children)
  }
  return newData
}
