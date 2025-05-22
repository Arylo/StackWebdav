import fs from 'fs'
import { nanoid } from "nanoid"

export interface CreateOptions {
  type: 'file' | 'directory',
}
export interface GetOptions {
  start: number,
  end: number,
}

export interface StatResult {
  mtime: Date,
  size: number,
  mime: string | null,
  type: 'file' | 'directory'
}

export abstract class BaseStore {
  protected id!: string
  protected path!: string
  protected device!: { type: string, path: string, filter?: string }
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
  public check (targetPath: string) {
    return decodeURIComponent(targetPath).startsWith(this.path) // && this.device.filter
  }
  public abstract COPY (targetPath: string): Promise<boolean>
  public abstract DELETE (targetPath: string): Promise<boolean>
  public abstract GET (targetPath: string, options: GetOptions): Promise<fs.ReadStream | undefined>
  public abstract HEAD (targetPath: string): Promise<StatResult | undefined>
  public abstract LOCK (targetPath: string): Promise<boolean>
  public abstract MKCOL (targetPath: string): Promise<boolean>
  public abstract MOVE (targetPath: string): Promise<boolean>
  public abstract POST (targetPath: string): Promise<boolean>
  public abstract PROPFIND (targetPath: string): Promise<boolean | undefined>
  public abstract PUT (targetPath: string): Promise<boolean>
  public abstract UNLOCK (targetPath: string): Promise<boolean>
  public abstract create (targetPath: string, options: CreateOptions): Promise<boolean>
  public abstract update (targetPath: string, content: string | fs.ReadStream): Promise<unknown>
}
