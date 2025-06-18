import { Readable } from "stream"
import { StatResult, PropfindResult } from "./devices/BaseDevice"
import getPassedStorages from "./getPassedStorages"
import genResourcePath from '../utils/ResourcePath'

export enum STATUS_MESSAGE {
  OK = 'Okay',
  CREATED = 'Created',
  EXISTS = 'Exists',
  NOT_STORAGE = 'Not Storage',
  NOT_FOUND = 'Not Found',
}

export type GETResult = [STATUS_MESSAGE.NOT_STORAGE | STATUS_MESSAGE.NOT_FOUND] | [STATUS_MESSAGE.OK, Readable]
export type GETOptions = {
  start: number,
  end: number,
}
export type MKCOLResult = [STATUS_MESSAGE.OK | STATUS_MESSAGE.EXISTS | STATUS_MESSAGE.NOT_STORAGE]
export type HEADResult = [STATUS_MESSAGE.NOT_FOUND | STATUS_MESSAGE.NOT_STORAGE] | [STATUS_MESSAGE.OK, StatResult]
export type DELETEResult = [STATUS_MESSAGE.NOT_FOUND | STATUS_MESSAGE.NOT_STORAGE | STATUS_MESSAGE.OK]
export type PROPFINDResult = [STATUS_MESSAGE.NOT_FOUND | STATUS_MESSAGE.NOT_STORAGE] | [STATUS_MESSAGE.OK, PropfindResult]
export type PUTOptions = {
  start: number,
  end: number,
}
export type PUTResult = [STATUS_MESSAGE.NOT_STORAGE | STATUS_MESSAGE.OK | STATUS_MESSAGE.CREATED]

export default new class StorageManager {
  public async GET (resourcePath: string, options?: GETOptions): Promise<GETResult> {
    const storages = getPassedStorages(resourcePath)
    if (storages.length === 0) {
      return [STATUS_MESSAGE.NOT_STORAGE]
    }
    for (const storage of storages) {
      const content = await storage.GET(genResourcePath(resourcePath), options)
      if (typeof content !== 'undefined') {
        return [STATUS_MESSAGE.OK, content]
      }
    }
    return [STATUS_MESSAGE.NOT_FOUND]
  }
  public async MKCOL (resourcePath: string): Promise<MKCOLResult> {
    const storages = getPassedStorages(resourcePath)
    if (storages.length === 0) {
      return [STATUS_MESSAGE.NOT_STORAGE]
    }
    for (const storage of storages) {
      const stat = await storage.HEAD(genResourcePath(resourcePath))
      if (stat) {
        return [STATUS_MESSAGE.EXISTS]
      }
    }
    await storages[0].MKCOL(genResourcePath(resourcePath))
    return [STATUS_MESSAGE.OK]
  }
  public async HEAD (resourcePath: string): Promise<HEADResult> {
    const storages = getPassedStorages(resourcePath)
    if (storages.length === 0) {
      return [STATUS_MESSAGE.NOT_STORAGE]
    }
    for (const storage of storages) {
      const stat = await storage.HEAD(genResourcePath(resourcePath))
      if (stat) return [STATUS_MESSAGE.OK, stat]
    }
    return [STATUS_MESSAGE.NOT_FOUND]
  }
  public async DELETE (resourcePath: string): Promise<DELETEResult> {
    if (resourcePath === '/') {
      return [STATUS_MESSAGE.NOT_FOUND]
    }
    const storages = getPassedStorages(resourcePath)
    if (storages.length === 0) {
      return [STATUS_MESSAGE.NOT_STORAGE]
    }
    for (const storage of storages) {
      const stat = await storage.HEAD(genResourcePath(resourcePath))
      if (stat) {
        await storage.DELETE(genResourcePath(resourcePath))
        return [STATUS_MESSAGE.OK]
      }
    }
    return [STATUS_MESSAGE.NOT_FOUND]
  }
  public async PROPFIND (resourcePath: string, options: { depth: number }): Promise<PROPFINDResult> {
    const storages = getPassedStorages(resourcePath)
    if (storages.length === 0) {
      return [STATUS_MESSAGE.NOT_STORAGE]
    }
    const list = (await Promise.all(storages.map(storage => storage.PROPFIND(genResourcePath(resourcePath), { depth: options.depth }))))
      .flat()
    if (list.length === 0) {
      return [STATUS_MESSAGE.NOT_FOUND]
    }
    return [STATUS_MESSAGE.OK, list]
  }
  public async PUT (resourcePath: string, data: Buffer | string, options?: PUTOptions): Promise<PUTResult> {
    const storages = getPassedStorages(resourcePath)
    if (storages.length === 0) {
      return [STATUS_MESSAGE.NOT_STORAGE]
    }
    const targetStorage = storages[0]
    const stat = await targetStorage.HEAD(genResourcePath(resourcePath))
    if (stat) {
      await targetStorage.PUT(genResourcePath(resourcePath), data, options)
      return [STATUS_MESSAGE.OK]
    } else {
      // Create File
      await targetStorage.PUT(genResourcePath(resourcePath), data, options)
      return [STATUS_MESSAGE.CREATED]
    }
  }

}
