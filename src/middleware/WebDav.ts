import type { Middleware } from "koa";
import { findUpSync } from 'find-up'
import { METHOD } from "../controller/Webdav/constant";

export default () => {
  const PROJECT_FILE_PATH = findUpSync('package.json') as string
  const { name, version } = require(PROJECT_FILE_PATH)
  const middleware: Middleware = async (ctx, next) => {
    await next()
    ctx.set('Server', `${name}/${version}`)
    ctx.set('DAV', '1,2')
    ctx.set('Allow', Object.values(METHOD).join(','))

    // Support Microsoft
    ctx.set('MS-Author-Via', 'DAV')
  }
  return middleware
}
