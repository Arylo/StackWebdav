import type { Context } from 'koa'
import { getMounts } from '../getMounts'
import { findMount, getDestinationPath, normalizeDestinationForMount, normalizeWebdavPath, toAdapterPath } from '../utils'

export function moveHandler() {
  return async (ctx: Context) => {
    const mounts = await getMounts(ctx)
    const dest = getDestinationPath(ctx)
    if (!dest) {
      ctx.status = 400
      ctx.body = { message: 'Missing Destination header' }
      return
    }

    const srcWebdav = normalizeWebdavPath(ctx.params.path)
    const srcMatch = findMount(mounts, srcWebdav)
    const destNormalized = normalizeDestinationForMount(ctx, dest)
    const destMatch = findMount(mounts, destNormalized)
    if (!srcMatch || !destMatch || srcMatch.adapter !== destMatch.adapter) {
      ctx.status = 409
      ctx.body = { message: 'MOVE across different mounts is not supported' }
      return
    }

    const srcPath = toAdapterPath(srcMatch.subPath)
    const destPath = toAdapterPath(destMatch.subPath)

    await srcMatch.adapter.move(srcPath, destPath)
    ctx.status = 201
  }
}
