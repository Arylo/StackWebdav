import os from 'os'
import path from 'path'
import fs from 'fs'
import { nanoid } from 'nanoid'

const createTestPath = (cb?: (options: { createFolder: (path: string) => any, createFile: (path: string, content: any) => any }) => any) => {
  const testPath = path.resolve(os.tmpdir(), nanoid())
  function createFolder(folderPath: string) {
    const fullPath = path.join(testPath, folderPath)
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true })
    }
  }
  function createFile(filePath: string, content = '') {
    const fullPath = path.join(testPath, filePath)
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(path.dirname(fullPath), { recursive: true })
      fs.writeFileSync(fullPath, content, 'utf-8')
    }
  }
  cb?.({ createFolder, createFile })
  return testPath
}

export default createTestPath
