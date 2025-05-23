import path from 'path'
import fs from 'fs'
import { Context } from "koa"
import findUp from "./findUp"

const ROOT_PATH = findUp('package.json', { cwd: __dirname }) as string

const paths = [
  path.resolve(ROOT_PATH, 'dist'),
]

export function getFolderPath (index = 0) {
  return paths[index]
}

function getFilePath (ctx: Context) {
  const targetPath = decodeURIComponent(ctx.url)
  const filePath = paths.map((p) => path.resolve(p, `.${targetPath}`)).find((p) => fs.existsSync(p))
  return filePath
}

export default getFilePath
