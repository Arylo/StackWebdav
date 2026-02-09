import { promises as fs } from 'fs'
import { join, normalize } from 'path'
import type { StorageAdapter, ListEntry, StatEntry } from './StorageAdapter'

export interface LocalAdapterOptions {
  root: string
}

export class LocalAdapter implements StorageAdapter {
  root: string

  constructor(opts: LocalAdapterOptions) {
    this.root = opts.root
  }

  private resolve(p: string) {
    // Normalize and ensure we resolve relative to the adapter root.
    // If caller passes absolute-like paths ("/"), strip leading separators.
    let normalized = p
    if (normalized === '/' || normalized === '') normalized = '.'
    normalized = normalize(normalized)
    normalized = normalized.replace(/^[/\\]+/, '')
    return join(this.root, normalized)
  }

  async list(path: string): Promise<ListEntry[]> {
    const resolved = this.resolve(path)
    const names = await fs.readdir(resolved, { withFileTypes: true })
    return names.map((d) => ({ path: join(path, d.name), isDirectory: d.isDirectory() }))
  }

  async stat(path: string): Promise<StatEntry> {
    const resolved = this.resolve(path)
    try {
      const s = await fs.stat(resolved)
      return {
        exists: true,
        isDirectory: s.isDirectory(),
        size: s.size,
        mtime: s.mtimeMs
      }
    } catch (err: any) {
      if (err?.code === 'ENOENT') {
        return { exists: false, isDirectory: false }
      }
      throw err
    }
  }

  async read(path: string): Promise<Uint8Array> {
    const resolved = this.resolve(path)
    const buf = await fs.readFile(resolved)
    return new Uint8Array(buf)
  }

  async write(path: string, data: Uint8Array): Promise<void> {
    const resolved = this.resolve(path)
    await fs.mkdir(join(resolved, '..'), { recursive: true })
    await fs.writeFile(resolved, Buffer.from(data))
  }

  async delete(path: string): Promise<void> {
    const resolved = this.resolve(path)
    await fs.rm(resolved, { force: true, recursive: true })
  }

  async mkdir(path: string): Promise<void> {
    const resolved = this.resolve(path)
    await fs.mkdir(resolved, { recursive: true })
  }

  async move(src: string, dest: string): Promise<void> {
    const srcResolved = this.resolve(src)
    const destResolved = this.resolve(dest)
    await fs.mkdir(join(destResolved, '..'), { recursive: true })
    await fs.rename(srcResolved, destResolved)
  }

  async copy(src: string, dest: string): Promise<void> {
    const srcResolved = this.resolve(src)
    const destResolved = this.resolve(dest)
    await fs.mkdir(join(destResolved, '..'), { recursive: true })
    await fs.cp(srcResolved, destResolved, { recursive: true })
  }
}
