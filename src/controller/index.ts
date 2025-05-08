import { Middleware } from 'koa'
import { METHOD } from './constant'
import allow from './allow'
import info from './info'
import head from './head'
import createFolder from './createFolder'

const controller = (): Middleware => (ctx, next) => {
  const { method } = ctx
  console.log(method)
  switch (method) {
    case METHOD.OPTIONS: return allow(ctx, next)
    case METHOD.PROPFIND: return info(ctx, next)
    case METHOD.HEAD: return head(ctx, next)
    case METHOD.MKCOL: return createFolder(ctx, next)
  }
}

export default controller
