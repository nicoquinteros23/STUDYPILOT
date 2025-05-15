/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace React {
  interface FormEvent<T = Element> {
    preventDefault(): void
    stopPropagation(): void
    target: EventTarget & T
  }

  interface ChangeEvent<T = Element> {
    target: EventTarget & T
  }
}

interface EventTarget {
  value: string
}

declare module "*.css" {
  const content: { [className: string]: string }
  export default content
}

declare module "*.svg" {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>
  export default content
} 