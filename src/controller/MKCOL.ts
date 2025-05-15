import { Middleware } from "koa";
import Status from 'http-status';
import getPassedStores from "../store/getPassedStores";
import hasResource from "../store/hasResource";

const MKCOL: Middleware = async (ctx, next) => {
  const stores = getPassedStores(ctx.url)
  if (stores.length === 0 || await hasResource(ctx.url)) {
    ctx.status = Status.METHOD_NOT_ALLOWED
    return
  }
  try {
    await stores[0].create(ctx.url, { type: 'directory' })
    ctx.status = Status.CREATED
  } catch (error) {
    console.error(error)
    ctx.status = Status.INTERNAL_SERVER_ERROR
  }
}

export default MKCOL
