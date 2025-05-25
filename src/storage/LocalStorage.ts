import path from 'path'
import fs from 'fs'
import { rimraf } from 'rimraf'
import mime from 'mime'
import {
  BaseStore,
  GetOptions,
  PropfindOptions,
  PropfindResult,
  PUTOptions,
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
    if (stat.type === StatType.Directory) return undefined
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
    const currentPath = this.getResourcePath(resourcePath)
    const isExist = fs.existsSync(currentPath)
    if (!isExist) return []
    const list: PropfindResult = await this.PROPFINDInfos([resourcePath], options.depth)
    return list
  }
  public async PUT(resourcePath: string, content: Buffer | string, options?: PUTOptions) {
    const currentPath = this.getResourcePath(resourcePath)
    await fs.promises.mkdir(path.dirname(currentPath), { recursive: true })
    const fd = await fs.promises.open(currentPath, 'w')
    let args: any[] = []
    if (typeof options?.start === 'number' && typeof options?.end === 'number') {
      args = [0, options.end - options.start, options.start]
    }
    await fd.writeFile(content, ...args)
    await fd.close()
    return true
  }
  public async LOCK(resourcePath: string) {
    return false
  }
  public async UNLOCK(resourcePath: string) {
    return false
  }
}
