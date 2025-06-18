import { Readable } from 'stream'
import { ResourcePath } from '../../utils/ResourcePath'

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

export abstract class BaseDevice {
  protected abstract deviceName: string
  protected abstract path: string
  public abstract toJSON (): { type: string, path: string } & object;
  public abstract COPY (resourcePath: ResourcePath): Promise<boolean>
  public abstract DELETE (resourcePath: ResourcePath): Promise<boolean>
  public abstract GET (resourcePath: ResourcePath, options?: GetOptions): Promise<Readable | undefined>
  public abstract HEAD (resourcePath: ResourcePath): Promise<StatResult | undefined>
  public abstract LOCK (resourcePath: ResourcePath): Promise<boolean>
  public abstract MKCOL (resourcePath: ResourcePath): Promise<boolean>
  public abstract MOVE (resourcePath: ResourcePath): Promise<boolean>
  public abstract PROPFIND (resourcePath: ResourcePath, options: PropfindOptions): Promise<PropfindResult>
  public abstract PUT (resourcePath: ResourcePath, content: Buffer | string, options?: PUTOptions): Promise<boolean>
  public abstract UNLOCK (resourcePath: ResourcePath): Promise<boolean>
}
