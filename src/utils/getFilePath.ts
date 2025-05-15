import path from 'path'
import fs from 'fs'
import { Context } from "koa"
import { ROOT_PATH } from '../constant'

const paths = [
  path.resolve(ROOT_PATH, 'dist'),
]

function getFilePath (ctx: Context) {
  const targetPath = decodeURIComponent(ctx.url)
  const filePath = paths.map((p) => path.resolve(p, `.${targetPath}`)).find((p) => fs.existsSync(p))
  return filePath
}

export default getFilePath
