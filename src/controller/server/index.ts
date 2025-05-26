import Router from "@koa/router";
import StorageRouter from './Storage'

const router = new Router({
  prefix: '/-'
})

router.use(StorageRouter())

export default router.routes()
