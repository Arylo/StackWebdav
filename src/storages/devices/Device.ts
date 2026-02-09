import { Readable } from 'stream'
import { PathGroup } from '../../utils/genPathGroup'

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

export abstract class Device {
  protected abstract deviceName: string
  protected abstract path: string
  public abstract toJSON (): { type: string, path: string } & object;
  public abstract COPY (pathGroup: PathGroup): Promise<boolean>
  public abstract DELETE (pathGroup: PathGroup): Promise<boolean>
  public abstract GET (pathGroup: PathGroup, options?: GetOptions): Promise<Readable | undefined>
  public abstract HEAD (pathGroup: PathGroup): Promise<StatResult | undefined>
  public abstract LOCK (pathGroup: PathGroup): Promise<boolean>
  public abstract MKCOL (pathGroup: PathGroup): Promise<boolean>
  public abstract MOVE (pathGroup: PathGroup): Promise<boolean>
  public abstract PROPFIND (pathGroup: PathGroup, options: PropfindOptions): Promise<PropfindResult>
  public abstract PUT (pathGroup: PathGroup, content: Buffer | string, options?: PUTOptions): Promise<boolean>
  public abstract UNLOCK (pathGroup: PathGroup): Promise<boolean>
}
