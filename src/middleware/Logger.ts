import type { Middleware } from "koa";
import { findUpSync } from 'find-up'

export default () => {
  const middleware: Middleware = async (ctx, next) => {
    console.info(ctx.method, ctx.href, '......')
    const startAt = Date.now()
    await next()
    const endAt = Date.now()
    console.info(ctx.method, ctx.href, '......', `${endAt-startAt}ms`, ctx.status)
  }
  return middleware
}
