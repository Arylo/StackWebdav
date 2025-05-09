import path from 'path'
import Koa from 'koa'
import controller from './controller'
import findUp from './utils/findUp'

const app = new Koa()
const ROOT_PATH = findUp('package.json', { cwd: __dirname }) as string

app.use((ctx, next) => {
  ctx.set('Server', `stack-webdav/${require(path.resolve(ROOT_PATH, 'package.json')).version}`)
  ctx.set('DAV', '1,2')
  console.log(ctx.method, ctx.url, ctx.href)
  next()
})
app.use(controller())

export default app
