import type { Context } from 'koa'

export function optionsHandler() {
  return async (ctx: Context) => {
    ctx.set('DAV', '1,2')
    ctx.set('Allow', 'OPTIONS, PROPFIND, GET, PUT, DELETE, MKCOL, MOVE, COPY')
    ctx.status = 200
  }
}
