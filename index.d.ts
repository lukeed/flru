export interface FlruInstance {
  clear(isPartial: boolean): void,
  has(key: string): void,
  get(key: string): void,
  set(key: string, value: any): void,
}

export default function (max: number): FlruInstance
