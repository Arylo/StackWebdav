import { nanoid } from "nanoid"
import LocalDevice from "./devices/LocalDevice";
import { BaseDevice, PropfindResult, StatType } from "./devices/BaseDevice";
import { match } from "ts-pattern";
import { ResourcePath } from "../utils/ResourcePath";
import { GetOptions, PropfindOptions, PUTOptions } from "./devices/BaseDevice";
import baseMatchPath, { MatchPathResult } from "../utils/baseMatchPath";
import noneAsync from "../utils/noneAsync";
import isMatchPath from "../utils/isMatchPath";
import path from "path";

interface StorageOptions {
  id: string,
  path: string,
  filter?: string,
  device: {
    type: LocalDevice['deviceName'],
    path: string,
  },
  createdAt: Date,
  updatedAt: Date,
}

export default class Storage {
  protected id !: string;
  private path!: string;
  private createdAt!: Date
  private updatedAt!: Date
  private filter?: string;
  private device: BaseDevice;
  constructor (mountPath: string, options: Omit<StorageOptions, 'id' | 'path' | 'createdAt' | 'updatedAt'>) {
    this.id = nanoid()
    this.path = mountPath
    const now = new Date()
    this.createdAt = new Date(now)
    this.updatedAt = new Date(now)
    this.filter = options.filter
    this.device = match(options)
      .with({ device: { type: LocalDevice.DEVICE_NAME } }, () => new LocalDevice(options.device.path))
      .run()
  }
  public static createFromJSON (configObject: StorageOptions) {
    const storage = new Storage(configObject.path, configObject)
    storage.id = configObject.id
    storage.createdAt = new Date(configObject.createdAt)
    storage.updatedAt = new Date(configObject.updatedAt)
    return storage
  }
  public toJSON () {
    return {
      id: this.id,
      path: this.path,
      filter: this.filter,
      device: this.device.toJSON(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
  public match (resourcePath: ResourcePath) {
    const result = isMatchPath(this.path, resourcePath.toRaw())
    return !!result
  }
  private getResourcePath (resourcePath: ResourcePath) {
    return resourcePath.relative(this.path)
  }
  public async COPY (resourcePath: ResourcePath) {
    const realResourcePath = this.getResourcePath(resourcePath)
    if (!realResourcePath) return false
    return this.device.COPY(resourcePath)
  }
  public async DELETE (resourcePath: ResourcePath) {
    const realResourcePath = this.getResourcePath(resourcePath)
    if (!realResourcePath) return false
    return this.device.DELETE(resourcePath)
  }
  public async GET (resourcePath: ResourcePath, options?: GetOptions) {
    const realResourcePath = this.getResourcePath(resourcePath)
    if (!realResourcePath) return undefined
    return this.device.GET(realResourcePath, options)
  }
  public async HEAD (resourcePath: ResourcePath) {
    const realResourcePath = this.getResourcePath(resourcePath)
    if (!realResourcePath) return undefined
    return this.device.HEAD(realResourcePath)
  }
  public async LOCK (resourcePath: ResourcePath) {
    const realResourcePath = this.getResourcePath(resourcePath)
    if (!realResourcePath) return false
    return this.device.LOCK(realResourcePath)
  }
  public async MKCOL (resourcePath: ResourcePath) {
    const realResourcePath = this.getResourcePath(resourcePath)
    if (!realResourcePath) return false
    return this.device.MKCOL(realResourcePath)
  }
  public async MOVE (resourcePath: ResourcePath) {
    const realResourcePath = this.getResourcePath(resourcePath)
    if (!realResourcePath) return false
    return this.device.MOVE(realResourcePath)
  }
  public async PROPFIND (resourcePath: ResourcePath, options: PropfindOptions) {
    const realResourcePath = this.getResourcePath(resourcePath)
    let list: PropfindResult = []
    if (!realResourcePath) {
      await baseMatchPath(this.path, resourcePath.toRaw(), {
        [MatchPathResult.MATCH]: noneAsync,
        [MatchPathResult.UNDER]: noneAsync,
        [MatchPathResult.NOT]: noneAsync,
        [MatchPathResult.IN]: async ({ index, mountPaths }) => {
          switch (options.depth) {
            case 1:
              list.push({
                path: path.join('/', mountPaths.slice(0, index + 1).join('/')),
                mtime: this.updatedAt,
                size: 0,
                mime: null,
                type: StatType.Directory,
                name: mountPaths[index],
              })
            case 0:
              list.push({
                path: path.join('/', mountPaths.slice(0, index).join('/')),
                mtime: this.updatedAt,
                size: 0,
                mime: null,
                type: StatType.Directory,
                name: mountPaths[index],
              })
          }
          return
        },
      })
    } else {
      const result = await this.device.PROPFIND(realResourcePath, options)
      list.push(...result
        .map((item) => ({ ...item, path: path.join(this.path, item.path) }))
      )
    }
    return list
  }
  public async PUT (resourcePath: ResourcePath, content: Buffer | string, options?: PUTOptions) {
    const realResourcePath = this.getResourcePath(resourcePath)
    if (!realResourcePath) return false
    return this.device.PUT(realResourcePath, content, options)
  }
  public async UNLOCK (resourcePath: ResourcePath) {
    const realResourcePath = this.getResourcePath(resourcePath)
    if (!realResourcePath) return false
    return this.device.UNLOCK(realResourcePath)
  }
}
