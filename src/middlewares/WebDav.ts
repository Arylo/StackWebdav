import type { Middleware } from "koa";
import { METHOD } from "../old/controller/Webdav/constant";
import pkgInfo from '../storages/common/packageInfo'

export default () => {
  const middleware: Middleware = async (ctx, next) => {
    await next()
    ctx.set('Server', `${pkgInfo.name}/${pkgInfo.version}`)
    ctx.set('DAV', '1,2')
    ctx.set('Allow', Object.values(METHOD).join(','))

    // Support Microsoft
    ctx.set('MS-Author-Via', 'DAV')
  }
  return middleware
}
