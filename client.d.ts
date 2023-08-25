
declare module 'virtual:files-loader' {
  const demos: Record<string,  import('./src/types').DemoItem[]>

  export default demos
}

declare module 'virtual:files-loader/*' {
  const demos: Record<string,  import('./src/types').DemoItem[]>
  
  export default demos
}