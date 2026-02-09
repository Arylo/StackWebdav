import path from "path"
import pug from 'pug'

const getTemplatePath = (templateName: string) => {
  const templatePath = path.resolve(__dirname, templateName)
  return templatePath
}

export const renderPROPFIND = (entries: {
  href: string,
  size: number,
  mtime: string,
  isDirectory: boolean,
  displayName?: string | null,
  contentType?: string | null,
}[]) => {
  const templateName = 'PROPFIND.pug'
  const templatePath = getTemplatePath(templateName)
  return pug.renderFile(templatePath, { entries, doctype: 'xml' })
}
