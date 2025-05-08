import Status from 'http-status'
import { Middleware } from "koa";
import { METHOD } from './constant';

const allow: Middleware = (ctx) => {
  ctx.set('DAV', '1, 2')
  ctx.set('Allow', Object.values(METHOD).join(', '))
  ctx.set('Content-Length', '0')
  ctx.body = ''
  ctx.status = Status.OK
}

export default allow
