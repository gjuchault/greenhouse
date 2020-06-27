declare module '*.css'
declare module '*.svg' {
  const content: string
  export default content
}

declare const date: Date

declare const emitterSensors: Map<
  string,
  {
    value: string
    lastSentAt: string
    source: string
  }
>

declare const actionables: Map<
  string,
  {
    value: string
    lastSentAt: string
  }
>
