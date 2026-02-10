import type { Context } from 'koa'

export function accessLogMiddleware() {
  return async (ctx: Context, next: () => Promise<unknown>) => {
    const start = Date.now()
    const startTs = new Date(start).toISOString()
    console.log(`[${startTs}] START ${ctx.method} ${ctx.path}`)
    try {
      await next()
    } finally {
      const end = Date.now()
      const ms = end - start
      const endTs = new Date(end).toISOString()
      console.log(`[${endTs}] END ${ctx.method} ${ctx.status} ${ctx.path} - ${ms}ms`)
    }
  }
}
