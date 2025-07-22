import type { Context } from "koa"
import Status from 'http-status'

export const fail = (ctx: Context) => {
  ctx.status = Status.INTERNAL_SERVER_ERROR
}
