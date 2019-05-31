export interface FlruInstance {
  clear(isPartial: boolean): void,
  has(key: string): boolean,
  get(key: string): any,
  set(key: string, value: any): void,
}

export default function (max: number): FlruInstance
