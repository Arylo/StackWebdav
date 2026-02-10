import type { Context } from 'koa'
import { getMounts } from '../getMounts'
import { findMount, getRequestSubpath, toAdapterPath } from '../utils'

export function mkcolHandler() {
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
    if (stat.exists) {
      ctx.status = 405
      return
    }

    await match.adapter.mkdir(adapterPath)
    ctx.status = 201
  }
}
