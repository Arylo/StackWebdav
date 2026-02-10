import type { Context } from 'koa'
import { getMounts } from '../getMounts'
import { findMount, getRequestSubpath, toAdapterPath } from '../utils'

export function getHandler() {
  return async (ctx: Context) => {
    const mounts = await getMounts(ctx)
    const webdavPath = getRequestSubpath(ctx)
    const match = findMount(mounts, webdavPath)
    if (!match) {
      ctx.status = 404
      return
    }

    const adapterPath = toAdapterPath(match.subPath)
    const stat = await match.adapter.stat(adapterPath)
    if (!stat.exists) {
      ctx.status = 404
      return
    }
    if (stat.isDirectory) {
      ctx.status = 403
      ctx.body = { message: 'Cannot GET a collection' }
      return
    }

    const data = await match.adapter.read(adapterPath)
    ctx.status = 200
    ctx.body = Buffer.from(data)
  }
}
