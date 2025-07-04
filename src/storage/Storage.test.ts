import { describe, expect, test } from "vitest";
import Storage from "./Storage";
import resourcePath from "../utils/ResourcePath";
import createTestPath from "../../test/createTestPath";

describe('Simple Storage', () => {
  test('Create new storage', () => {
    const storage = new Storage('/', {
      device: { type: 'local', path: '/test' },
    })
    expect(storage.toJSON()).toEqual({
      id: expect.any(String),
      path: '/',
      device: { type: 'local', path: '/test' },
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
  })
  test('Create existing storage from JSON', () => {
    const now = new Date()
    const storage = Storage.createFromJSON({
      id: 'test-id',
      path: '/',
      device: { type: 'local', path: '/test' },
      createdAt: now,
      updatedAt: now,
    })
    expect(storage.toJSON()).toEqual({
      id: 'test-id',
      path: '/',
      device: { type: 'local', path: '/test' },
      createdAt: now,
      updatedAt: now,
    })
  })
  describe('match mount path', () => {
    const storage = new Storage('/test', {
      device: { type: 'local', path: '/test' },
    })
    test('Match root path', () => {
      expect(storage.match(resourcePath('/'))).toBeTruthy()
    })
    test('Match exact path', () => {
      expect(storage.match(resourcePath('/test'))).toBeTruthy()
    })
    test('Match subpath', () => {
      expect(storage.match(resourcePath('/test/subpath'))).toBeTruthy()
    })
    test('Not match different path', () => {
      expect(storage.match(resourcePath('/other'))).toBeFalsy()
    })
  })
  describe('update features', () => {
    const storage = new Storage('/test', {
      device: { type: 'local', path: '/test' },
    })
    test('Update path', () => {
      storage.updateConfig({ path: '/new-test' })
      expect(storage.toJSON().path).toBe('/new-test')
    })
    test('Update filter', () => {
      storage.updateConfig({ filter: '*.txt' })
      expect(storage.toJSON().filter).toBe('*.txt')
    })
    test('Update device', () => {
      storage.updateConfig({ device: { type: 'local', path: '/new-device' } })
      expect(storage.toJSON().device).toEqual({ type: 'local', path: '/new-device' })
    })
  })

  describe('Webdav features', () => {
    const testPath = createTestPath(({ createFolder, createFile }) => {
      createFolder('webdav')
      createFile('webdav/test.txt', 'Hello WebDAV')
    })
    const storage = new Storage('/webdav', {
      device: { type: 'local', path: testPath },
    })
    test('PROPFIND root path', async () => {
      const result = await storage.PROPFIND(resourcePath('/'), { depth: 1 })
      expect(result).toEqual({
        href: '/webdav',
        properties: {
          'd:resourcetype': { 'd:collection': {} },
          'd:getcontentlength': '0',
          'd:getlastmodified': expect.any(String),
        },
      })
    })
  })
})
