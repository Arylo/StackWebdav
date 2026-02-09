import Status from 'http-status'
import type { Middleware } from "koa";

const OPTIONS: Middleware = (ctx) => {
  ctx.set('Content-Length', '0')
  ctx.body = ''
  ctx.status = Status.OK
}

export default OPTIONS
