// Type declarations for CSS imports
declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}

// Type declarations for SCSS imports (if needed)
declare module '*.scss' {
  const content: { [className: string]: string }
  export default content
}

// Type declarations for other asset imports
declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.gif' {
  const src: string
  export default src
}

declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.ico' {
  const src: string
  export default src
}