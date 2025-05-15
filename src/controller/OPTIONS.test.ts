import { test, expect, describe } from 'vitest'
import supertest from 'supertest'
import { describeApp, testWebdavCommon } from '../../test/test'

describe('Basic Webdav', () => {
  describeApp('Method OPTIONS', (serverAddress) => {
    describe('Path /', () => {
      const st = supertest(serverAddress).options('/')

      testWebdavCommon(st)

      test('should exist content-length 0', async () => {
        const res = await st.then((res) => res)
        expect(res.get('Content-Length')).toBe('0')
      })

      test('should be status', async () => {
        const status = await st.then((res) => res.status)
        expect(status).toBe(200)
      })
    })
  })
})
