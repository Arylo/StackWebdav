import { Middleware } from "koa";
import StorageManager from "../../storage/StorageManager";

const HEAD: Middleware = async (ctx) => {
  const result = await StorageManager.HEAD(ctx.url)
  ctx.status = result.statusCode
  if (result.data) {
    const stat = result.data
    ctx.set('Content-Length', (stat.type === 'directory' ? 0 : stat.size).toString())
    if (stat.type === 'file') {
      ctx.set('Content-Type', stat.mime as string)
    }
    ctx.body = ''
  }
}

export default HEAD
