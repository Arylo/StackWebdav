import fs from 'fs'
import { nanoid } from "nanoid"

export interface Store {
  id: string,
  path: string,
  device: {
    type: 'local',
    path: string,
    filter?: string,
  },
}

export interface AsyncLocalStorageStore {
  stores: Store[],
}

export interface CreateOptions {
  type: 'file' | 'directory',
}

export interface StatResult {
  mtime: Date,
  size: number,
  mime: string,
  type: 'file' | 'directory'
}

export abstract class BaseStore {
  protected id!: Store['id']
  protected path!: Store['path']
  protected device!: Store['device']
  constructor () {
    this.id = nanoid()
  }
  public getStoreInfo () {
    return {
      id: this.id,
      path: this.path,
      device: this.device,
    }
  }
  public abstract has (targetPath: string): Promise<boolean>
  public abstract create (targetPath: string, options: CreateOptions): Promise<boolean>
  public abstract delete (targetPath: string): Promise<unknown>
  public abstract get (targetPath: string): Promise<fs.ReadStream>
  public abstract stat (targetPath: string): Promise<StatResult>
  public abstract lock (targetPath: string): Promise<unknown>
  public abstract unlock (targetPath: string): Promise<unknown>
}
