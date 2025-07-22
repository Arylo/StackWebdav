import os from 'os'
import path from 'path'
import fs from 'fs'
import { nanoid } from 'nanoid'
import Storage from '../src/storage/Storage'
import { afterAll } from 'vitest'
import { rimrafSync } from 'rimraf'

type mockFilesFixedOption = (string | [string, string?])[]
type mockFilesFunctionOption = (options: { folder: (name: string) => any, file: (name: string, content?: any) => any }) => any
type mockFilesOption = mockFilesFixedOption | mockFilesFunctionOption

export default class LocalTestStorage extends Storage {
  constructor(
    mountPath: string,
    options: { filter?: string, files?: mockFilesOption } = {},
  ) {
    const testPath = path.resolve(os.tmpdir(), nanoid())
    super(mountPath, {
      filter: options.filter,
      device: { type: 'local', path: testPath },
    })
    const { files: filepaths } = options
    function createFolder (name: string) {
      const fullPath = path.join(testPath, name)
      fs.mkdirSync(fullPath, { recursive: true })
    }
    function createFile (name: string, content?: string) {
      const fullPath = path.join(testPath, name)
      fs.mkdirSync(path.dirname(fullPath), { recursive: true })
      fs.writeFileSync(fullPath, content ?? '', 'utf-8')
    }
    if (Array.isArray(filepaths)) {
      for (const filepath of filepaths) {
        const [toFilepath, fileContent] = Array.isArray(filepath) ? filepath : [filepath]
        if (fileContent === undefined) {
          createFolder(toFilepath)
        } else {
          createFile(toFilepath, fileContent)
        }
      }
    } else if (typeof filepaths === 'function') {
      filepaths({
        folder: createFolder,
        file: createFile,
      })
    }
  }
  public afterAll () {
    afterAll(() => {
      rimrafSync(this.toJSON().device.path)
    })
    return this
  }
}
