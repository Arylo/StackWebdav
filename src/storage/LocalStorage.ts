import path from 'path'
import fs from 'fs'
import { rimraf } from 'rimraf'
import mime from 'mime'
import {
  BaseStore,
  CreateOptions,
  GetOptions,
  PropfindOptions,
  PropfindResult,
  StatResult,
  StatType,
} from "./BaseStorage"

export class LocalStorage extends BaseStore {
  constructor (mountPath: string, options: { path: string, filter?: string }) {
    super(mountPath, options)
    this.device = {
      type: 'local',
      path: options.path,
      filter: options.filter,
    }
  }
  public static createInst(...args: ConstructorParameters<typeof LocalStorage>) {
    return new LocalStorage(...args)
  }
  public async create(resourcePath: string, options: CreateOptions): Promise<boolean> {
    const currentPath = this.getResourcePath(resourcePath)
    switch (options.type) {
      case 'file':
        fs.mkdirSync(path.dirname(currentPath), { recursive: true })
        fs.writeFileSync(currentPath, '', { encoding: 'utf-8' })
        return true
      default:
        return false
    }
  }
  public async update(resourcePath: string, content: string | fs.ReadStream) {
    const currentPath = this.getResourcePath(resourcePath)
    if (typeof content === 'string') {
      fs.writeFileSync(currentPath, content, 'utf-8')
    }
  }
  private getResourcePath (resourcePath: string) {
    return path.join(this.device.path, decodeURIComponent(resourcePath))
  }

  public async COPY(resourcePath: string) {
    return false
  }
  public async DELETE(resourcePath: string) {
    const currentPath = this.getResourcePath(resourcePath)
    await rimraf(currentPath)
    return true
  }
  public async GET(resourcePath: string, options: GetOptions) {
    const stat = await this.HEAD(resourcePath)
    if (!stat) return undefined
    if (stat.type === 'directory') return undefined
    const currentPath = this.getResourcePath(resourcePath)
    const readStreamOptions = options ? { start: options.start, end: options.end } : undefined
    return fs.createReadStream(currentPath, readStreamOptions)
  }
  public async HEAD(resourcePath: string) {
    const currentPath = this.getResourcePath(resourcePath)
    const isExist = fs.existsSync(currentPath)
    if (!isExist) return undefined
    const stat = await fs.promises.stat(currentPath)
    const result: StatResult =  {
      mtime: stat.mtime,
      size: stat.isFile() ? stat.size : 0,
      mime: mime.getType(currentPath),
      type: stat.isFile() ? StatType.File : StatType.Directory,
    }
    return result
  }
  public async MKCOL(resourcePath: string) {
    const currentPath = this.getResourcePath(resourcePath)
    await fs.promises.mkdir(currentPath, { recursive: true })
    return true
  }
  public async MOVE(resourcePath: string) {
    return false
  }
  public async POST(resourcePath: string) {
    return false
  }
  private async PROPFINDInfos(resourcePaths: string[], depth: number) {
    const list = await Promise.all(resourcePaths.map(async (resourcePath) => {
      const targetPath = this.getResourcePath(resourcePath)
      const stat = await fs.promises.stat(targetPath)
      const targetPathStat =  {
        path: resourcePath,
        mtime: stat.mtime,
        size: stat.isFile() ? stat.size : 0,
        mime: mime.getType(targetPath),
        type: stat.isFile() ? StatType.File : StatType.Directory,
        name: resourcePath === '/' ? '/' : path.basename(targetPath),
      }
      return targetPathStat
    }))
    if (depth !== 0 && list.length !== 0) {
      const paths = (await Promise.all(list
        .filter((item) => item.type === StatType.Directory)
        .map(async (item) => {
          const filenames = await fs.promises.readdir(this.getResourcePath(item.path))
          return filenames.map((filename) => path.join(item.path, filename))
        })))
        .flat()
      const results = await this.PROPFINDInfos(paths, depth - 1)
      list.push(...results)
    }
    return list
  }
  public async PROPFIND(resourcePath: string, options: PropfindOptions) {
    // #region Current Path
    const currentPath = this.getResourcePath(resourcePath)
    const isExist = fs.existsSync(currentPath)
    if (!isExist) return []
    const list: PropfindResult = await this.PROPFINDInfos([resourcePath], options.depth)
    return list
  }
  public async PUT(resourcePath: string) {
    return false
  }
  public async LOCK(resourcePath: string) {
    return false
  }
  public async UNLOCK(resourcePath: string) {
    return false
  }
}
