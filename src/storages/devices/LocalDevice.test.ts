import fs from 'fs'
import path from 'path'
import os from 'os'
import { beforeAll, afterAll, describe, expect, test } from "vitest"
import LocalDevice from "./LocalDevice"
import { nanoid } from 'nanoid'
import { rimrafSync } from 'rimraf'
import '../../../test/expectFs'
import genPathGroup from '../../utils/genPathGroup'

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
      let storage: LocalDevice
      beforeAll(() => {
        fs.mkdirSync(testRootPath, { recursive: true })
        storage = new LocalDevice(testRootPath)
      })
      afterAll(() => {
        rimrafSync(testRootPath)
      })

      test('Create file and check it', async () => {
        const prefix = genPathGroup(`/${nanoid()}`)
        expect(await storage.HEAD(prefix.append(`/index.html`))).not.toBeDefined()
        await storage.PUT(prefix.append(`/index.html`), '')
        expect(await storage.HEAD(prefix.append(`/index.html`))).toBeDefined()
        expect(path.resolve(testRootPath, `.${prefix.toString()}`, 'index.html')).toBeFileExist()
        expect(path.resolve(testRootPath, `.${prefix.toString()}`, 'index.html')).toBeFileContent('')
      })
      test('Create file under subfolder and check it', async () => {
        const prefix = genPathGroup(`/${nanoid()}`)
        expect(await storage.HEAD(prefix.append(`/subfolder/index.html`))).not.toBeDefined()
        expect(await storage.HEAD(prefix.append(`/subfolder/`))).not.toBeDefined()
        await storage.PUT(prefix.append(`/subfolder/index.html`), '')
        expect(await storage.HEAD(prefix.append(`/subfolder/`))).toBeDefined()
        expect(await storage.HEAD(prefix.append(`/subfolder/index.html`))).toBeDefined()
        expect(await storage.HEAD(prefix.append(`/subfolder/index.html`))).toStrictEqual({
          mime: 'text/html',
          mtime: expect.any(Date),
          size: 0,
          type: 'file',
        })
        expect(path.resolve(testRootPath, `.${prefix.toString()}`, 'subfolder/index.html')).toBeFileExist()
        expect(path.resolve(testRootPath, `.${prefix.toString()}`, 'subfolder/index.html')).toBeFileContent('')
      })
      test('Create folder and check it', async () => {
        const prefix = genPathGroup(`/${nanoid()}`)
        expect(await storage.HEAD(prefix.append(`/folder`))).not.toBeDefined()
        await storage.MKCOL(prefix.append(`/folder`))
        expect(await storage.HEAD(prefix.append(`/folder`))).toBeDefined()
        expect(await storage.HEAD(prefix.append(`/folder`))).toStrictEqual({
          mime: null,
          mtime: expect.any(Date),
          size: 0,
          type: 'directory',
        })
        expect(path.resolve(testRootPath, `.${prefix.toString()}`, 'folder')).toBeFolderExist()
      })
      test('to be delete folder and check it', async () => {
        const prefix = genPathGroup(`/${nanoid()}`)
        expect(await storage.HEAD(prefix.append(`/toBeDeleteFolder`))).not.toBeDefined()
        await storage.MKCOL(prefix.append(`/toBeDeleteFolder`))
        expect(await storage.HEAD(prefix.append(`/toBeDeleteFolder`))).toBeDefined()
        await storage.DELETE(prefix.append(`/toBeDeleteFolder`))
        expect(await storage.HEAD(prefix.append(`/toBeDeleteFolder`))).not.toBeDefined()
        expect(path.resolve(testRootPath, `.${prefix.toString()}`, 'toBeDeleteFolder')).not.toBeFolderExist()
      })
      test('to be delete file and check it', async () => {
        const prefix = genPathGroup(`/${nanoid()}`)
        expect(await storage.HEAD(prefix.append(`/toBeDeleteFile/sample.txt`))).not.toBeDefined()
        expect(await storage.HEAD(prefix.append(`/toBeDeleteFile`))).not.toBeDefined()
        await storage.PUT(prefix.append(`/toBeDeleteFile/sample.txt`), '')
        expect(await storage.HEAD(prefix.append(`/toBeDeleteFile`))).toBeDefined()
        expect(await storage.HEAD(prefix.append(`/toBeDeleteFile/sample.txt`))).toBeDefined()
        await storage.DELETE(prefix.append(`/toBeDeleteFile/sample.txt`))
        expect(await storage.HEAD(prefix.append(`/toBeDeleteFile/sample.txt`))).not.toBeDefined()
        expect(await storage.HEAD(prefix.append(`/toBeDeleteFile`))).toBeDefined()
        expect(path.resolve(testRootPath, `.${prefix.toString()}`, 'toBeDeleteFile/sample.txt')).not.toBeFileExist()
      })
      test('find files and folders', async () => {
        const prefix = genPathGroup(`/${nanoid()}`)
        await storage.PUT(prefix.append(`/find/aaa/bbb/ccc/ddd/index.html`), '')
        await storage.MKCOL(prefix.append(`/find/aaa/bbb/ccc/ddd`))
        await storage.PUT(prefix.append(`/find/aaa/bbb/sample1.txt`), '')
        await storage.PUT(prefix.append(`/find/aaa/bbb/sample2.txt`), '')
        await storage.MKCOL(prefix.append(`/find/aaa/bbb/sample`))
        await storage.PUT(prefix.append(`/find/aaa/sample.txt`), '')
        await storage.MKCOL(prefix.append(`/find/aaa/folder`))

        expect(await storage.PROPFIND(prefix.append(`/find/aaa/bbb/ccc/ddd/index.html`), { depth: 0 })).toHaveLength(1)
        expect(await storage.PROPFIND(prefix.append(`/find/aaa/bbb/ccc/ddd`), { depth: 0 })).toHaveLength(1)
        expect(await storage.PROPFIND(prefix.append(`/find/aaa/bbb/`), { depth: 1 })).toHaveLength(5)
        expect(await storage.PROPFIND(prefix.append(`/find/`), { depth: Infinity })).toHaveLength(11)
      })
    })
  })
})
