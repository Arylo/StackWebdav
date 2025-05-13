import { test, expect, describe } from 'vitest'
import supertest from 'supertest'
import app from '../app'
import { webdavCommonTest } from '../../test/test'

describe('Basic Webdav', () => {
  describe('Method HEAD', () => {
    describe('Folder', () => {
      const actualServer = app.callback()
      const st = supertest(actualServer).head('/')
      webdavCommonTest(st)
      test('should be status', async () => {
        const status = await st.then((res) => res.status)
        expect(status).toBe(200)
      })
    })
    describe('head file', () => {
      describe('File', () => {
        const actualServer = app.callback()
        const st = supertest(actualServer).head('/index.js')
        webdavCommonTest(st)
        test('should be status', async () => {
          const status = await st.then((res) => res.status)
          expect(status).toBe(200)
        })
      })
    })
  })
})
