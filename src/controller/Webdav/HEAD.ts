import { Middleware } from "koa";
import Status from 'http-status';
import StorageManager, { STATUS_MESSAGE } from "../../storage/StorageManager";
import { nonFound, nonStorage } from "./utils";

const HEAD: Middleware = async (ctx) => {
  const [status, stat] = await StorageManager.HEAD(ctx.url)
  if (status === STATUS_MESSAGE.OK) {
    ctx.set('Content-Length', (stat.type === 'directory' ? 0 : stat.size).toString())
    if (stat.type === 'file') {
      ctx.set('Content-Type', stat.mime as string)
    }
    ctx.body = ''
    ctx.status = Status.OK
  }
  if (status === STATUS_MESSAGE.NOT_STORAGE) {
    return nonStorage(ctx)
  }
  if (status === STATUS_MESSAGE.NOT_FOUND) {
    return nonFound(ctx)
  }
}

export default HEAD
