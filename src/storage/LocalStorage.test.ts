import path from 'path'
import os from 'os'
import { afterAll, describe, expect, test } from "vitest";
import { LocalStorage } from "./LocalStorage";
import { nanoid } from 'nanoid';
import { rimrafSync } from 'rimraf';

describe('Storage', () => {
  describe(LocalStorage.name, () => {
    describe('Basic', () => {
      test('use constructor method to create instance', () => {
        const storage = new LocalStorage('/', { path: os.tmpdir() })
        expect(storage).toBeInstanceOf(LocalStorage)
      })
      test('use create method to create instance', () => {
        const storage = LocalStorage.createInst('/', { path: os.tmpdir() })
        expect(storage).toBeInstanceOf(LocalStorage)
      })
      test('check target path in this store', () => {
        const targetPath = '/folder/index.html'
        let storage: LocalStorage
        storage = LocalStorage.createInst('/', { path: os.tmpdir() })
        expect(storage.check(targetPath)).toBeTruthy()
        storage = LocalStorage.createInst('/otherFolder', { path: os.tmpdir() })
        expect(storage.check(targetPath)).toBeFalsy()
      })
      test('get store info', () => {
        const storage = LocalStorage.createInst('/', { path: os.tmpdir() })
        expect(storage.getStoreInfo()).toStrictEqual({
          id: expect.any(String),
          path: '/',
          device: {
            type: 'local',
            path: os.tmpdir(),
            filter: void 0,
          },
        })
      })
    })
    describe('Actions', () => {
      const testRootPath = path.resolve(os.tmpdir(), nanoid())
      afterAll(() => {
        rimrafSync(testRootPath)
      })

      const storage = new LocalStorage('/', { path: testRootPath })
      test('Create file and check it', async () => {
        const prefix = `/${nanoid()}`
        expect(await storage.HEAD(`${prefix}/index.html`)).not.toBeDefined()
        await storage.PUT(`${prefix}/index.html`, '')
        expect(await storage.HEAD(`${prefix}/index.html`)).toBeDefined()
      })
      test('Create file under subfolder and check it', async () => {
        const prefix = `/${nanoid()}`
        expect(await storage.HEAD(`${prefix}/subfolder/index.html`)).not.toBeDefined()
        expect(await storage.HEAD(`${prefix}/subfolder/`)).not.toBeDefined()
        await storage.PUT(`${prefix}/subfolder/index.html`, '')
        expect(await storage.HEAD(`${prefix}/subfolder/`)).toBeDefined()
        expect(await storage.HEAD(`${prefix}/subfolder/index.html`)).toBeDefined()
        expect(await storage.HEAD(`${prefix}/subfolder/index.html`)).toStrictEqual({
          mime: 'text/html',
          mtime: expect.any(Date),
          size: 0,
          type: 'file',
        })
      })
      test('Create folder and check it', async () => {
        const prefix = `/${nanoid()}`
        expect(await storage.HEAD(`${prefix}/folder`)).not.toBeDefined()
        await storage.MKCOL(`${prefix}/folder`)
        expect(await storage.HEAD(`${prefix}/folder`)).toBeDefined()
        expect(await storage.HEAD(`${prefix}/folder`)).toStrictEqual({
          mime: null,
          mtime: expect.any(Date),
          size: 0,
          type: 'directory',
        })
      })
      test('to be delete folder and check it', async () => {
        const prefix = `/${nanoid()}`
        expect(await storage.HEAD(`${prefix}/toBeDeleteFolder`)).not.toBeDefined()
        await storage.MKCOL(`${prefix}/toBeDeleteFolder`)
        expect(await storage.HEAD(`${prefix}/toBeDeleteFolder`)).toBeDefined()
        await storage.DELETE(`${prefix}/toBeDeleteFolder`)
        expect(await storage.HEAD(`${prefix}/toBeDeleteFolder`)).not.toBeDefined()
      })
      test('to be delete file and check it', async () => {
        const prefix = `/${nanoid()}`
        expect(await storage.HEAD(`${prefix}/toBeDeleteFile/sample.txt`)).not.toBeDefined()
        expect(await storage.HEAD(`${prefix}/toBeDeleteFile`)).not.toBeDefined()
        await storage.PUT(`${prefix}/toBeDeleteFile/sample.txt`, '')
        expect(await storage.HEAD(`${prefix}/toBeDeleteFile`)).toBeDefined()
        expect(await storage.HEAD(`${prefix}/toBeDeleteFile/sample.txt`)).toBeDefined()
        await storage.DELETE(`${prefix}/toBeDeleteFile/sample.txt`)
        expect(await storage.HEAD(`${prefix}/toBeDeleteFile/sample.txt`)).not.toBeDefined()
        expect(await storage.HEAD(`${prefix}/toBeDeleteFile`)).toBeDefined()
      })
      test('find files and folders', async () => {
        const prefix = `/${nanoid()}`
        await storage.PUT(`${prefix}/find/aaa/bbb/ccc/ddd/index.html`, '')
        await storage.MKCOL(`${prefix}/find/aaa/bbb/ccc/ddd`)
        await storage.PUT(`${prefix}/find/aaa/bbb/sample1.txt`, '')
        await storage.PUT(`${prefix}/find/aaa/bbb/sample2.txt`, '')
        await storage.MKCOL(`${prefix}/find/aaa/bbb/sample`)
        await storage.PUT(`${prefix}/find/aaa/sample.txt`, '')
        await storage.MKCOL(`${prefix}/find/aaa/folder`)

        expect(await storage.PROPFIND(`${prefix}/find/aaa/bbb/ccc/ddd/index.html`, { depth: 0 })).toHaveLength(1)
        expect(await storage.PROPFIND(`${prefix}/find/aaa/bbb/ccc/ddd`, { depth: 0 })).toHaveLength(1)
        expect(await storage.PROPFIND(`${prefix}/find/aaa/bbb/`, { depth: 1 })).toHaveLength(5)
        expect(await storage.PROPFIND(`${prefix}/find/`, { depth: Infinity })).toHaveLength(11)
      })
    })
  })
})
