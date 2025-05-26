import { Middleware } from "koa";
import Status from 'http-status';
import StorageManager, { STATUS_MESSAGE } from "../../storage/StorageManager";
import { nonStorage } from "./utils";

const MKCOL: Middleware = async (ctx, next) => {
  try {
    const [status] = await StorageManager.MKCOL(ctx.url)
    if (status === STATUS_MESSAGE.NOT_STORAGE) {
      return nonStorage(ctx)
    }
    if (status == STATUS_MESSAGE.EXISTS) {
      ctx.status = Status.METHOD_NOT_ALLOWED
      return
    }
    ctx.status = Status.CREATED
  } catch (error) {
    console.error(error)
    ctx.status = Status.INTERNAL_SERVER_ERROR
  }
}

export default MKCOL
