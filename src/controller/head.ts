import fs from 'fs'
import { Middleware } from "koa";
import Status from 'http-status';
import getFilePath from '../utils/getFilePath';

const head: Middleware = (ctx) => {
  const filePath = getFilePath(ctx)
  if (!filePath) {
    ctx.status = Status.NOT_FOUND
    return
  }
  const stat = fs.statSync(filePath)

  ctx.status = Status.OK
  ctx.set('Content-Length', (stat.isDirectory() ? 0 : stat.size).toString())
  ctx.set('Content-Type', 'application/octet-stream')
}

export default head
