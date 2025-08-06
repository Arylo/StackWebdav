import fs from 'fs'
import path from 'path'
import { describe, expect, test } from "vitest"
import LocalTestStorage from "./LocalTestStorage"

describe(LocalTestStorage.name, () => {
  test('Create folder and sub folder', () => {
    const mockFiles: Array<string | [string, string?]> = [
      'aaa',
      ['bbb/ccc'],
    ]
    const storage = new LocalTestStorage('/', { files: mockFiles })
    const targetPath = storage.toJSON().device.path
    expect(fs.statSync(path.resolve(targetPath, 'aaa')).isDirectory()).toBeTruthy()
    expect(fs.statSync(path.resolve(targetPath, 'bbb/ccc')).isDirectory()).toBeTruthy()
  })

  describe.each(['/', '/mount'])(`Mount path: %s`, (mountPath) => {
    test('Create file and files in sub folder', () => {
      const mockFiles: Array<string | [string, string?]> = [
        ['length-0.txt', ''],
        ['length-8.txt', '12345678'],
        ['file/length-0.txt', ''],
        ['files/length-0.txt', ''],
        ['files/length-8.txt', '12345678'],
      ]
      const storage = new LocalTestStorage(mountPath, { files: mockFiles })
      const targetPath = storage.toJSON().device.path

      expect(fs.statSync(path.resolve(targetPath, 'length-0.txt')).isFile()).toBeTruthy()
      expect(fs.readFileSync(path.resolve(targetPath, 'length-0.txt'), 'utf-8')).toEqual('')
      expect(fs.statSync(path.resolve(targetPath, 'length-8.txt')).isFile()).toBeTruthy()
      expect(fs.readFileSync(path.resolve(targetPath, 'length-8.txt'), 'utf-8')).toEqual('12345678')
      expect(fs.statSync(path.resolve(targetPath, 'file/length-0.txt')).isFile()).toBeTruthy()
      expect(fs.readFileSync(path.resolve(targetPath, 'file/length-0.txt'), 'utf-8')).toEqual('')
      expect(fs.statSync(path.resolve(targetPath, 'files/length-0.txt')).isFile()).toBeTruthy()
      expect(fs.readFileSync(path.resolve(targetPath, 'files/length-0.txt'), 'utf-8')).toEqual('')
      expect(fs.statSync(path.resolve(targetPath, 'files/length-8.txt')).isFile()).toBeTruthy()
      expect(fs.readFileSync(path.resolve(targetPath, 'files/length-8.txt'), 'utf-8')).toEqual('12345678')
    })
  })
})
