import type { Middleware } from "koa";
import Router from "@koa/router";
import { addStorage, getStorages, removeStorageById, updateStorageById } from "../../storage/utils";
import { LocalStorage } from "../../storage/LocalStorage";

const checkExistId = (): Middleware => async (ctx, next) => {
  const { id } = ctx.params
  const storages = getStorages()
  if (!id || !storages.some((storage) => storage.getStoreInfo().id === id)) {
    ctx.status = 404
    return
  }
  return next()
}

const router = new Router({
  prefix: '/storages'
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
    addStorage(new LocalStorage(mountPath, { ...deviceInfo }))
  }
  ctx.status = 200
})

router.get('/:id', checkExistId(), async (ctx) => {
  const { id } = ctx.params
  ctx.body = {
    data: getStorages().find((storage) => storage.getStoreInfo().id === id)
  }
  ctx.status = 200
})

router.put('/:id', checkExistId(), async (ctx) => {
  updateStorageById(ctx.params.id, ctx.request.body)
  ctx.status = 200
})

router.delete('/:id', checkExistId(), async (ctx) => {
  const { id } = ctx.params
  removeStorageById(id)
  ctx.status = 200
})

export default () => router.routes()
