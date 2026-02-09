import Koa from 'koa'
import Router from '@koa/router'
import { createWebdavRouter } from './controller/webdav'
import { loadWebdavConfig, webdavMountsMiddleware } from './controller/webdav/config'

const app = new Koa()
const router = new Router()

// access log
app.use(async (ctx, next) => {
  const start = Date.now()
  try {
    await next()
  } finally {
    const ms = Date.now() - start
    console.log(`${ctx.method} ${ctx.status} ${ctx.path} - ${ms}ms`)
  }
})

const webdavRouter = createWebdavRouter()
router.use('/webdav', webdavMountsMiddleware(), webdavRouter.routes(), webdavRouter.allowedMethods())

app.use(router.routes()).use(router.allowedMethods())

const port = process.env.PORT ? Number(process.env.PORT) : 1900

async function start() {
  await loadWebdavConfig()
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://localhost:${port}`)
  })
}

start()
