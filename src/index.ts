import Koa from 'koa'
import * as settings from './settings'
import controller from './controller'

const app = new Koa()

app.use((ctx, next) => {
  console.log(ctx.method, ctx.url, ctx.href)
  next()
})
app.use(controller())

app.listen(settings.PORT, '0.0.0.0', () => {
  console.log(`Listening 0.0.0.0:${settings.PORT} ...`)
})
