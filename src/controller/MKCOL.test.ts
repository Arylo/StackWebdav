import { test, expect, describe } from 'vitest'
import supertest from 'supertest'
import Status from 'http-status';
import { testWebdavCommon } from '../../test/common'
import { createTestFile, createTestFolder, describeApp } from "../../test/store"

function initFiles () {
  createTestFolder('folder')
  createTestFile('index.js')
  createTestFile('withFile/index.js')
  createTestFile('withFiles/index.js')
  createTestFile('withFiles/index.html', '<html></html>')
  createTestFile('withFiles/length-4.txt', '1234')
}

describe('Basic Webdav', () => {
  describeApp('Method MKCOL', (serverAddress) => {
    describe('Create Folder in Root path', () => {
      const st = supertest(serverAddress).mkcol('/newFolder')

      testWebdavCommon(st)

      test('should be status 201', async () => {
        const status = await st.then((res) => res.status)
        expect(status).toBe(Status.CREATED)
      })
    })

    describe('Twice Create Folder in Root path', async () => {
      await supertest(serverAddress).mkcol('/twiceNewFolder').then()
      const st = supertest(serverAddress).mkcol('/twiceNewFolder')

      testWebdavCommon(st)

      test('should be status 201', async () => {
        const status = await st.then((res) => res.status)
        expect(status).toBe(Status.METHOD_NOT_ALLOWED)
      })
    })
  }, { setup: () => initFiles() })
})
