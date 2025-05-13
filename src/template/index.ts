import path from "path"
import pug from 'pug'
import { findUpSync } from "find-up"
import { ROOT_PATH } from "../constant"

const getTemplatePath = (templateName: string) => {
  const folderPath = path.resolve(ROOT_PATH, 'src/template')
  const templatePath = findUpSync(templateName, { cwd: folderPath }) as string
  return templatePath
}

export const renderInfoFile = (entry: { href: string, size: number, mtime: string, isDirectory: boolean }) => {
  return renderInfoFolder([entry])
}

export const renderInfoFolder = (entries: { href: string, size: number, mtime: string, isDirectory: boolean }[]) => {
  const templateName = 'PROPFIND.pug'
  const templatePath = getTemplatePath(templateName)
  return pug.renderFile(templatePath, { entries })
}
