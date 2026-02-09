import { Middleware } from "koa";
import { renderPROPFIND } from './template';
import StorageManager from '../../storage/StorageManager';

const PROPFIND: Middleware = async (ctx) => {
  const depthParam = ctx.get('DEPTH')
  let depth = isNaN(Number(depthParam)) ? 0 : Number(depthParam)
  if (![0, 1].includes(depth)) {
    depth = 0
  }
  const result = await StorageManager.PROPFIND(ctx.url, { depth })
  ctx.status = result.statusCode
  if (result.data)  {
    const entries = result.data.map((entry) => {
      const isDirectory = entry.type === 'directory'
      return {
        href: isDirectory ? (!entry.path.endsWith('/') ? `${entry.path}/` : entry.path) : entry.path,
        size: entry.size,
        mtime: entry.mtime.toUTCString(),
        isDirectory: isDirectory,
        contentType: entry.mime,
        displayName: entry.name,
      }
    }) ?? []
    ctx.body = renderPROPFIND(entries)
    ctx.set('Content-Type', 'application/xml')
  }
}

export default PROPFIND
