import Router from "@koa/router";
import StorageRouter from './Storage'
import koaBody from "koa-body";

const router = new Router({
  prefix: '/-'
})

router.use(koaBody())
router.use(StorageRouter())

export default router.routes()
