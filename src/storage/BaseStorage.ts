import { nanoid } from "nanoid"
import { Readable } from 'stream'

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

export interface PUTOptions {
  start?: number,
  end?: number
}

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
  public abstract GET (resourcePath: string, options?: GetOptions): Promise<Readable | undefined>
  public abstract HEAD (resourcePath: string): Promise<StatResult | undefined>
  public abstract LOCK (resourcePath: string): Promise<boolean>
  public abstract MKCOL (resourcePath: string): Promise<boolean>
  public abstract MOVE (resourcePath: string): Promise<boolean>
  public abstract PROPFIND (resourcePath: string, options: PropfindOptions): Promise<PropfindResult>
  public abstract PUT (resourcePath: string, content: Buffer | string, options?: PUTOptions): Promise<boolean>
  public abstract UNLOCK (resourcePath: string): Promise<boolean>
}
