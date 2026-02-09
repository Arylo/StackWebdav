import { Middleware } from "koa";
import StorageManager from "../../storage/StorageManager";

const GET: Middleware = async (ctx, next) => {
  const result = await StorageManager.GET(ctx.url)
  ctx.body = result.data
  ctx.status = result.statusCode
}

export default GET
