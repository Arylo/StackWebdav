import type { Middleware } from "koa";
import Router from "@koa/router";
import { addStorage, getStorages, removeStorageById } from "../../storage/utils";
import { LocalStorage } from "../../storage/LocalStorage";

const parseBodyBuffer = (): Middleware => async (ctx, next) => {
  const data = await new Promise<Buffer>((resolve, reject) => {
    let chunks: any[] = [];
    ctx.req.on('data', chunk => chunks.push(chunk))
    ctx.req.on('end', () => resolve(Buffer.concat(chunks)))
    ctx.req.on('error', err => reject(err))
  })
  ctx.state.body = data
  return next()
}

const checkId = (): Middleware => async (ctx, next) => {
  const { id } = ctx.params
  const storages = getStorages()
  if (!id || storages.some((storage) => storage.getStoreInfo().id === id)) {
    ctx.status = 404
    return
  }
  return next()
}

const router = new Router({
  prefix: '/storages'
})

router.get('/', (ctx) => {
  ctx.body = JSON.stringify({
    data: getStorages(),
  })
})

router.post('/', parseBodyBuffer(), async (ctx) => {
  const body = ctx.state.body.toString()
  const content = JSON.parse(body)
  const { mountPath, type, ...info } = content
  if (type === 'local') {
    addStorage(new LocalStorage(mountPath, { ...info, path: info.targetPath }))
  }
  ctx.status = 200
})

router.get('/:id', checkId(), async (ctx) => {
  const { id } = ctx.params
  ctx.body = JSON.stringify({
    data: getStorages().find((storage) => storage.getStoreInfo().id === id)
  })
  ctx.status = 200
})

router.put('/:id', checkId(), parseBodyBuffer(), async (ctx) => {

})

router.delete('/:id', checkId(), async (ctx) => {
  const { id } = ctx.params
  removeStorageById(id)
  ctx.status = 200
})

export default () => router.routes()
