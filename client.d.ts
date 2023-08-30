
/// <reference types="vite/client" />

declare module 'virtual:files-loader' {
  const demos: Record<string,  import('./dist').FilesLoaderItem[]>

  export default demos
}

declare module 'virtual:files-loader/*' {
  const demos: import('./dist').FilesLoaderItem[]

  export default demos
}

