import { Middleware } from "koa";
import Status from 'http-status';
import { nonFound } from './utils';
import getResource from "../store/getResource";

const HEAD: Middleware = async (ctx) => {
  const resource = await getResource(ctx.url)
  if (!resource) return nonFound(ctx)
  ctx.set('Content-Length', (resource.type === 'directory' ? 0 : resource.size).toString())
  if (resource.type === 'file') {
    ctx.set('Content-Type', resource.mime as string)
  }
  ctx.body = ''
  ctx.status = Status.OK
}

export default HEAD
