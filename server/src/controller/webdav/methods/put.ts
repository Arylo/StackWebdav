import type { Context } from 'koa'
import { getMounts } from '../getMounts'
import { findMount, getRequestSubpath, readRequestBody, toAdapterPath } from '../utils'

export function putHandler() {
  return async (ctx: Context) => {
    const mounts = await getMounts(ctx)
    const webdavPath = getRequestSubpath(ctx)
    const match = findMount(mounts, webdavPath)
    if (!match) {
      ctx.status = 404
      return
    }

    const adapterPath = toAdapterPath(match.subPath)
    const data = await readRequestBody(ctx.req)
    await match.adapter.write(adapterPath, data)
    ctx.status = 201
  }
}
