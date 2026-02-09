import type { Context } from 'koa'
import type { WebdavMount } from './types'

export async function getMounts(ctx: Context): Promise<WebdavMount[]> {
  if (ctx?.state?.webdavMounts) {
    return ctx.state.webdavMounts as WebdavMount[]
  }
  return []
}
