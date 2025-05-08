import path from 'path'
import fs from 'fs'
import { Middleware } from "koa";
import Status from 'http-status';
import findUp from '../utils/findUp';
import { renderInfoFile, renderInfoFolder } from '../template';
import getFilePath from '../utils/getFilePath';

const info: Middleware = (ctx) => {
  const targetPath = decodeURIComponent(ctx.url)
  const filePath = getFilePath(ctx)
  if (!filePath) {
    ctx.status = Status.NOT_FOUND
    ctx.body = Status[Status.NOT_FOUND]
    return
  }
  const stat = fs.statSync(filePath)

  let responseXML = ''
  if (stat.isDirectory()) {
    const entries = fs.readdirSync(filePath).map((name) => {
      const entryPath = path.join(filePath, name)
      const entryStat = fs.statSync(entryPath)
      return {
        href: path.join(targetPath, name),
        size: entryStat.isDirectory() ? 0 : entryStat.size,
        mtime: entryStat.mtime.toUTCString(),
        isDirectory: entryStat.isDirectory(),
      }
    })
    console.log(entries)
    responseXML = renderInfoFolder(entries)
  } else {
    responseXML = renderInfoFile({
      href: targetPath,
      size: stat.size,
      mtime: stat.mtime.toUTCString(),
      isDirectory: stat.isDirectory(),
    })
  }
  ctx.body = responseXML
  ctx.status = Status.MULTI_STATUS
  ctx.set('Content-Type', 'application/xml')
}

export default info
