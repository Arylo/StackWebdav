import { Middleware } from "koa";
import { nonFound } from "./utils";
import getFilePath from "../utils/getFilePath";

const DELETE: Middleware = (ctx, next) => {
  const filePath = getFilePath(ctx)
  if (!filePath) {
    return nonFound(ctx)
  }
}

export default DELETE
