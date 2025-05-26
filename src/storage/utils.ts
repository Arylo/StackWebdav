import path from 'path'
import fs from 'fs'
import lodash from 'lodash';
import { asyncLocalStorage } from './index';
import { BaseStore } from './BaseStorage';
import { AsyncLocalStorageStore } from './type';
import * as settings from '../settings'
import { LocalStorage } from './LocalStorage';

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
    const { storages } = JSON.parse(content)
    this.update({
      storages: (storages as any[])
        .map((storageConfig) => {
          return LocalStorage.from(storageConfig)
        })
        .filter(Boolean) as BaseStore[],
    })
  }
  public getAll() {
    const store = this.getStore();
    return store?.storages ?? [];
  }
  public add(storage: BaseStore) {
    const storages = this.getAll()
    storages.push(storage)
    this.update({ storages })
    this.storeToHardDist()
  }
  public removeById (id: string) {
    const storages = this.getStore()?.storages || []
    this.update({ storages: lodash.remove(storages, (storage) => storage.getStoreInfo().id === id) })
    this.storeToHardDist()
  }
};

export function addStorage(storage: BaseStore) {
  return storages.add(storage);
}

export function removeStorageById(id: string) {
  return storages.removeById(id)
}

export function getStorages() {
  return storages.getAll();
}

export function loadConfig () {
  return storages.loadConfig()
}
