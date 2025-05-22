import { test, expect, describe } from 'vitest'
import Status from 'http-status';
import supertest from 'supertest'
import { testWebdavCommon } from '../../test/common'
import { createTestFile, createTestFolder, describeApp } from '../../test/storage'

function initFiles () {
  createTestFolder('folder')
  createTestFile('index.js')
  createTestFile('withFile/index.js')
  createTestFile('withFiles/index.js')
  createTestFile('withFiles/index.html', '<html></html>')
  createTestFile('withFiles/length-4.txt', '1234')
}

describe('Basic Webdav', () => {
  describeApp('Method HEAD', (serverAddress) => {
    describe('Folder', () => {
      describe('Root folder path', () => {
        const st = supertest(serverAddress).head('/')

        testWebdavCommon(st)

        test('should be status 200', async () => {
          const status = await st.then((res) => res.status)
          expect(status).toBe(Status.OK)
        })
      })
      describe('Sub folder path', () => {
        const st = supertest(serverAddress).head('/folder/')

        testWebdavCommon(st)

        test('should be status 200', async () => {
          const status = await st.then((res) => res.status)
          expect(status).toBe(Status.OK)
        })
      })
      describe('Non found folder path', () => {
        const st = supertest(serverAddress).head('/nonFound/')

        testWebdavCommon(st)

        test('should be status 404', async () => {
          const status = await st.then((res) => res.status)
          expect(status).toBe(Status.NOT_FOUND)
        })
      })
    })
    describe('File', () => {
      describe('file in root path', () => {
        const st = supertest(serverAddress).head('/index.js')

        testWebdavCommon(st)

        test('should be status 200', async () => {
          const status = await st.then((res) => res.status)
          expect(status).toBe(Status.OK)
        })
      })
      describe('file in subfolder path', () => {
        const st = supertest(serverAddress).head('/withFile/index.js')

        testWebdavCommon(st)

        test('should be status 200', async () => {
          const status = await st.then((res) => res.status)
          expect(status).toBe(Status.OK)
        })
      })
      describe('Non found file in root path', () => {
        const st = supertest(serverAddress).head('/nonFound.js')

        testWebdavCommon(st)

        test('should be status 404', async () => {
          const status = await st.then((res) => res.status)
          expect(status).toBe(Status.NOT_FOUND)
        })
      })
      describe('Non found file in folder path', () => {
        const st = supertest(serverAddress).head('/nonFound/index.js')

        testWebdavCommon(st)

        test('should be status 404', async () => {
          const status = await st.then((res) => res.status)
          expect(status).toBe(Status.NOT_FOUND)
        })
      })
    })
  }, { setup: initFiles })
})
