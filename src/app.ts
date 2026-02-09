import path from "path"
import koaStatic from 'koa-static'
import Koa, { Middleware } from 'koa'
import webdavControllers from './old/controller/Webdav'
import serverControllers from './old/controller/server'
import UAMw, { UATarget } from './old/middleware/UA'
import LoggerMw from './middlewares/Logger'
import WebDavMw from './middlewares/WebDav'
import { ROOT_PATH } from "./storages/common/constant"

const app = new Koa()

app.use(LoggerMw())
// app.use(UAMw({ target: UATarget.DEVICE }, WebDavMw()))
// app.use(UAMw({ target: UATarget.DEVICE }, webdavControllers()))
// app.use(UAMw({ target: UATarget.BROWSER }, serverControllers as Middleware))
app.use(koaStatic(path.resolve(ROOT_PATH, './dist/public')))

export default app
