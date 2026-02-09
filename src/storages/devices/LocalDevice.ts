import {
  Device,
  GetOptions,
  PropfindOptions,
  PropfindResult,
  PUTOptions,
  StatResult,
  StatType,
} from "./Device"
import path from 'path'
import fs from 'fs'
import { rimraf } from 'rimraf'
import mime from 'mime'
import resourcePath, { ResourcePath } from "../../old/utils/ResourcePath"
import genPathGroup, { PathGroup } from "../../utils/genPathGroup"

export default class LocalDevice extends Device {
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
  private getRealPath (pathGroup: PathGroup) {
    return pathGroup.prepend(this.path).toString()
  }

  public async COPY(pathGroup: PathGroup) {
    return false
  }
  public async DELETE(pathGroup: PathGroup) {
    const currentPath = this.getRealPath(pathGroup)
    await rimraf(currentPath)
    return true
  }
  public async GET(pathGroup: PathGroup, options: GetOptions) {
    const stat = await this.HEAD(pathGroup)
    if (!stat) return undefined
    if (stat.type === StatType.Directory) return undefined
    const currentPath = this.getRealPath(pathGroup)
    const readStreamOptions = options ? { start: options.start, end: options.end } : undefined
    return fs.createReadStream(currentPath, readStreamOptions)
  }
  public async HEAD(pathGroup: PathGroup) {
    const currentPath = this.getRealPath(pathGroup)
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
  public async MKCOL(pathGroup: PathGroup) {
    const currentPath = this.getRealPath(pathGroup)
    await fs.promises.mkdir(currentPath, { recursive: true })
    return true
  }
  public async MOVE(pathGroup: PathGroup) {
    return false
  }
  private async PROPFINDInfos(pathGroups: PathGroup[], depth: number) {
    const list = await Promise.all(pathGroups.map(async (pathGroup) => {
      const targetPath = this.getRealPath(pathGroup)
      const stat = await fs.promises.stat(targetPath)
      const targetPathStat =  {
        path: pathGroup.toString(),
        mtime: stat.mtime,
        size: stat.isFile() ? stat.size : 0,
        mime: mime.getType(targetPath),
        type: stat.isFile() ? StatType.File : StatType.Directory,
        name: pathGroup.toString() === '/' ? '/' : path.basename(targetPath),
      }
      return targetPathStat
    }))
    if (depth !== 0 && list.length !== 0) {
      const realDepth = depth === Infinity ? Number.MAX_SAFE_INTEGER : depth
      const nextPathGroups = (await Promise.all(list
        .filter((item) => item.type === StatType.Directory)
        .map(async (item) => {
          const folderPathGroup = genPathGroup(item.path)
          const filenames = await fs.promises.readdir(this.getRealPath(folderPathGroup))
          return filenames.map((filename) => folderPathGroup.append(filename))
        })))
        .flat()
      if (nextPathGroups.length !== 0) {
        const results = await this.PROPFINDInfos(nextPathGroups, realDepth - 1)
        list.push(...results)
      }
    }
    return list
  }
  public async PROPFIND(pathGroup: PathGroup, options: PropfindOptions) {
    const currentPath = this.getRealPath(pathGroup)
    const isExist = fs.existsSync(currentPath)
    if (!isExist) return []
    const list: PropfindResult = await this.PROPFINDInfos([pathGroup], options.depth)
    return list
  }
  public async PUT(pathGroup: PathGroup, content: Buffer | string, options?: PUTOptions) {
    const currentPath = this.getRealPath(pathGroup)
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
  public async LOCK(pathGroup: PathGroup) {
    return false
  }
  public async UNLOCK(pathGroup: PathGroup) {
    return false
  }
}
