import {
  BaseDevice,
  GetOptions,
  PropfindOptions,
  PropfindResult,
  PUTOptions,
  StatResult,
  StatType,
} from "./BaseDevice"
import path from 'path'
import fs from 'fs'
import { rimraf } from 'rimraf'
import mime from 'mime'
import resourcePath, { ResourcePath } from "../../utils/ResourcePath"

export default class LocalDevice extends BaseDevice {
  public static readonly DEVICE_NAME = 'local'
  protected readonly deviceName = LocalDevice.DEVICE_NAME
  protected path: string
  constructor (targetPath: string) {
    super()
    this.path = targetPath
  }
  public toJSON() {
    return {
      type: this.deviceName,
      path: this.path,
    }
  }
  private getResourcePath (resourcePath: ResourcePath) {
    const targetPath = resourcePath.toRaw()
    return path.join(this.path, targetPath)
  }

  public async COPY(resourcePath: ResourcePath) {
    return false
  }
  public async DELETE(resourcePath: ResourcePath) {
    const currentPath = this.getResourcePath(resourcePath)
    await rimraf(currentPath)
    return true
  }
  public async GET(resourcePath: ResourcePath, options: GetOptions) {
    const stat = await this.HEAD(resourcePath)
    if (!stat) return undefined
    if (stat.type === StatType.Directory) return undefined
    const currentPath = this.getResourcePath(resourcePath)
    const readStreamOptions = options ? { start: options.start, end: options.end } : undefined
    return fs.createReadStream(currentPath, readStreamOptions)
  }
  public async HEAD(resourcePath: ResourcePath) {
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
  public async MKCOL(resourcePath: ResourcePath) {
    const currentPath = this.getResourcePath(resourcePath)
    await fs.promises.mkdir(currentPath, { recursive: true })
    return true
  }
  public async MOVE(resourcePath: ResourcePath) {
    return false
  }
  private async PROPFINDInfos(resourcePaths: ResourcePath[], depth: number) {
    const list = await Promise.all(resourcePaths.map(async (resourcePath) => {
      const targetPath = this.getResourcePath(resourcePath)
      const stat = await fs.promises.stat(targetPath)
      const targetPathStat =  {
        path: resourcePath.toRaw(),
        mtime: stat.mtime,
        size: stat.isFile() ? stat.size : 0,
        mime: mime.getType(targetPath),
        type: stat.isFile() ? StatType.File : StatType.Directory,
        name: resourcePath.toRaw() === '/' ? '/' : path.basename(targetPath),
      }
      return targetPathStat
    }))
    if (depth !== 0 && list.length !== 0) {
      const paths = (await Promise.all(list
        .filter((item) => item.type === StatType.Directory)
        .map(async (item) => {
          const folderResourcePath = resourcePath(item.path)
          const filenames = await fs.promises.readdir(this.getResourcePath(folderResourcePath))
          return filenames.map((filename) => folderResourcePath.join(filename))
        })))
        .flat()
      const results = await this.PROPFINDInfos(paths, depth - 1)
      list.push(...results)
    }
    return list
  }
  public async PROPFIND(resourcePath: ResourcePath, options: PropfindOptions) {
    const currentPath = this.getResourcePath(resourcePath)
    const isExist = fs.existsSync(currentPath)
    if (!isExist) return []
    const list: PropfindResult = await this.PROPFINDInfos([resourcePath], options.depth)
    return list
  }
  public async PUT(resourcePath: ResourcePath, content: Buffer | string, options?: PUTOptions) {
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
  public async LOCK(resourcePath: ResourcePath) {
    return false
  }
  public async UNLOCK(resourcePath: ResourcePath) {
    return false
  }
}
