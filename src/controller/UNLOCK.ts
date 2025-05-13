import { Middleware } from "koa";
import getFilePath from "../utils/getFilePath";
import { nonFound } from "./utils";

const UNLOCK: Middleware = (ctx, next) => {
  const filePath = getFilePath(ctx)
  if (!filePath) {
    return nonFound(ctx)
  }
}

export default UNLOCK
