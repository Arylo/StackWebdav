import { Middleware } from "koa";
import StorageManager from "../../storage/StorageManager";

const MKCOL: Middleware = async (ctx, next) => {
  const result = await StorageManager.MKCOL(ctx.url)
  ctx.status = result.statusCode
}

export default MKCOL
