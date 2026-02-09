import { test, expect, describe } from 'vitest'
import supertest from 'supertest'
import Status from 'http-status';
import { testWebdavCommon } from '../../../test/common'
import LocalTestStorage from '../../../test/LocalTestStorage';
import describeApp from '../../../test/describeApp';


describe('Basic Webdav', () => {
  const localTestStorage = new LocalTestStorage('/', {
    files: ({ folder, file }) => {
      folder('folder')
      file('index.js')
      file('withFile/index.js')
      file('withFiles/index.js')
      file('withFiles/index.html', '<html></html>')
      file('withFiles/length-4.txt', '1234')
    },
  })
    .afterAll()

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
  }, { storages: [localTestStorage] })
})
