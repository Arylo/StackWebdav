import path from 'path'
import fs from 'fs'
import { rimraf } from 'rimraf'
import mime from 'mime'
import { BaseStore, CreateOptions, GetOptions, StatResult } from "./BaseStorage"

export class LocalStorage extends BaseStore {
  constructor (webPath: string, options: { path: string, filter?: string }) {
    super()
    this.path = webPath
    this.device = {
      type: 'local',
      path: options.path,
      filter: options.filter,
    }
  }
  public static createInst(...args: ConstructorParameters<typeof LocalStorage>) {
    return new LocalStorage(...args)
  }
  public async has (targetPath: string) {
    const currentPath = this.getResourcePath(targetPath)
    return fs.existsSync(currentPath)
  }
  public async create(targetPath: string, options: CreateOptions): Promise<boolean> {
    const currentPath = this.getResourcePath(targetPath)
    switch (options.type) {
      case 'file':
        fs.mkdirSync(path.dirname(currentPath), { recursive: true })
        fs.writeFileSync(currentPath, '', { encoding: 'utf-8' })
        return true
      default:
        return false
    }
  }
  public async update(targetPath: string, content: string | fs.ReadStream) {
    const currentPath = this.getResourcePath(targetPath)
    if (typeof content === 'string') {
      fs.writeFileSync(currentPath, content, 'utf-8')
    }
  }
  private getResourcePath (targetPath: string) {
    return path.join(this.device.path, decodeURIComponent(targetPath))
  }

  public async COPY(targetPath: string) {
    return false
  }
  public async DELETE(targetPath: string) {
    const currentPath = this.getResourcePath(targetPath)
    await rimraf(currentPath)
    return true
  }
  public async GET(targetPath: string, options: GetOptions) {
    const stat = await this.HEAD(targetPath)
    if (!stat) return undefined
    if (stat.type === 'directory') return undefined
    const currentPath = this.getResourcePath(targetPath)
    const readStreamOptions = options ? { start: options.start, end: options.end } : undefined
    return fs.createReadStream(currentPath, readStreamOptions)
  }
  public async HEAD(targetPath: string) {
    const currentPath = this.getResourcePath(targetPath)
    const isExist = fs.existsSync(currentPath)
    if (!isExist) return undefined
    const stat = await fs.promises.stat(currentPath)
    const result: StatResult =  {
      mtime: stat.mtime,
      size: stat.isFile() ? stat.size : 0,
      mime: mime.getType(currentPath),
      type: stat.isFile() ? 'file' : 'directory',
    }
    return result
  }
  public async MKCOL(targetPath: string) {
    const currentPath = this.getResourcePath(targetPath)
    await fs.promises.mkdir(currentPath, { recursive: true })
    return true
  }
  public async MOVE(targetPath: string) {
    return false
  }
  public async POST(targetPath: string) {
    return false
  }
  public async PROPFIND(targetPath: string) {
    return false
  }
  public async PUT(targetPath: string) {
    return false
  }
  public async LOCK(targetPath: string) {
    return false
  }
  public async UNLOCK(targetPath: string) {
    return false
  }
}
