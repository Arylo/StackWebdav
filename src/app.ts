import Koa from 'koa'
import Controllers from './controller'
import LoggerMw from './middleware/Logger'
import WebDavMw from './middleware/WebDav'

const app = new Koa()

app.use(LoggerMw())
app.use(WebDavMw())
app.use(Controllers())

export default app
