import path from 'path'
import { test, expect, describe, beforeAll, afterAll } from 'vitest'
import { v2 as Webdav } from 'webdav-server'
import supertest, { Response, Test } from 'supertest'
import app from './app'
import { Server } from 'http'
import TestAgent from 'supertest/lib/agent'
import { AddressInfo } from 'net'

describe('Basic Webdav', () => {
  let oldServer!: Server
  beforeAll(async () => {
    const oldApp = new Webdav.WebDAVServer()
    oldApp.setFileSystemSync('/', new Webdav.PhysicalFileSystem(path.resolve(__dirname, '../dist')))
    oldServer = await oldApp.startAsync(56789)
  })
  afterAll(async () => {
    oldServer.close()
  })
  function testcase (callback: (st: TestAgent) => Test, getter: (value: Response) => any) {
    return async () => {
      const actualServer = app.callback()
      const actualValue = await callback(supertest(actualServer)).then((res) => res)

      const { port } = oldServer.address() as AddressInfo
      const expectUrl = `http://localhost:${port}`
      const expectValue = await callback(supertest(expectUrl)).then((res) => res)

      expect(getter(actualValue)).toStrictEqual(getter(expectValue))
    }
  }

  describe('Method OPTIONS', () => {
    test(
      'should be status',
      testcase((st) => st.options('/'), (res) => res.status),
    )
    test(
      'should be headers',
      testcase((st) => st.options('/'), (res) => ({
        DAV: res.get('DAV'),
        Length: res.get('Content-Length'),
        // Allow: res.get('Allow'),
      })),
    )
  })

  describe('Method HEAD', () => {
    describe('head folder', () => {
      test(
        'should be status',
        testcase((st) => st.head('/'), (res) => res.status),
      )
    })
    describe.only('head file', () => {
      test(
        'should be headers',
        testcase((st) => st.head('/index.js'), (res) => {
          console.log(res.body)
          return res.headers
        }),
      )
      test(
        'should be status',
        testcase((st) => st.head('/index.js'), (res) => res.status),
      )
    })
  })
})
