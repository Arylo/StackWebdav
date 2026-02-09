import { Middleware } from 'koa'
import { METHOD } from './constant'
import COPY from './COPY'
import DELETE from './DELETE'
import GET from './GET'
import HEAD from './HEAD'
import LOCK from './LOCK'
import MKCOL from './MKCOL'
import MOVE from './MOVE'
import OPTIONS from './OPTIONS'
import PROPFIND from './PROPFIND'
import PUT from './PUT'
import UNLOCK from './UNLOCK'

const controller = (): Middleware => (ctx, next) => {
  const { method } = ctx
  switch (method.toUpperCase()) {
    case METHOD.COPY: return COPY(ctx, next)
    case METHOD.DELETE: return DELETE(ctx, next)
    case METHOD.GET: return GET(ctx, next)
    case METHOD.HEAD: return HEAD(ctx, next)
    case METHOD.LOCK: return LOCK(ctx, next)
    case METHOD.MKCOL: return MKCOL(ctx, next)
    case METHOD.MOVE: return MOVE(ctx, next)
    case METHOD.OPTIONS: return OPTIONS(ctx, next)
    case METHOD.PROPFIND: return PROPFIND(ctx, next)
    case METHOD.PUT: return PUT(ctx, next)
    case METHOD.UNLOCK: return UNLOCK(ctx, next)
  }
}

export default controller
