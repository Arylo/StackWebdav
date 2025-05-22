import { StatResult } from "./BaseStorage"
import getPassedStorages from "./getPassedStorages"

export enum STATUS_MESSAGE {
  OK = 'Okay',
  EXISTS = 'Exists',
  NOT_STORAGE = 'Not Storage',
  NOT_FOUND = 'Not Found',
}

export type MKCOLResult = [STATUS_MESSAGE.OK | STATUS_MESSAGE.EXISTS | STATUS_MESSAGE.NOT_STORAGE]
export type HEADResult = [STATUS_MESSAGE.NOT_FOUND | STATUS_MESSAGE.NOT_STORAGE] | [STATUS_MESSAGE.OK, StatResult]

export default new class StorageManager {
  public async MKCOL (resourcePath: string): Promise<MKCOLResult> {
    const storages = getPassedStorages(resourcePath)
    if (storages.length === 0) {
      return [STATUS_MESSAGE.NOT_STORAGE]
    }
    for (const storage of storages) {
      const stat = await storage.HEAD(resourcePath)
      if (stat) {
        return [STATUS_MESSAGE.EXISTS]
      }
    }
    await storages[0].MKCOL(resourcePath)
    return [STATUS_MESSAGE.OK]
  }
  public async HEAD (resourcePath: string): Promise<HEADResult> {
    const storages = getPassedStorages(resourcePath)
    if (storages.length === 0) {
      return [STATUS_MESSAGE.NOT_STORAGE]
    }
    for (const storage of storages) {
      const stat = await storage.HEAD(resourcePath)
      if (stat) return [STATUS_MESSAGE.OK, stat]
    }
    return [STATUS_MESSAGE.NOT_FOUND]
  }
  public async DELETE (resourcePath: string) {
    const storages = getPassedStorages(resourcePath)
    if (storages.length === 0) {
      return [STATUS_MESSAGE.NOT_STORAGE]
    }
    for (const storage of storages) {
      const stat = await storage.HEAD(resourcePath)
      if (stat) {
        await storage.DELETE(resourcePath)
        return [STATUS_MESSAGE.OK]
      }
    }
    return [STATUS_MESSAGE.NOT_FOUND]
  }

}
