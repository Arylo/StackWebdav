import { test, expect, describe } from 'vitest'
import supertest from 'supertest'
import Status from 'http-status';
import { parseStringPromise } from 'xml2js'
import { testWebdavCommon, testWebdavCommonResult } from '../../test/common'
import { createTestFile, createTestFolder, describeApp } from "../../test/storage"
import { getZone } from '../../test/xml';

function initFiles () {
  createTestFolder('folder')
  createTestFile('index.js')
  createTestFile('length-8.txt', '12345678')
  createTestFile('withFile/index.js')
  createTestFile('withFiles/index.js')
  createTestFile('withFiles/index.html', '<html></html>')
  createTestFile('withFiles/length-4.txt', '1234')
}

const matchFileObject = (zone: string, metadata: { href: string, size: number, mime: string, displayName: string }) => ({
  [`${zone}:href`]: [metadata.href],
  [`${zone}:propstat`]: [
    {
      [`${zone}:status`]: ['HTTP/1.1 200 OK'],
      [`${zone}:prop`]: [
        {
          [`${zone}:resourcetype`]: [''],
          [`${zone}:getcontentlength`]: [metadata.size.toString()],
          [`${zone}:getlastmodified`]: [expect.stringMatching(/ GMT$/)],
          [`${zone}:getcontenttype`]: [metadata.mime],
          [`${zone}:displayname`]: [metadata.displayName],
        },
      ],
    },
  ],
})
const matchFolderObject = (zone: string, metadata: { href: string, size: number, displayName: string }) => ({
  [`${zone}:href`]: [metadata.href],
  [`${zone}:propstat`]: [
    {
      [`${zone}:status`]: ['HTTP/1.1 200 OK'],
      [`${zone}:prop`]: [
        {
          [`${zone}:resourcetype`]: [{ [`${zone}:collection`]: ['']}],
          [`${zone}:getcontentlength`]: [metadata.size.toString()],
          [`${zone}:getlastmodified`]: [expect.stringMatching(/ GMT$/)],
          [`${zone}:displayname`]: [metadata.displayName],
        },
      ],
    },
  ],
})

describe('Basic Webdav', () => {
  describeApp('Method PROPFIND', (serverAddress) => {
    describe.each([
      ['DEPTH default value', undefined],
      ['DEPTH 0', 0],
      ['DEPTH invalid value', 'test'],
      ['DEPTH too deep value', 9527],
    ])('%s', (_, depth) => {
      describe('Folder', async () => {
        const st = supertest(serverAddress).propfind('/')
        typeof depth === 'number' && st.set('DEPTH', depth?.toString())

        testWebdavCommon(st)
        testWebdavCommonResult(st)

        test('should be status 207', async () => {
          const status = await st.then((res) => res.status)
          expect(status).toBe(Status.MULTI_STATUS)
        })
        test('check content', async () => {
          const content = await st.then((res) => res.text)
          const jsonContent = await parseStringPromise(content)
          const zone = getZone(jsonContent)
          const responses = jsonContent[`${zone}:multistatus`][`${zone}:response`]
          expect(responses).toHaveLength(1)
          expect(responses).toStrictEqual([
            matchFolderObject(zone, { href: '/', size: 0, displayName: '/' }),
          ])
        })
      })
      describe('File', async () => {
        const st = supertest(serverAddress).propfind('/length-8.txt')
        typeof depth === 'number' && st.set('DEPTH', depth?.toString())

        testWebdavCommon(st)
        testWebdavCommonResult(st)

        test('should be status 207', async () => {
          const status = await st.then((res) => res.status)
          expect(status).toBe(Status.MULTI_STATUS)
        })
        test('check content', async () => {
          const content = await st.then((res) => res.text)
          const jsonContent = await parseStringPromise(content)
          const zone = getZone(jsonContent)
          const responses = jsonContent[`${zone}:multistatus`][`${zone}:response`]
          expect(responses).toHaveLength(1)
          expect(responses).toStrictEqual([
            matchFileObject(zone, { href: '/length-8.txt', size: 8, mime: 'text/plain', displayName: 'length-8.txt' }),
          ])
        })
      })
      describe('Non-exist Folder', async () => {
        const st = supertest(serverAddress).propfind('/non-exist-folder/')
        typeof depth === 'number' && st.set('DEPTH', depth?.toString())

        testWebdavCommon(st)

        test('should be status 404', async () => {
          const status = await st.then((res) => res.status)
          expect(status).toBe(Status.NOT_FOUND)
        })
      })
      describe('Non-exist File', async () => {
        const st = supertest(serverAddress).propfind('/non-exist-file.txt')
        typeof depth === 'number' && st.set('DEPTH', depth?.toString())

        testWebdavCommon(st)

        test('should be status 404', async () => {
          const status = await st.then((res) => res.status)
          expect(status).toBe(Status.NOT_FOUND)
        })
      })
    })
    describe('DEPTH 1', () => {
      describe('Folder', async () => {
        const st = supertest(serverAddress).propfind('/withFile')
        st.set('DEPTH', '1')

        testWebdavCommon(st)
        testWebdavCommonResult(st)

        test('should be status 207', async () => {
          const status = await st.then((res) => res.status)
          expect(status).toBe(Status.MULTI_STATUS)
        })
        test('check content', async () => {
          const content = await st.then((res) => res.text)
          const jsonContent = await parseStringPromise(content)
          const zone = getZone(jsonContent)
          const responses = jsonContent[`${zone}:multistatus`][`${zone}:response`]
          expect(responses).toHaveLength(2)
          expect(responses).toStrictEqual([
            matchFolderObject(zone, { href: '/withFile/', size: 0, displayName: 'withFile' }),
            matchFileObject(zone, { href: '/withFile/index.js', size: 0, mime: 'text/javascript', displayName: 'index.js' }),
          ])
        })
      })
      describe('File', async () => {
        const st = supertest(serverAddress).propfind('/length-8.txt')
        st.set('DEPTH', '1')

        testWebdavCommon(st)
        testWebdavCommonResult(st)

        test('should be status 207', async () => {
          const status = await st.then((res) => res.status)
          expect(status).toBe(Status.MULTI_STATUS)
        })
        test('check content', async () => {
          const content = await st.then((res) => res.text)
          const jsonContent = await parseStringPromise(content)
          const zone = getZone(jsonContent)
          const responses = jsonContent[`${zone}:multistatus`][`${zone}:response`]
          expect(responses).toHaveLength(1)
          expect(responses).toStrictEqual([
            matchFileObject(zone, { href: '/length-8.txt', size: 8, mime: 'text/plain', displayName: 'length-8.txt' }),
          ])
        })
      })
      describe('Non-exist Folder', async () => {
        const st = supertest(serverAddress).propfind('/non-exist-folder/')
        st.set('DEPTH', '1')

        testWebdavCommon(st)

        test('should be status 404', async () => {
          const status = await st.then((res) => res.status)
          expect(status).toBe(Status.NOT_FOUND)
        })
      })
      describe('Non-exist File', async () => {
        const st = supertest(serverAddress).propfind('/non-exist-file.txt')
        st.set('DEPTH', '1')

        testWebdavCommon(st)

        test('should be status 404', async () => {
          const status = await st.then((res) => res.status)
          expect(status).toBe(Status.NOT_FOUND)
        })
      })
    })
  }, { setup: () => initFiles() })
})
