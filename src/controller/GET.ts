import { Middleware } from "koa";
import Status from 'http-status';
import { nonFound, nonStorage } from "./utils";
import StorageManager, { STATUS_MESSAGE } from "../storage/StorageManager";

const GET: Middleware = async (ctx, next) => {
  const [status, content] = await StorageManager.GET(ctx.url)
  if (status === STATUS_MESSAGE.NOT_STORAGE) return nonStorage(ctx)
  if (status === STATUS_MESSAGE.NOT_FOUND) return nonFound(ctx)
  ctx.body = content
  ctx.status = Status.OK
}

export default GET
