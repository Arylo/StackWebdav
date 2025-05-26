import type { Context } from "koa"
import Status from 'http-status'

export const nonFound = (ctx: Context) => {
  ctx.status = Status.NOT_FOUND
}

export const nonStorage = (ctx: Context) => {
  ctx.status = Status.METHOD_NOT_ALLOWED
}
