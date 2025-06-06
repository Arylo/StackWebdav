import path from "path"
import koaStatic from 'koa-static'
import Koa, { Middleware } from 'koa'
import webdavControllers from './controller/Webdav'
import serverControllers from './controller/server'
import UAMw, { UATarget } from './middleware/UA'
import LoggerMw from './middleware/Logger'
import WebDavMw from './middleware/WebDav'
import { ROOT_PATH } from "./constant"

const app = new Koa()

app.use(LoggerMw())
app.use(UAMw({ target: UATarget.DEVICE }, WebDavMw()))
app.use(UAMw({ target: UATarget.DEVICE }, webdavControllers()))
app.use(UAMw({ target: UATarget.BROWSER }, serverControllers as Middleware))
app.use(UAMw({ target: UATarget.BROWSER }, koaStatic(path.resolve(ROOT_PATH, './dist/public'))))

export default app
