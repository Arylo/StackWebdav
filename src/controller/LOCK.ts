import { Middleware } from "koa";
import getFilePath from "../utils/getFilePath";
import { nonFound } from "./utils";

const LOCK: Middleware = (ctx, next) => {
  const filePath = getFilePath(ctx)
  if (!filePath) {
    return nonFound(ctx)
  }
}

export default LOCK
