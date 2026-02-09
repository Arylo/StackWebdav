import path from "path";
import { nanoid } from "nanoid"
import { match } from "ts-pattern";
import LocalDevice from "../devices/LocalDevice";
import { Device, PropfindResult, StatType } from "../devices/Device";
import { GetOptions, PropfindOptions, PUTOptions } from "../devices/Device";
import noneAsync from "../../utils/noneAsync";
import { PathGroup } from "../../utils/genPathGroup";

interface PoolOptions {
  id: string,
  mountPath: string,
  filter?: string,
  device: {
    type: LocalDevice['deviceName'],
    path: string,
  },
  createdAt: Date,
  updatedAt: Date,
}

type PoolConstructorOptions = Omit<PoolOptions, 'id' | 'path' | 'createdAt' | 'updatedAt'>
type PoolCanEditOptions = Omit<PoolOptions, 'id' | 'createdAt' | 'updatedAt'>

export default class Pool {
  protected id !: string;
  private mountPath!: string;
  private createdAt!: Date
  private updatedAt!: Date
  private filter?: string;
  private device: Device;
  constructor (mountPath: string, options: PoolConstructorOptions) {
    this.id = nanoid()
    this.mountPath = mountPath
    const now = new Date()
    this.createdAt = new Date(now)
    this.updatedAt = new Date(now)
    this.filter = options.filter
    this.device = match(options)
      .with({ device: { type: LocalDevice.DEVICE_NAME } }, () => new LocalDevice(options.device.path))
      .run()
  }
  public static createFromJSON (configObject: PoolOptions) {
    const pool = new Pool(configObject.mountPath, configObject)
    pool.id = configObject.id
    pool.createdAt = new Date(configObject.createdAt)
    pool.updatedAt = new Date(configObject.updatedAt)
    return pool
  }
  public toJSON () {
    return {
      id: this.id,
      mountPath: this.mountPath,
      filter: this.filter,
      device: this.device.toJSON(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
  public updateConfig (configObject: Partial<PoolCanEditOptions>) {
    const { mountPath, filter, device } = configObject
    if (mountPath) this.mountPath = mountPath
    if (filter) this.filter = filter
    if (device) {
      this.device = match(device)
        .with({ type: LocalDevice.DEVICE_NAME }, () => new LocalDevice(device.path))
        .otherwise(() => this.device)
    }
    this.updatedAt = new Date()
  }

  public match (pathGroup: PathGroup) {
    const result = isMatchPath(this.mountPath, pathGroup.toRaw())
    return !!result
  }
  private getResourcePath (resourcePath: PathGroup) {
    return resourcePath.relative(this.mountPath)
  }
  public async COPY (pathGroup: PathGroup) {
    return pathGroup.next(this.mountPath, ({ nextPathGroup }) => {
      if (!nextPathGroup) return false
      return this.device.COPY(nextPathGroup)
    })
  }
  public async DELETE (pathGroup: PathGroup) {
    return pathGroup.next(this.mountPath, ({ nextPathGroup }) => {
      if (!nextPathGroup) return false
      return this.device.DELETE(nextPathGroup)
    })
  }
  public async GET (pathGroup: PathGroup, options?: GetOptions) {
    return pathGroup.next(this.mountPath, ({ nextPathGroup }) => {
      if (!nextPathGroup) return undefined
      return this.device.GET(nextPathGroup, options)
    })
  }
  public async HEAD (pathGroup: PathGroup) {
    return pathGroup.next(this.mountPath, ({ nextPathGroup }) => {
      if (!nextPathGroup) return undefined
      return this.device.HEAD(nextPathGroup)
    })
  }
  public async LOCK (pathGroup: PathGroup) {
    return pathGroup.next(this.mountPath, ({ nextPathGroup }) => {
      if (!nextPathGroup) return false
      return this.device.LOCK(nextPathGroup)
    })
  }
  public async MKCOL (pathGroup: PathGroup) {
    return pathGroup.next(this.mountPath, ({ nextPathGroup }) => {
      if (!nextPathGroup) return false
      return this.device.MKCOL(nextPathGroup)
    })
  }
  public async MOVE (pathGroup: PathGroup) {
    return pathGroup.next(this.mountPath, ({ nextPathGroup }) => {
      if (!nextPathGroup) return false
      return this.device.MOVE(nextPathGroup)
    })
  }
  public async PROPFIND (pathGroup: PathGroup, options: PropfindOptions) {
    const realResourcePath = this.getResourcePath(pathGroup)
    let list: PropfindResult = []
    if (!realResourcePath) {
      await baseMatchPath(this.mountPath, pathGroup.toRaw(), {
        [MatchPathResult.MATCH]: noneAsync,
        [MatchPathResult.UNDER]: noneAsync,
        [MatchPathResult.NOT]: noneAsync,
        [MatchPathResult.IN]: async ({ index, mountPaths }) => {
          const curP = path.join('/', mountPaths.slice(0, index).join('/'))
          const nextP = path.join('/', mountPaths.slice(0, index + 1).join('/'))
          switch (options.depth) {
            case 1:
              list.push({
                path: nextP,
                mtime: this.updatedAt,
                size: 0,
                mime: null,
                type: StatType.Directory,
                name: mountPaths[index],
              })
            case 0:
              list.push({
                path: curP,
                mtime: this.updatedAt,
                size: 0,
                mime: null,
                type: StatType.Directory,
                name: curP === '/' ? '/' : mountPaths[index],
              })
          }
          return
        },
      })
    } else {
      const result = await this.device.PROPFIND(realResourcePath, options)
      list.push(...(
        result.map((item) => ({ ...item, path: path.join(this.mountPath, item.path) }))
      ))
    }
    return list
  }
  public async PUT (pathGroup: PathGroup, content: Buffer | string, options?: PUTOptions) {
    return pathGroup.next(this.mountPath, ({ nextPathGroup }) => {
      if (!nextPathGroup) return false
      return this.device.PUT(nextPathGroup, content, options)
    })
  }
  public async UNLOCK (pathGroup: PathGroup) {
    return pathGroup.next(this.mountPath, ({ nextPathGroup }) => {
      if (!nextPathGroup) return false
      return this.device.UNLOCK(nextPathGroup)
    })
  }
}
