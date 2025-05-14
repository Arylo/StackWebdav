import path from 'path'
import fs from 'fs'
import { rimrafSync } from 'rimraf'
import mime from 'mime'
import { BaseStore, CreateOptions, GetOptions, StatResult, Store } from "./BaseStore"

export class LocalStore extends BaseStore {
  constructor (webPath: Store['path'], options: { path: string, filter?: string }) {
    super()
    this.path = webPath
    this.device = {
      type: 'local',
      path: options.path,
      filter: options.filter,
    }
  }
  public static create(...args: ConstructorParameters<typeof LocalStore>) {
    return new LocalStore(...args)
  }
  public async has (targetPath: string) {
    const currentPath = this.getResourcePath(targetPath)
    return fs.existsSync(currentPath)
  }
  public async create(targetPath: string, options: CreateOptions): Promise<boolean> {
    const currentPath = this.getResourcePath(targetPath)
    switch (options.type) {
      case 'directory':
        fs.mkdirSync(currentPath, { recursive: true })
        return true
      case 'file':
        fs.mkdirSync(path.dirname(currentPath), { recursive: true })
        fs.writeFileSync(currentPath, '', { encoding: 'utf-8' })
        return true
      default:
        return false
    }
  }
  public async delete(targetPath: string) {
    const currentPath = this.getResourcePath(targetPath)
    rimrafSync(currentPath)
    return true
  }
  public async get(targetPath: string, options?: GetOptions) {
    const currentPath = this.getResourcePath(targetPath)
    const readStreamOptions = options ? { start: options.start, end: options.end } : undefined
    return fs.createReadStream(currentPath, readStreamOptions)
  }
  public async update(targetPath: string, content: string | fs.ReadStream) {
    const currentPath = this.getResourcePath(targetPath)
    if (typeof content === 'string') {
      fs.writeFileSync(currentPath, content, 'utf-8')
    }
  }
  public async stat (targetPath: string) {
    const currentPath = this.getResourcePath(targetPath)
    const stat = fs.statSync(currentPath)
    const result: StatResult =  {
      mtime: stat.mtime,
      size: stat.isFile() ? stat.size : 0,
      mime: mime.getType(currentPath),
      type: stat.isFile() ? 'file' : 'directory',
    }
    return result
  }
  public async lock(targetPath: string): Promise<unknown> {
    const currentPath = this.getResourcePath(targetPath)
    throw new Error('Method not implemented.');
  }
  public async unlock(targetPath: string): Promise<unknown> {
    const currentPath = this.getResourcePath(targetPath)
    throw new Error('Method not implemented.');
  }
  private getResourcePath (targetPath: string) {
    return path.join(this.device.path, decodeURIComponent(targetPath))
  }
}
