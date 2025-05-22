import { Middleware } from "koa";
import { nonFound } from "./utils";
import getResource from "../storage/getResource";

const UNLOCK: Middleware = (ctx, next) => {
  const resource = getResource(ctx.url)
  if (!resource) {
    return nonFound(ctx)
  }
}

export default UNLOCK
