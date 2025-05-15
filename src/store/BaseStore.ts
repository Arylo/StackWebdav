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
  public abstract has (targetPath: string): Promise<boolean>
  public abstract create (targetPath: string, options: CreateOptions): Promise<boolean>
  public abstract update (targetPath: string, content: string | fs.ReadStream): Promise<unknown>
  public abstract delete (targetPath: string): Promise<boolean>
  public abstract get (targetPath: string, options: GetOptions): Promise<fs.ReadStream>
  public abstract stat (targetPath: string): Promise<StatResult>
  public abstract lock (targetPath: string): Promise<unknown>
  public abstract unlock (targetPath: string): Promise<unknown>
}
