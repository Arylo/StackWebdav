import Koa, { Middleware } from 'koa'
import webdavControllers from './controller/Webdav'
import serverControllers from './controller/server'
import UAMw from './middleware/UA'
import LoggerMw from './middleware/Logger'
import WebDavMw from './middleware/WebDav'

const app = new Koa()

app.use(LoggerMw())
app.use(UAMw({ target: 'DEVICE' }, WebDavMw()))
app.use(UAMw({ target: 'DEVICE' }, webdavControllers()))
app.use(UAMw({ target: 'API' }, serverControllers as Middleware))

export default app
