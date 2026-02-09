import Router from '@koa/router'
import { optionsHandler } from './methods/options'
import { propfindHandler } from './methods/propfind'
import { getHandler } from './methods/get'
import { putHandler } from './methods/put'
import { deleteHandler } from './methods/delete'
import { mkcolHandler } from './methods/mkcol'
import { moveHandler } from './methods/move'
import { copyHandler } from './methods/copy'

export function createWebdavRouter() {
  const router = new Router()

  router.options('/', optionsHandler())
  router.options('/:path(.*)', optionsHandler())
  router.register('/:path(.*)', ['PROPFIND'], propfindHandler())
  router.get('/:path(.*)', getHandler())
  router.put('/:path(.*)', putHandler())
  router.delete('/:path(.*)', deleteHandler())
  router.register('/:path(.*)', ['MKCOL'], mkcolHandler())
  router.register('/:path(.*)', ['MOVE'], moveHandler())
  router.register('/:path(.*)', ['COPY'], copyHandler())

  return router
}

export type { WebdavMount } from './types'
