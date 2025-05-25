import { createClient } from "webdav"
import { createTestFile, createTestFolder, describeApp } from "../test/storage"
import { expect, test } from "vitest"

function initFiles () {
  createTestFolder('folder')
  createTestFile('index.js')
  createTestFile('length-8.txt', '12345678')
  createTestFile('withFile/index.js')
  createTestFile('withFiles/index.js')
  createTestFile('withFiles/index.html', '<html></html>')
  createTestFile('withFiles/length-4.txt', '1234')
}

describeApp("e2e", (address) => {
  const client = createClient(address, {
    username: 'test',
    password: 'test',
  })
  test('List Root', async () => {
    const list = await client.getDirectoryContents('/withFiles')
    expect(list).toHaveLength(3)
  })
  test('Fetch File', async () => {
    const str = await client.getFileContents("/length-8.txt", { format: "text" })
    expect(str).toBe('12345678')
  })
  test('Create File', async () => {
    await client.putFileContents('/newFile.txt', 'Hello World')
    const str = await client.getFileContents("/newFile.txt", { format: "text" })
    expect(str).toBe('Hello World')
  })
  test('Delete File', async () => {
    let list: any[]
    list = await client.getDirectoryContents('/withFile') as any[]
    expect(list).toHaveLength(1)
    await client.deleteFile('/withFile/index.js')
    list = await client.getDirectoryContents('/withFile') as any[]
    expect(list).toHaveLength(0)
  })
  test('Create Folder', async () => {
    expect(await client.exists('/newFolder')).toBeFalsy()
    await client.createDirectory('/newFolder')
    expect(await client.exists('/newFolder')).toBeTruthy()
  })
  test('Delete Folder', async () => {
    expect(await client.exists('/folder')).toBeTruthy()
    await client.deleteFile('/folder')
    expect(await client.exists('/folder')).toBeFalsy()
  })
}, { setup: initFiles })
