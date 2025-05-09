import fs from 'fs'
import path from 'path'
import { Middleware } from "koa";
import getFilePath, { getFolderPath } from "../utils/getFilePath";
import Status from 'http-status';

const MKCOL: Middleware = (ctx, next) => {
  const targetPath = decodeURIComponent(ctx.url)
  const folderPath = getFilePath(ctx)
  if (folderPath && fs.existsSync(folderPath)) {
    ctx.status = Status.METHOD_NOT_ALLOWED
    return
  }
  try {
    fs.mkdirSync(path.resolve(getFolderPath(), `.${targetPath}`), { recursive: true })
    ctx.status = Status.CREATED
  } catch (error) {
    console.error(error)
    ctx.status = Status.INTERNAL_SERVER_ERROR
  }
}

export default MKCOL
