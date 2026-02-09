import { Middleware } from "koa";
import StorageManager from "../../storage/StorageManager";
import genPathGroup from "../../../utils/genPathGroup";

const DELETE: Middleware = async (ctx, next) => {
  const pathGroup = genPathGroup(ctx.url)
  const result = await StorageManager.DELETE(pathGroup)
  ctx.status = result.statusCode
  return
}

export default DELETE
