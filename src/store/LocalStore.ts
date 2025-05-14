import path from 'path'
import fs from 'fs'
import { BaseStore, CreateOptions, StatResult, Store } from "./BaseStore"
import { rimrafSync } from 'rimraf'

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
    const currentPath = path.join(this.device.path, targetPath)
    return fs.existsSync(currentPath)
  }
  public async create(targetPath: string, options: CreateOptions): Promise<boolean> {
    const currentPath = path.join(this.device.path, targetPath)
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
    const currentPath = path.join(this.device.path, targetPath)
    rimrafSync(currentPath)
  }
  public async get(targetPath: string) {
    const currentPath = path.join(this.device.path, targetPath)
    return fs.createReadStream(currentPath)
  }
  public async stat (targetPath: string) {
    const currentPath = path.join(this.device.path, targetPath)
    const stat = fs.statSync(currentPath)
    const result: StatResult =  {
      mtime: stat.mtime,
      size: stat.size,
      mime: '',
      type: stat.isFile() ? 'file' : 'directory',
    }
    return result
  }
  public async lock(targetPath: string): Promise<unknown> {
    const currentPath = path.join(this.device.path, targetPath)
    throw new Error('Method not implemented.');
  }
  public async unlock(targetPath: string): Promise<unknown> {
    const currentPath = path.join(this.device.path, targetPath)
    throw new Error('Method not implemented.');
  }
}
