import os from 'os'
import path from 'path'
import fs from 'fs'
import http from 'http'
import { afterAll, describe, expect, test } from 'vitest'
import type { Test } from 'supertest'
import { addStore, getStores, withStore } from '../src/store'
import { nanoid } from 'nanoid'
import { rimrafSync } from 'rimraf'
import app from '../src/app'
import { LocalStore } from '../src/store/LocalStore'
import { AddressInfo } from 'net'

export const testWebdavCommon = (st: Test) => {
  test('should include the WebDav versions header', async () => {
    const res = await st.then((res) => res)
    expect(res.get('DAV')).toBe('1,2')
  })
  test('should include the server info header', async () => {
    const res = await st.then((res) => res)
    expect(res.get('Server')).toEqual(expect.stringMatching(/stack-webdav\/\d+\.\d+\.\d+/))
  })
  test('should the current method include the allowed header', async () => {
    const res = await st.then((res) => res)
    expect(res.get('Allow')?.split(',')).length.greaterThan(0)
    expect(res.get('Allow')?.split(',').filter(Boolean)).toContain(res.request.method)
  })
}

export const getTestPath = (index = 0) => {
  const stores = getStores()
  return stores[index].getStoreInfo().device.path
}

export const createTestFolder = (folderPath: string) => {
  const p = path.join(getTestPath(), folderPath)
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

export const createTestFile = (filePath: string, content = '') => {
  const p = path.join(getTestPath(), filePath)
  if (!fs.existsSync(p)) {
    fs.mkdirSync(path.dirname(p), { recursive: true })
    fs.writeFileSync(p, content, 'utf-8')
  }
}

export const describeApp = (name: string, cb: (address: string) => unknown, { setup = () => {} } = {}) => {
  const id = nanoid()
  const testPath = path.resolve(os.tmpdir(), id)
  withStore(() => {
    addStore(new LocalStore('/', { path: testPath }))
    setup()
    const server = http.createServer(app.callback()).listen()
    const addressInfo = server.address() as AddressInfo
    describe(name, () => {
      afterAll(() => {
        rimrafSync(testPath)
        server.close()
      })
      cb(`http://localhost:${addressInfo.port}`)
    })
  })
}
