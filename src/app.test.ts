import { test, expect, describe } from 'vitest'
import supertest from 'supertest'
import app from './app'
import { webdavTest } from '../test/test'

describe('Basic Webdav', () => {
  describe('Method OPTIONS', () => {
    describe('Path /', () => {
      const actualServer = app.callback()
      const st = supertest(actualServer).options('/')
      webdavTest(st)
      test('should be status', async () => {
        const status = await st.then((res) => res.status)
        expect(status).toBe(200)
      })
    })
  })

  describe('Method HEAD', () => {
    describe('Path /', () => {
      const actualServer = app.callback()
      const st = supertest(actualServer).head('/')
      webdavTest(st)
      test('should be status', async () => {
        const status = await st.then((res) => res.status)
        expect(status).toBe(200)
      })
    })
    describe('head file', () => {
      describe('Path /index.js', () => {
        const actualServer = app.callback()
        const st = supertest(actualServer).head('/index.js')
        webdavTest(st)
        test('should be status', async () => {
          const status = await st.then((res) => res.status)
          expect(status).toBe(200)
        })
      })
    })
  })
})
