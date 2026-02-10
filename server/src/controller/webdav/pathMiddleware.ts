import type { Context } from 'koa'

export function webdavPathMiddleware(basePath: string) {
  const normalizedBase = basePath.replace(/\/$/, '') || '/'

  return async (ctx: Context, next: () => Promise<unknown>) => {
    const raw = ctx.path
    let subpath = raw
    if (normalizedBase !== '/' && raw.startsWith(normalizedBase)) {
      subpath = raw.slice(normalizedBase.length)
    }
    if (!subpath.startsWith('/')) subpath = `/${subpath}`
    ctx.state.webdavSubpath = subpath
    await next()
  }
}
