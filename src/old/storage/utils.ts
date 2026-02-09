import path from 'path'
import fs from 'fs'
import lodash from 'lodash';
import { asyncLocalStorage } from './asyncLocalStorage';
import { AsyncLocalStorageStore } from './type.d';
import * as settings from '../../storages/common/settings'
import Storage from './Storage';

export type Fn = () => any

export const DEFAULT_STORE: AsyncLocalStorageStore = {
  storages: [],
}

export const withStorages = <CB extends Fn>(cb: CB) => {
  return asyncLocalStorage.run(lodash.cloneDeep(DEFAULT_STORE), cb);
};

const storages = new class {
  private getStore () {
    const currentLocalStore = asyncLocalStorage.getStore();
    if (!currentLocalStore) {
      console.warn('No AsyncLocalStorage env');
      return
    }
    return currentLocalStore
  }
  private update (obj: any) {
    const store = this.getStore()
    asyncLocalStorage.enterWith({
      ...store,
      ...obj,
    })
  }
  private async storeToHardDist () {
    const storages = this.getAll()
    await fs.promises.mkdir(path.dirname(settings.CONFIG_PATH), { recursive: true })
    await fs.promises.writeFile(
      path.resolve(settings.CONFIG_PATH, 'config.json'),
      JSON.stringify({ storages }, null, 2),
      'utf-8'
    )
  }
  public loadConfig () {
    const configPath = path.resolve(settings.CONFIG_PATH, 'config.json')
    if (!fs.existsSync(configPath) || !fs.statSync(configPath).isFile()) {
      console.warn('Non Found the config file')
      return
    }
    const content = fs.readFileSync(configPath, 'utf-8')
    const { storages = [] } = JSON.parse(content)
    const storageInstants = (storages as any[])
      .map((storageConfig) => {
        return Storage.createFromJSON(storageConfig)
      })
      .filter(Boolean)
    this.update({
      storages: storageInstants,
    })
  }
  public getAll() {
    const store = this.getStore();
    return store?.storages ?? [];
  }
  public add(storage: Storage) {
    const storages = this.getAll()
    storages.push(storage)
    this.update({ storages })
    this.storeToHardDist()
  }
  public updateById (id: string, obj: any) {
    const storages = this.getAll()
    const currentStorageIndex = lodash.findIndex(storages, (storage) => storage.toJSON().id === id)
    if (currentStorageIndex === -1) return
    storages[currentStorageIndex] = lodash.merge(storages[currentStorageIndex], obj, {
      id,
    })
    this.update({ storages: storages })
    this.storeToHardDist()
  }
  public removeById (id: string) {
    const storages = this.getAll()
    this.update({ storages: lodash.remove(storages, (storage) => storage.toJSON().id === id) })
    this.storeToHardDist()
  }
};

export const addStorage = storages.add.bind(storages)

export const updateStorageById = storages.updateById.bind(storages)

export const removeStorageById = storages.removeById.bind(storages)

export const getStorages = storages.getAll.bind(storages)

export const loadConfig = storages.loadConfig.bind(storages)
