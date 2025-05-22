import { Middleware } from "koa";
import { nonFound, nonStorage } from "./utils";
import StorageManager, { STATUS_MESSAGE } from "../storage/StorageManager";
import Status from 'http-status';

const DELETE: Middleware = async (ctx, next) => {
  const [status] = await StorageManager.DELETE(ctx.url)
  if (status === STATUS_MESSAGE.NOT_STORAGE) return nonStorage(ctx)
  if (status === STATUS_MESSAGE.NOT_FOUND) return nonFound(ctx)
  ctx.status = Status.OK
  return
}

export default DELETE
