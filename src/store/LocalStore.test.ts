import path from 'path'
import os from 'os'
import { describe, expect, test } from "vitest";
import { LocalStore } from "./LocalStore";
import { nanoid } from 'nanoid';

describe('Store', () => {
  describe(LocalStore.name, () => {
    describe('Basic', () => {
      test('use constructor method to create instance', () => {
        const store = new LocalStore('/', { path: os.tmpdir() })
        expect(store).toBeInstanceOf(LocalStore)
      })
      test('use create method to create instance', () => {
        const store = LocalStore.create('/', { path: os.tmpdir() })
        expect(store).toBeInstanceOf(LocalStore)
      })
      test('check target path in this store', () => {
        const targetPath = '/folder/index.html'
        let store: LocalStore
        store = LocalStore.create('/', { path: os.tmpdir() })
        expect(store.check(targetPath)).toBeTruthy()
        store = LocalStore.create('/otherFolder', { path: os.tmpdir() })
        expect(store.check(targetPath)).toBeFalsy()
      })
      test('get store info', () => {
        const store = LocalStore.create('/', { path: os.tmpdir() })
        expect(store.getStoreInfo()).toStrictEqual({
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
      const store = new LocalStore('/', { path: path.resolve(os.tmpdir(), nanoid()) })
      test.sequential('Create file and check it', async () => {
        expect(await store.has('/index.html')).toBeFalsy()
        await store.create('/index.html', { type: 'file' })
        expect(await store.has('/index.html')).toBeTruthy()
      })
      test.sequential('Create file under subfolder and check it', async () => {
        expect(await store.has('/subfolder/index.html')).toBeFalsy()
        expect(await store.has('/subfolder/')).toBeFalsy()
        await store.create('/subfolder/index.html', { type: 'file' })
        expect(await store.has('/subfolder/')).toBeTruthy()
        expect(await store.has('/subfolder/index.html')).toBeTruthy()
        expect(await store.stat('/subfolder/index.html')).toStrictEqual({
          mime: 'text/html',
          mtime: expect.any(Date),
          size: 0,
          type: 'file',
        })
      })
      test.sequential('Create folder and check it', async () => {
        expect(await store.has('/folder')).toBeFalsy()
        await store.create('/folder', { type: 'directory' })
        expect(await store.has('/folder')).toBeTruthy()
        expect(await store.stat('/folder')).toStrictEqual({
          mime: null,
          mtime: expect.any(Date),
          size: 0,
          type: 'directory',
        })
      })
      test.sequential('to be delete folder and check it', async () => {
        expect(await store.has('/toBeDeleteFolder')).toBeFalsy()
        await store.create('/toBeDeleteFolder', { type: 'directory' })
        expect(await store.has('/toBeDeleteFolder')).toBeTruthy()
        await store.delete('/toBeDeleteFolder')
        expect(await store.has('/toBeDeleteFolder')).toBeFalsy()
      })
      test.sequential('to be delete file and check it', async () => {
        expect(await store.has('/toBeDeleteFile/sample.txt')).toBeFalsy()
        expect(await store.has('/toBeDeleteFile')).toBeFalsy()
        await store.create('/toBeDeleteFile/sample.txt', { type: 'file' })
        expect(await store.has('/toBeDeleteFile')).toBeTruthy()
        expect(await store.has('/toBeDeleteFile/sample.txt')).toBeTruthy()
        await store.delete('/toBeDeleteFile/sample.txt')
        expect(await store.has('/toBeDeleteFile/sample.txt')).toBeFalsy()
        expect(await store.has('/toBeDeleteFile')).toBeTruthy()
      })
    })
  })
})
