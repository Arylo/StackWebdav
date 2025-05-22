import { Middleware } from "koa";
import { nonFound, nonStorage } from "./utils";
import getResource from "../storage/getResource";
import StorageManager, { STATUS_MESSAGE } from "../storage/StorageManager";
import Status from 'http-status';

const DELETE: Middleware = async (ctx, next) => {
  const status = await StorageManager.DELETE(ctx.url)
  if (status === STATUS_MESSAGE.NOT_STORAGE) return nonStorage(ctx)
  if (status === STATUS_MESSAGE.NOT_FOUND) return nonFound(ctx)
  const resource = getResource(ctx.url)
  if (!resource) {
    return nonFound(ctx)
  }
  ctx.status = Status.OK
  return
}

export default DELETE
