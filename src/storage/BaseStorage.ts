import fs from 'fs'
import { nanoid } from "nanoid"

export interface CreateOptions {
  type: 'file' | 'directory',
}
export interface GetOptions {
  start: number,
  end: number,
}

export enum StatType {
  File = 'file',
  Directory = 'directory',
}

export interface StatResult {
  mtime: Date,
  size: number,
  mime: string | null,
  type: StatType,
}

export interface PropfindOptions {
  depth: number,
}

interface PropfindResultItem extends StatResult {
  path: string,
  name: string,
}

export type PropfindResult = PropfindResultItem[]

export abstract class BaseStore {
  protected id!: string
  protected path!: string
  protected device!: { type: string, path: string, filter?: string }
  constructor (mountPath: string, options: { path: string, filter?: string }) {
    this.id = nanoid()
    this.path = mountPath
    this.device = {
      type: 'unknown',
      path: options.path,
      filter: options.filter,
    }
  }
  public getStoreInfo () {
    return {
      id: this.id,
      path: this.path,
      device: this.device,
    }
  }
  public check (resourcePath: string) {
    return decodeURIComponent(resourcePath).startsWith(this.path) // && this.device.filter
  }
  public abstract COPY (resourcePath: string): Promise<boolean>
  public abstract DELETE (resourcePath: string): Promise<boolean>
  public abstract GET (resourcePath: string, options: GetOptions): Promise<fs.ReadStream | undefined>
  public abstract HEAD (resourcePath: string): Promise<StatResult | undefined>
  public abstract LOCK (resourcePath: string): Promise<boolean>
  public abstract MKCOL (resourcePath: string): Promise<boolean>
  public abstract MOVE (resourcePath: string): Promise<boolean>
  public abstract POST (resourcePath: string): Promise<boolean>
  public abstract PROPFIND (resourcePath: string, options: PropfindOptions): Promise<PropfindResult>
  public abstract PUT (resourcePath: string): Promise<boolean>
  public abstract UNLOCK (resourcePath: string): Promise<boolean>
  public abstract create (resourcePath: string, options: CreateOptions): Promise<boolean>
  public abstract update (resourcePath: string, content: string | fs.ReadStream): Promise<unknown>
}
