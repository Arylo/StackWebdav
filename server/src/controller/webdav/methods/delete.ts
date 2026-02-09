import type { Context } from 'koa'
import { getMounts } from '../getMounts'
import { findMount, normalizeWebdavPath, toAdapterPath } from '../utils'

export function deleteHandler() {
  return async (ctx: Context) => {
    const mounts = await getMounts(ctx)
    const webdavPath = normalizeWebdavPath(ctx.params.path)
    const match = findMount(mounts, webdavPath)
    if (!match) {
      ctx.status = 404
      return
    }

    const adapterPath = toAdapterPath(match.subPath)
    await match.adapter.delete(adapterPath)
    ctx.status = 204
  }
}
