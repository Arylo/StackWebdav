import fs from 'fs'
import { Middleware } from "koa";
import Status from 'http-status';
import getFilePath from '../utils/getFilePath';
import { nonFound } from './utils';

const HEAD: Middleware = (ctx) => {
  const filePath = getFilePath(ctx)
  if (!filePath) {
    return nonFound(ctx)
  }
  const stat = fs.statSync(filePath)

  ctx.set('Content-Length', (stat.isDirectory() ? 0 : stat.size).toString())
  if (stat.isFile()) {
    ctx.set('Content-Type', 'application/octet-stream')
  }
  ctx.body = ''
  ctx.status = Status.OK
}

export default HEAD
