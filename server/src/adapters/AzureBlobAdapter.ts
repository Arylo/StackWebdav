import type { StorageAdapter, ListEntry, StatEntry } from './StorageAdapter'

// Placeholder / sketch for Azure Blob adapter
export class AzureBlobAdapter implements StorageAdapter {
  constructor(options: any) {
    // TODO: init azure blob client
  }

  async list(path: string): Promise<ListEntry[]> {
    throw new Error('AzureBlobAdapter.list not implemented')
  }
  async stat(path: string): Promise<StatEntry> {
    throw new Error('AzureBlobAdapter.stat not implemented')
  }
  async read(path: string): Promise<Uint8Array> {
    throw new Error('AzureBlobAdapter.read not implemented')
  }
  async write(path: string, data: Uint8Array): Promise<void> {
    throw new Error('AzureBlobAdapter.write not implemented')
  }
  async delete(path: string): Promise<void> {
    throw new Error('AzureBlobAdapter.delete not implemented')
  }
  async mkdir(path: string): Promise<void> {
    throw new Error('AzureBlobAdapter.mkdir not implemented')
  }
  async move(src: string, dest: string): Promise<void> {
    throw new Error('AzureBlobAdapter.move not implemented')
  }
  async copy(src: string, dest: string): Promise<void> {
    throw new Error('AzureBlobAdapter.copy not implemented')
  }
}
