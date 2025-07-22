import { Middleware } from "koa";
import StorageManager from "../../storage/StorageManager";

const DELETE: Middleware = async (ctx, next) => {
  const result = await StorageManager.DELETE(ctx.url)
  ctx.status = result.statusCode
  return
}

export default DELETE
