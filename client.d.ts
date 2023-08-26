
declare module 'virtual:files-loader*' {
  const demos: Record<string,  import('./dist').FilesLoaderItem[]>

  export default demos
}

