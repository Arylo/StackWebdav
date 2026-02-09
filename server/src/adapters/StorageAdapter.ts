export type ListEntry = { path: string; isDirectory: boolean }

export type StatEntry = {
  exists: boolean
  isDirectory: boolean
  size?: number
  mtime?: number
}

export interface StorageAdapter {
  list(path: string): Promise<ListEntry[]>
  stat(path: string): Promise<StatEntry>
  read(path: string): Promise<Uint8Array>
  write(path: string, data: Uint8Array): Promise<void>
  delete(path: string): Promise<void>
  mkdir(path: string): Promise<void>
  move(src: string, dest: string): Promise<void>
  copy(src: string, dest: string): Promise<void>
}
