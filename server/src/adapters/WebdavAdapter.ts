import { createClient, type WebDAVClient } from 'webdav'
import type { StorageAdapter, ListEntry, StatEntry } from './StorageAdapter'

export type WebdavAdapterOptions = {
  url: string
  username?: string
  password?: string
  prefix?: string
}

export class WebdavAdapter implements StorageAdapter {
  private client: WebDAVClient
  private prefix: string

  constructor(opts: WebdavAdapterOptions) {
    this.client = createClient(opts.url, {
      username: opts.username,
      password: opts.password
    })
    this.prefix = opts.prefix ?? '/'
  }

  private resolve(p: string) {
    const rel = p === '/' || p === '' ? '' : p.replace(/^\/+/, '')
    const base = this.prefix.replace(/\/$/, '') || '/'
    if (base === '/') return `/${rel}`.replace(/\/+/g, '/')
    return `${base}/${rel}`.replace(/\/+/g, '/')
  }

  async list(path: string): Promise<ListEntry[]> {
    const resolved = this.resolve(path)
    const items = await this.client.getDirectoryContents(resolved)
    return items.map((i: any) => ({
      path: `${path.replace(/\/$/, '')}/${i.basename}`.replace(/^\//, ''),
      isDirectory: i.type === 'directory'
    }))
  }

  async stat(path: string): Promise<StatEntry> {
    const resolved = this.resolve(path)
    try {
      const s: any = await this.client.stat(resolved)
      return {
        exists: true,
        isDirectory: s.type === 'directory',
        size: typeof s.size === 'number' ? s.size : undefined,
        mtime: s.lastmod ? new Date(s.lastmod).getTime() : undefined
      }
    } catch (err: any) {
      if (err?.status === 404) return { exists: false, isDirectory: false }
      throw err
    }
  }

  async read(path: string): Promise<Uint8Array> {
    const resolved = this.resolve(path)
    const data = await this.client.getFileContents(resolved, { format: 'binary' })
    if (data instanceof ArrayBuffer) return new Uint8Array(data)
    if (data instanceof Uint8Array) return data
    return new Uint8Array(Buffer.from(data as any))
  }

  async write(path: string, data: Uint8Array): Promise<void> {
    const resolved = this.resolve(path)
    await this.client.putFileContents(resolved, Buffer.from(data), { overwrite: true })
  }

  async delete(path: string): Promise<void> {
    const resolved = this.resolve(path)
    await this.client.deleteFile(resolved)
  }

  async mkdir(path: string): Promise<void> {
    const resolved = this.resolve(path)
    await this.client.createDirectory(resolved)
  }

  async move(src: string, dest: string): Promise<void> {
    await this.client.moveFile(this.resolve(src), this.resolve(dest))
  }

  async copy(src: string, dest: string): Promise<void> {
    await this.client.copyFile(this.resolve(src), this.resolve(dest))
  }
}
