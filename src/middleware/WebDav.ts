import type { Middleware } from "koa";
import { findUpSync } from 'find-up'
import { METHOD } from "../controller/constant";

const PROJECT_FILE_PATH = findUpSync('package.json') as string

export default () => {
  const middleware: Middleware = async (ctx, next) => {
    await next()
    ctx.set('Server', `stack-webdav/${require(PROJECT_FILE_PATH).version}`)
    ctx.set('DAV', '1,2')
    ctx.set('Allow', Object.values(METHOD).join(','))
  }
  return middleware
}
