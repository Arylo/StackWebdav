import path from 'path'
import { createClient, WebDAVClient } from "webdav"
import { beforeAll, describe, expect, test } from "vitest"
import { describeApp } from "../test/describeApp"
import LocalTestStorage from "../test/LocalTestStorage"
import '../test/expectFs'

const localTestRootStorage = new LocalTestStorage('/', {
  files: ({ folder, file }) => {
    folder('folder')
    file('index.js')
    file('length-8.txt', '12345678')
    file('withFile/index.js')
    file('withFiles/index.js')
    file('withFiles/index.html', '<html></html>')
    file('withFiles/length-4.txt', '1234')
  },
})
const localTestFolderStorage = new LocalTestStorage('/withFiles/mount')

describeApp("e2e", (address) => {
  localTestRootStorage.afterAll()
  localTestFolderStorage.afterAll()
  describe('WebDAV Service', () => {
    let client: WebDAVClient
    beforeAll(() => {
      client = createClient(address, {
        username: 'test',
        password: 'test',
      })
    })

    test.concurrent('List Root', async () => {
      const list = await client.getDirectoryContents('/withFiles')
      expect(list).toHaveLength(4)
    })
    test.concurrent('Fetch File', async () => {
      const str = await client.getFileContents("/length-8.txt", { format: 'text' })
      expect(str).toBe('12345678')
    })
    test.concurrent('Create File', async () => {
      await client.putFileContents('/newFile.txt', 'Hello World')
      const str = await client.getFileContents("/newFile.txt", { format: "text" })
      expect(str).toBe('Hello World')

      const newFilePath = path.resolve(localTestRootStorage.toJSON().device.path, './newFile.txt')
      expect(newFilePath).toBeFileExist()
      expect(newFilePath).toBeFileContent('Hello World')
    })
    test.concurrent('Delete File', async () => {
      let list: any[]
      list = await client.getDirectoryContents('/withFile') as any[]
      expect(list).toHaveLength(1)
      await client.deleteFile('/withFile/index.js')
      const filePath = path.resolve(localTestRootStorage.toJSON().device.path, './withFile/index.js')
      expect(filePath).not.toBeFileExist()
      list = await client.getDirectoryContents('/withFile') as any[]
      expect(list).toHaveLength(0)
    })
    test.concurrent('Create Folder', async () => {
      expect(await client.exists('/newFolder')).toBeFalsy()
      await client.createDirectory('/newFolder')
      const folderPath = path.resolve(localTestRootStorage.toJSON().device.path, './newFolder')
      expect(folderPath).toBeFolderExist()
      expect(await client.exists('/newFolder')).toBeTruthy()
    })
    test.concurrent('Delete Folder', async () => {
      expect(await client.exists('/folder')).toBeTruthy()
      await client.deleteFile('/folder')
      const folderPath = path.resolve(localTestRootStorage.toJSON().device.path, './folder')
      expect(folderPath).not.toBeFolderExist()
      expect(await client.exists('/folder')).toBeFalsy()
    })
  })
}, { storages: [localTestRootStorage, localTestFolderStorage] })
