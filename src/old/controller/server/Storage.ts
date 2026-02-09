import type { Middleware } from "koa";
import Router from "@koa/router";
import { addStorage, getStorages, removeStorageById, updateStorageById } from "../../storage/utils";
import Storage from "../../storage/Storage";

const router = new Router({
  prefix: '/storages'
})

router.param('storageId', async (id, ctx, next) => {
  const storages = getStorages()
  if (!id || !storages.some((storage) => storage.toJSON().id === id)) {
    return ctx.status = 404
  }
  return next()
})

router.get('/', (ctx) => {
  ctx.body = {
    data: getStorages(),
  }
})

router.post('/', async (ctx) => {
  const body = ctx.request.body
  const content = body
  const { path: mountPath, device: { type, ...deviceInfo } } = content
  if (type === 'local') {
    addStorage(new Storage(mountPath, { type, ...deviceInfo }))
  }
  ctx.status = 200
})

router.get('/:storageId', async (ctx) => {
  const { storageId } = ctx.params
  ctx.body = {
    data: getStorages().find((storage) => storage.toJSON().id === storageId)
  }
  ctx.status = 200
})

router.put('/:storageId', async (ctx) => {
  updateStorageById(ctx.params.storageId, ctx.request.body)
  ctx.status = 200
})

router.delete('/:storageId', async (ctx) => {
  const { storageId } = ctx.params
  removeStorageById(storageId)
  ctx.status = 200
})

export default () => router.routes()
