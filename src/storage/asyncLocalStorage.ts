import { AsyncLocalStorage } from "async_hooks";
import { AsyncLocalStorageStore } from './type';

export const asyncLocalStorage = new AsyncLocalStorage<AsyncLocalStorageStore>()

