import path from "path"
import pug from 'pug'
import findUp from "../utils/findUp"

const getTemplatePath = (templateName: string) => {
  const templatePath = path.resolve(findUp(templateName, { cwd: __dirname }) as string, templateName)
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
