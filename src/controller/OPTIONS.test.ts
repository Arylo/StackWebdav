import { test, expect, describe } from 'vitest'
import supertest from 'supertest'
import app from '../app'
import { webdavCommonTest } from '../../test/test'

describe('Basic Webdav', () => {
  describe('Method OPTIONS', () => {
    describe('Path /', () => {
      const actualServer = app.callback()
      const st = supertest(actualServer).options('/')

      webdavCommonTest(st)

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
