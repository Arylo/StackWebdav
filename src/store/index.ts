import lodash from 'lodash'
import { AsyncLocalStorage } from "async_hooks";
import { AsyncLocalStorageStore } from './type.d';
import { BaseStore } from './BaseStore';

type Fn = () => any

const asyncLocalStorage = new AsyncLocalStorage<AsyncLocalStorageStore>()
const DEFAULT_STORE: AsyncLocalStorageStore = {
  stores: [],
}

export const withStore = <CB extends Fn>(cb: CB) => {
  return asyncLocalStorage.run(lodash.cloneDeep(DEFAULT_STORE), cb)
}

export const addStore = (store: BaseStore) => {
  const localStore =  asyncLocalStorage.getStore()
  if (!localStore) {
    console.warn('No AsyncLocalStorage env')
  }
  (localStore?.stores || []).push(store)
}

export function getStores () {
  const store =  asyncLocalStorage.getStore()
  if (!store) {
    console.warn('No AsyncLocalStorage env')
  }
  return store?.stores ?? []
}
