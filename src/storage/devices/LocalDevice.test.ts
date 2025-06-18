import path from 'path'
import os from 'os'
import { afterAll, describe, expect, test } from "vitest";
import LocalDevice from "./LocalDevice";
import { nanoid } from 'nanoid';
import { rimrafSync } from 'rimraf';
import resourcePath from '../../utils/ResourcePath';

describe('Storage', () => {
  describe(LocalDevice.name, () => {
    describe('Basic', () => {
      test('use constructor method to create instance', () => {
        const storage = new LocalDevice(os.tmpdir())
        expect(storage).toBeInstanceOf(LocalDevice)
      })
    })
    describe('Actions', () => {
      const testRootPath = path.resolve(os.tmpdir(), nanoid())
      afterAll(() => {
        rimrafSync(testRootPath)
      })

      const storage = new LocalDevice(testRootPath)
      test('Create file and check it', async () => {
        const prefix = resourcePath(`/${nanoid()}`)
        expect(await storage.HEAD(prefix.join(`/index.html`))).not.toBeDefined()
        await storage.PUT(prefix.join(`/index.html`), '')
        expect(await storage.HEAD(prefix.join(`/index.html`))).toBeDefined()
      })
      test('Create file under subfolder and check it', async () => {
        const prefix = resourcePath(`/${nanoid()}`)
        expect(await storage.HEAD(prefix.join(`/subfolder/index.html`))).not.toBeDefined()
        expect(await storage.HEAD(prefix.join(`/subfolder/`))).not.toBeDefined()
        await storage.PUT(prefix.join(`/subfolder/index.html`), '')
        expect(await storage.HEAD(prefix.join(`/subfolder/`))).toBeDefined()
        expect(await storage.HEAD(prefix.join(`/subfolder/index.html`))).toBeDefined()
        expect(await storage.HEAD(prefix.join(`/subfolder/index.html`))).toStrictEqual({
          mime: 'text/html',
          mtime: expect.any(Date),
          size: 0,
          type: 'file',
        })
      })
      test('Create folder and check it', async () => {
        const prefix = resourcePath(`/${nanoid()}`)
        expect(await storage.HEAD(prefix.join(`/folder`))).not.toBeDefined()
        await storage.MKCOL(prefix.join(`/folder`))
        expect(await storage.HEAD(prefix.join(`/folder`))).toBeDefined()
        expect(await storage.HEAD(prefix.join(`/folder`))).toStrictEqual({
          mime: null,
          mtime: expect.any(Date),
          size: 0,
          type: 'directory',
        })
      })
      test('to be delete folder and check it', async () => {
        const prefix = resourcePath(`/${nanoid()}`)
        expect(await storage.HEAD(prefix.join(`/toBeDeleteFolder`))).not.toBeDefined()
        await storage.MKCOL(prefix.join(`/toBeDeleteFolder`))
        expect(await storage.HEAD(prefix.join(`/toBeDeleteFolder`))).toBeDefined()
        await storage.DELETE(prefix.join(`/toBeDeleteFolder`))
        expect(await storage.HEAD(prefix.join(`/toBeDeleteFolder`))).not.toBeDefined()
      })
      test('to be delete file and check it', async () => {
        const prefix = resourcePath(`/${nanoid()}`)
        expect(await storage.HEAD(prefix.join(`/toBeDeleteFile/sample.txt`))).not.toBeDefined()
        expect(await storage.HEAD(prefix.join(`/toBeDeleteFile`))).not.toBeDefined()
        await storage.PUT(prefix.join(`/toBeDeleteFile/sample.txt`), '')
        expect(await storage.HEAD(prefix.join(`/toBeDeleteFile`))).toBeDefined()
        expect(await storage.HEAD(prefix.join(`/toBeDeleteFile/sample.txt`))).toBeDefined()
        await storage.DELETE(prefix.join(`/toBeDeleteFile/sample.txt`))
        expect(await storage.HEAD(prefix.join(`/toBeDeleteFile/sample.txt`))).not.toBeDefined()
        expect(await storage.HEAD(prefix.join(`/toBeDeleteFile`))).toBeDefined()
      })
      test('find files and folders', async () => {
        const prefix = resourcePath(`/${nanoid()}`)
        await storage.PUT(prefix.join(`/find/aaa/bbb/ccc/ddd/index.html`), '')
        await storage.MKCOL(prefix.join(`/find/aaa/bbb/ccc/ddd`))
        await storage.PUT(prefix.join(`/find/aaa/bbb/sample1.txt`), '')
        await storage.PUT(prefix.join(`/find/aaa/bbb/sample2.txt`), '')
        await storage.MKCOL(prefix.join(`/find/aaa/bbb/sample`))
        await storage.PUT(prefix.join(`/find/aaa/sample.txt`), '')
        await storage.MKCOL(prefix.join(`/find/aaa/folder`))

        expect(await storage.PROPFIND(prefix.join(`/find/aaa/bbb/ccc/ddd/index.html`), { depth: 0 })).toHaveLength(1)
        expect(await storage.PROPFIND(prefix.join(`/find/aaa/bbb/ccc/ddd`), { depth: 0 })).toHaveLength(1)
        expect(await storage.PROPFIND(prefix.join(`/find/aaa/bbb/`), { depth: 1 })).toHaveLength(5)
        expect(await storage.PROPFIND(prefix.join(`/find/`), { depth: Infinity })).toHaveLength(11)
      })
    })
  })
})
