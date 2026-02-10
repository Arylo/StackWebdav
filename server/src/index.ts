import Koa from 'koa'
import Router from '@koa/router'
import { createWebdavRouter } from './controller/webdav'
import { loadWebdavConfig, webdavMountsMiddleware } from './controller/webdav/config'
import { webdavPathMiddleware } from './controller/webdav/pathMiddleware'
import { accessLogMiddleware } from './middlewares/accessLog'

const app = new Koa()
const router = new Router()

app.use(accessLogMiddleware())

const webdavRouter = createWebdavRouter()
const webdavBasePath = '/webdav'
router.use(
  webdavBasePath,
  webdavPathMiddleware(webdavBasePath),
  webdavMountsMiddleware(),
  webdavRouter.routes(),
  webdavRouter.allowedMethods()
)

app.use(router.routes()).use(router.allowedMethods())

const port = process.env.PORT ? Number(process.env.PORT) : 1900

async function start() {
  await loadWebdavConfig()
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://localhost:${port}`)
  })
}

start()
