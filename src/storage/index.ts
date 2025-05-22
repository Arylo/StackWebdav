import lodash from 'lodash'
import { AsyncLocalStorage } from "async_hooks";
import { AsyncLocalStorageStore } from './type';
import { BaseStore } from './BaseStorage';

type Fn = () => any

const asyncLocalStorage = new AsyncLocalStorage<AsyncLocalStorageStore>()
const DEFAULT_STORE: AsyncLocalStorageStore = {
  storages: [],
}

export const withStorages = <CB extends Fn>(cb: CB) => {
  return asyncLocalStorage.run(lodash.cloneDeep(DEFAULT_STORE), cb)
}

const storages = new class  {
  public getAll () {
    const currentLocalStorage =  asyncLocalStorage.getStore()
    if (!currentLocalStorage) {
      console.warn('No AsyncLocalStorage env')
    }
    return currentLocalStorage?.storages ?? []
  }
  public add (storage: BaseStore) {
    const currentLocalStorage =  asyncLocalStorage.getStore()
    if (!currentLocalStorage) {
      console.warn('No AsyncLocalStorage env')
    }
    (currentLocalStorage?.storages || []).push(storage)
  }
}

export function addStorage (storage: BaseStore) {
  return storages.add(storage)
}

export function getStorages () {
  return storages.getAll()
}
