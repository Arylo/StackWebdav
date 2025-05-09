import { Middleware } from 'koa'
import { METHOD } from './constant'
import OPTIONS from './OPTIONS'
import PROPFIND from './PROPFIND'
import HEAD from './HEAD'
import MKCOL from './MKCOL'

const controller = (): Middleware => (ctx, next) => {
  const { method } = ctx
  switch (method.toUpperCase()) {
    case METHOD.OPTIONS: return OPTIONS(ctx, next)
    case METHOD.PROPFIND: return PROPFIND(ctx, next)
    case METHOD.HEAD: return HEAD(ctx, next)
    case METHOD.MKCOL: return MKCOL(ctx, next)
  }
}

export default controller
