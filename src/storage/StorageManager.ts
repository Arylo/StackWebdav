import getPassedStorages from "./getPassedStorages"
import genResourcePath from '../utils/ResourcePath'
import Result, { RESULT_STATUS } from "./Result"
import Status from 'http-status'

export type GETOptions = {
  start: number,
  end: number,
}
export type PUTOptions = {
  start: number,
  end: number,
}

export default new class StorageManager {
  public async GET (resourcePath: string, options?: GETOptions) {
    const storages = getPassedStorages(resourcePath)
    if (storages.length === 0) {
      return Result(RESULT_STATUS.NOT_STORAGE)
    }
    for (const storage of storages) {
      const content = await storage.GET(genResourcePath(resourcePath), options)
      if (typeof content !== 'undefined') {
        return Result(content)
      }
    }
    return Result(RESULT_STATUS.NOT_FOUND)
  }
  public async MKCOL (resourcePath: string) {
    const storages = getPassedStorages(resourcePath)
    if (storages.length === 0) {
      return Result(RESULT_STATUS.NOT_STORAGE)
    }
    for (const storage of storages) {
      const stat = await storage.HEAD(genResourcePath(resourcePath))
      if (stat) {
        return Result(RESULT_STATUS.EXISTS)
      }
    }
    await storages[0].MKCOL(genResourcePath(resourcePath))
    return Result(RESULT_STATUS.CREATED)
  }
  public async HEAD (resourcePath: string) {
    const storages = getPassedStorages(resourcePath)
    if (storages.length === 0) {
      return Result(RESULT_STATUS.NOT_STORAGE)
    }
    for (const storage of storages) {
      const stat = await storage.HEAD(genResourcePath(resourcePath))
      if (stat) return Result(stat)
    }
    return Result(RESULT_STATUS.NOT_FOUND)
  }
  public async DELETE (resourcePath: string) {
    if (resourcePath === '/') {
      return Result(RESULT_STATUS.NOT_FOUND)
    }
    const storages = getPassedStorages(resourcePath)
    if (storages.length === 0) {
      return Result(RESULT_STATUS.NOT_STORAGE)
    }
    for (const storage of storages) {
      const stat = await storage.HEAD(genResourcePath(resourcePath))
      if (stat) {
        await storage.DELETE(genResourcePath(resourcePath))
        return Result()
      }
    }
    return Result(RESULT_STATUS.NOT_FOUND)
  }
  public async PROPFIND (resourcePath: string, options: { depth: number }) {
    const storages = getPassedStorages(resourcePath)
    if (storages.length === 0) {
      return Result(RESULT_STATUS.NOT_STORAGE)
    }
    const list = (await Promise.all(storages.map(storage => storage.PROPFIND(genResourcePath(resourcePath), { depth: options.depth }))))
      .flat()
    if (list.length === 0) {
      return Result(RESULT_STATUS.NOT_FOUND)
    }
    return Result(list)
      .setCustomStatusCode(RESULT_STATUS.OK, Status.MULTI_STATUS)
  }
  public async PUT (resourcePath: string, data: Buffer | string, options?: PUTOptions) {
    const storages = getPassedStorages(resourcePath)
    if (storages.length === 0) {
      return Result(RESULT_STATUS.NOT_STORAGE)
    }
    const targetStorage = storages[0]
    const stat = await targetStorage.HEAD(genResourcePath(resourcePath))
    if (stat) {
      await targetStorage.PUT(genResourcePath(resourcePath), data, options)
      return Result()
    } else {
      // Create File
      await targetStorage.PUT(genResourcePath(resourcePath), data, options)
      return Result(RESULT_STATUS.CREATED)
    }
  }
}
