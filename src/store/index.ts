import lodash from 'lodash'
import { AsyncLocalStorage } from "async_hooks";
import { AsyncLocalStorageStore } from './BaseStore';

type Fn = () => any

const asyncLocalStorage = new AsyncLocalStorage<AsyncLocalStorageStore>()
const DEFAULT_STORE: AsyncLocalStorageStore = {
  stores: [],
}

export const withStore = <CB extends Fn>(cb: CB) => {
  return asyncLocalStorage.run(lodash.cloneDeep(DEFAULT_STORE), cb)
}
