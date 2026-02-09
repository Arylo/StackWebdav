import type { StorageAdapter, ListEntry, StatEntry } from './StorageAdapter'

// Placeholder / sketch for S3 adapter
export class S3Adapter implements StorageAdapter {
  constructor(options: any) {
    // TODO: init S3 client
  }

  async list(path: string): Promise<ListEntry[]> {
    throw new Error('S3Adapter.list not implemented')
  }
  async stat(path: string): Promise<StatEntry> {
    throw new Error('S3Adapter.stat not implemented')
  }
  async read(path: string): Promise<Uint8Array> {
    throw new Error('S3Adapter.read not implemented')
  }
  async write(path: string, data: Uint8Array): Promise<void> {
    throw new Error('S3Adapter.write not implemented')
  }
  async delete(path: string): Promise<void> {
    throw new Error('S3Adapter.delete not implemented')
  }
  async mkdir(path: string): Promise<void> {
    throw new Error('S3Adapter.mkdir not implemented')
  }
  async move(src: string, dest: string): Promise<void> {
    throw new Error('S3Adapter.move not implemented')
  }
  async copy(src: string, dest: string): Promise<void> {
    throw new Error('S3Adapter.copy not implemented')
  }
}
