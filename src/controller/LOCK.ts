import { Middleware } from "koa";
import { nonFound } from "./utils";
import getResource from "../store/getResource";

const LOCK: Middleware = (ctx, next) => {
  const resource = getResource(ctx.url)
  if (!resource) {
    return nonFound(ctx)
  }
}

export default LOCK
