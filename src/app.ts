import Koa from 'koa'
import controller from './controller'
import WebDavMw from './middleware/WebDav'

const app = new Koa()

app.use(WebDavMw())
app.use((ctx, next) => {
  console.log(ctx.method, ctx.url, ctx.href)
  next()
})
app.use(controller())

export default app
