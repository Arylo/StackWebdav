import os from 'os'
import path from 'path'
import fs from 'fs'
import http from 'http'
import { afterAll, describe } from 'vitest'
import { addStorage, getStorages, withStorages } from '../src/storage/utils'
import { nanoid } from 'nanoid'
import { rimrafSync } from 'rimraf'
import app from '../src/app'
import { AddressInfo } from 'net'
import Storage from '../src/storage/Storage'

export const getTestPath = (index = 0) => {
  const stores = getStorages()
  return stores[index].toJSON().device.path
}

export const createTestFolder = (folderPath: string, storageIndex = 0) => {
  const p = path.join(getTestPath(storageIndex), folderPath)
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

export const createTestFile = (filePath: string, content = '', storageIndex = 0) => {
  const p = path.join(getTestPath(storageIndex), filePath)
  if (!fs.existsSync(p)) {
    fs.mkdirSync(path.dirname(p), { recursive: true })
    fs.writeFileSync(p, content, 'utf-8')
  }
}

export const describeApp = (
  name: string,
  cb: (address: string) => unknown,
  { setup = () => {}, mountPaths = ['/'] } = {}
) => {
  withStorages(() => {
    const testPaths = mountPaths.map((mountPath) => {
      const testPath = path.resolve(os.tmpdir(), nanoid())
      addStorage(new Storage(mountPath, { device: { type: 'local', path: testPath } }))
      return testPath
    })
    setup()
    const server = http.createServer(app.callback()).listen()
    const addressInfo = server.address() as AddressInfo
    describe(name, () => {
      afterAll(() => {
        testPaths.forEach((testPath) => rimrafSync(testPath))
        server.close()
      })
      cb(`http://localhost:${addressInfo.port}`)
    })
  })
}
