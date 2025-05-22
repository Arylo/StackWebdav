import path from 'path'
import os from 'os'
import { describe, expect, test } from "vitest";
import { LocalStorage } from "./LocalStorage";
import { nanoid } from 'nanoid';

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
      const storage = new LocalStorage('/', { path: path.resolve(os.tmpdir(), nanoid()) })
      test.sequential('Create file and check it', async () => {
        expect(await storage.has('/index.html')).toBeFalsy()
        await storage.create('/index.html', { type: 'file' })
        expect(await storage.has('/index.html')).toBeTruthy()
      })
      test.sequential('Create file under subfolder and check it', async () => {
        expect(await storage.has('/subfolder/index.html')).toBeFalsy()
        expect(await storage.has('/subfolder/')).toBeFalsy()
        await storage.create('/subfolder/index.html', { type: 'file' })
        expect(await storage.has('/subfolder/')).toBeTruthy()
        expect(await storage.has('/subfolder/index.html')).toBeTruthy()
        expect(await storage.HEAD('/subfolder/index.html')).toStrictEqual({
          mime: 'text/html',
          mtime: expect.any(Date),
          size: 0,
          type: 'file',
        })
      })
      test.sequential('Create folder and check it', async () => {
        expect(await storage.has('/folder')).toBeFalsy()
        await storage.MKCOL('/folder')
        expect(await storage.has('/folder')).toBeTruthy()
        expect(await storage.HEAD('/folder')).toStrictEqual({
          mime: null,
          mtime: expect.any(Date),
          size: 0,
          type: 'directory',
        })
      })
      test.sequential('to be delete folder and check it', async () => {
        expect(await storage.has('/toBeDeleteFolder')).toBeFalsy()
        await storage.MKCOL('/toBeDeleteFolder')
        expect(await storage.has('/toBeDeleteFolder')).toBeTruthy()
        await storage.DELETE('/toBeDeleteFolder')
        expect(await storage.has('/toBeDeleteFolder')).toBeFalsy()
      })
      test.sequential('to be delete file and check it', async () => {
        expect(await storage.has('/toBeDeleteFile/sample.txt')).toBeFalsy()
        expect(await storage.has('/toBeDeleteFile')).toBeFalsy()
        await storage.create('/toBeDeleteFile/sample.txt', { type: 'file' })
        expect(await storage.has('/toBeDeleteFile')).toBeTruthy()
        expect(await storage.has('/toBeDeleteFile/sample.txt')).toBeTruthy()
        await storage.DELETE('/toBeDeleteFile/sample.txt')
        expect(await storage.has('/toBeDeleteFile/sample.txt')).toBeFalsy()
        expect(await storage.has('/toBeDeleteFile')).toBeTruthy()
      })
    })
  })
})
