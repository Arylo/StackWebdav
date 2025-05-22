import { Middleware } from "koa";
import Status from 'http-status';
import { renderPROPFIND } from '../template';
import { nonFound, nonStorage } from './utils';
import StorageManager, { STATUS_MESSAGE } from '../storage/StorageManager';

const PROPFIND: Middleware = async (ctx) => {
  const depthParam = ctx.get('DEPTH')
  let depth = isNaN(Number(depthParam)) ? 0 : Number(depthParam)
  if (![0, 1].includes(depth)) {
    depth = 0
  }
  const [status, list] = await StorageManager.PROPFIND(ctx.url, { depth })
  if (status === STATUS_MESSAGE.OK)  {
    const entries = list.map((entry) => {
      const isDirectory = entry.type === 'directory'
      return {
        href: isDirectory ? (!entry.path.endsWith('/') ? `${entry.path}/` : entry.path) : entry.path,
        size: entry.size,
        mtime: entry.mtime.toUTCString(),
        isDirectory: isDirectory,
        contentType: entry.mime,
        displayName: entry.name,
      }
    })
    ctx.body = renderPROPFIND(entries)
    ctx.status = Status.MULTI_STATUS
    ctx.set('Content-Type', 'application/xml')
    return
  }
  if (status === STATUS_MESSAGE.NOT_STORAGE) {
    return nonStorage(ctx)
  }
  if (status === STATUS_MESSAGE.NOT_FOUND) {
    return nonFound(ctx)
  }
}

export default PROPFIND
