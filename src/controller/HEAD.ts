import { Middleware } from "koa";
import Status from 'http-status';
import { nonFound } from './utils';
import { getStores } from '../store';

const HEAD: Middleware = async (ctx) => {
  const stores = getStores()
  for (const store of stores) {
    const isExist = await store.has(ctx.url)
    if (!isExist) continue
    const stat = await store.stat(ctx.url)
    ctx.set('Content-Length', (stat.type === 'directory' ? 0 : stat.size).toString())
    if (stat.type === 'file') {
      ctx.set('Content-Type', stat.mime as string)
    }
    ctx.body = ''
    ctx.status = Status.OK
    return
  }
  return nonFound(ctx)
}

export default HEAD
