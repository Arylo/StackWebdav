import { BlobServiceClient, StorageSharedKeyCredential, type ContainerClient } from '@azure/storage-blob'
import type { StorageAdapter, ListEntry, StatEntry } from './StorageAdapter'

export type AzureBlobAdapterOptions = {
  connectionString?: string
  accountUrl?: string
  accountName?: string
  accountKey?: string
  sasToken?: string
  containerName: string
  prefix?: string
}

export class AzureBlobAdapter implements StorageAdapter {
  private containerClient: ContainerClient
  private prefix: string

  constructor(options: AzureBlobAdapterOptions) {
    const { connectionString, accountUrl, accountName, accountKey, sasToken, containerName, prefix } = options
    if (!containerName) throw new Error('AzureBlobAdapter: containerName is required')

    let serviceClient: BlobServiceClient
    if (connectionString) {
      serviceClient = BlobServiceClient.fromConnectionString(connectionString)
    } else if (accountUrl) {
      if (sasToken) {
        serviceClient = new BlobServiceClient(`${accountUrl}?${sasToken}`)
      } else if (accountName && accountKey) {
        const cred = new StorageSharedKeyCredential(accountName, accountKey)
        serviceClient = new BlobServiceClient(accountUrl, cred)
      } else {
        throw new Error('AzureBlobAdapter: accountUrl requires sasToken or accountName/accountKey')
      }
    } else if (accountName && accountKey) {
      const cred = new StorageSharedKeyCredential(accountName, accountKey)
      serviceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, cred)
    } else {
      throw new Error('AzureBlobAdapter: connectionString or accountUrl or accountName/accountKey required')
    }

    this.containerClient = serviceClient.getContainerClient(containerName)
    this.prefix = this.normalize(prefix ?? '')
  }

  private normalize(p: string) {
    if (p === '/' || p === '' || p === '.') return ''
    let normalized = p
    normalized = normalized.replace(/^\/+/, '')
    normalized = normalized.replace(/\/+/g, '/').replace(/\/+$/, '')
    return normalized
  }

  private basePrefix() {
    return this.prefix ? `${this.prefix}/` : ''
  }

  private stripPrefix(p: string) {
    if (!this.prefix) return p
    const normalized = this.normalize(p)
    const prefix = this.normalize(this.prefix)
    if (!prefix) return normalized
    if (normalized === prefix) return ''
    if (normalized.startsWith(`${prefix}/`)) return normalized.slice(prefix.length + 1)
    return normalized
  }

  private toBlobName(p: string) {
    const rel = this.stripPrefix(p)
    if (!this.prefix) return rel
    if (!rel) return this.prefix
    return `${this.prefix}/${rel}`
  }

  private toPrefix(p: string) {
    const rel = this.stripPrefix(p)
    const base = this.basePrefix()
    if (!rel) return base
    return `${base}${rel}/`
  }

  private async ensureContainer() {
    await this.containerClient.createIfNotExists()
  }

  async list(path: string): Promise<ListEntry[]> {
    await this.ensureContainer()
    const listPrefix = this.toPrefix(path)
    const listPath = this.normalize(path)
    const entries: ListEntry[] = []

    for await (const item of this.containerClient.listBlobsByHierarchy('/', { prefix: listPrefix })) {
      const childRaw = item.name.slice(listPrefix.length).replace(/\/$/, '')
      const childPath = listPath ? `${listPath}/${childRaw}` : childRaw
      entries.push({ path: childPath.replace(/\/$/, ''), isDirectory: item.kind === 'prefix' })
    }

    return entries
  }

  async stat(path: string): Promise<StatEntry> {
    await this.ensureContainer()
    const normalized = this.normalize(path)
    if (!normalized) return { exists: true, isDirectory: true }

    const blobName = this.toBlobName(path)
    if (blobName) {
      const blobClient = this.containerClient.getBlobClient(blobName)
      const exists = await blobClient.exists()
      if (exists) {
        const props = await blobClient.getProperties()
        return {
          exists: true,
          isDirectory: false,
          size: props.contentLength,
          mtime: props.lastModified ? props.lastModified.getTime() : undefined
        }
      }
    }

    const dirPrefix = this.toPrefix(path)
    for await (const _item of this.containerClient.listBlobsByHierarchy('/', { prefix: dirPrefix })) {
      return { exists: true, isDirectory: true }
    }

    return { exists: false, isDirectory: false }
  }

  async read(path: string): Promise<Uint8Array> {
    await this.ensureContainer()
    const blobName = this.toBlobName(path)
    const blobClient = this.containerClient.getBlobClient(blobName)
    const buf = await blobClient.downloadToBuffer()
    return new Uint8Array(buf)
  }

  async write(path: string, data: Uint8Array): Promise<void> {
    await this.ensureContainer()
    const blobName = this.toBlobName(path)
    const blobClient = this.containerClient.getBlockBlobClient(blobName)
    await blobClient.uploadData(Buffer.from(data))
  }

  async delete(path: string): Promise<void> {
    await this.ensureContainer()
    const stat = await this.stat(path)
    if (!stat.exists) return

    if (stat.isDirectory) {
      const prefix = this.toPrefix(path)
      for await (const item of this.containerClient.listBlobsFlat({ prefix })) {
        await this.containerClient.deleteBlob(item.name)
      }
      return
    }

    const blobName = this.toBlobName(path)
    await this.containerClient.deleteBlob(blobName)
  }

  async mkdir(path: string): Promise<void> {
    await this.ensureContainer()
    const prefix = this.toPrefix(path)
    if (!prefix) return
    const marker = this.containerClient.getBlockBlobClient(prefix)
    await marker.uploadData(new Uint8Array())
  }

  async move(src: string, dest: string): Promise<void> {
    await this.copy(src, dest)
    await this.delete(src)
  }

  async copy(src: string, dest: string): Promise<void> {
    await this.ensureContainer()
    const srcStat = await this.stat(src)
    if (!srcStat.exists) return

    if (srcStat.isDirectory) {
      const srcPrefix = this.toPrefix(src)
      const destPrefix = this.toPrefix(dest)
      for await (const item of this.containerClient.listBlobsFlat({ prefix: srcPrefix })) {
        const relative = item.name.slice(srcPrefix.length)
        const destName = `${destPrefix}${relative}`
        const srcClient = this.containerClient.getBlobClient(item.name)
        const destClient = this.containerClient.getBlobClient(destName)
        const poller = await destClient.beginCopyFromURL(srcClient.url)
        await poller.pollUntilDone()
      }
      return
    }

    const srcName = this.toBlobName(src)
    const destName = this.toBlobName(dest)
    const srcClient = this.containerClient.getBlobClient(srcName)
    const destClient = this.containerClient.getBlobClient(destName)
    const poller = await destClient.beginCopyFromURL(srcClient.url)
    await poller.pollUntilDone()
  }
}
