import { describe, expect, it, vi, beforeEach } from 'vitest'
import { WebdavAdapter } from '../WebdavAdapter'

const mockClient = {
  getDirectoryContents: vi.fn(),
  stat: vi.fn(),
  getFileContents: vi.fn(),
  putFileContents: vi.fn(),
  deleteFile: vi.fn(),
  createDirectory: vi.fn(),
  moveFile: vi.fn(),
  copyFile: vi.fn()
}

vi.mock('webdav', () => ({
  createClient: vi.fn(() => mockClient)
}))

describe('WebdavAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('resolves paths with prefix', async () => {
    mockClient.getDirectoryContents.mockResolvedValue([{ basename: 'a', type: 'directory' }])

    const adapter = new WebdavAdapter({ url: 'http://example', prefix: '/base' })
    const list = await adapter.list('dir')

    expect(mockClient.getDirectoryContents).toHaveBeenCalledWith('/base/dir')
    expect(list).toEqual([{ path: 'dir/a', isDirectory: true }])
  })

  it('write uses resolved path', async () => {
    const adapter = new WebdavAdapter({ url: 'http://example', prefix: '/base' })
    await adapter.write('file.txt', new Uint8Array([1]))
    expect(mockClient.putFileContents).toHaveBeenCalled()
    const args = mockClient.putFileContents.mock.calls[0]
    expect(args[0]).toBe('/base/file.txt')
  })
})
