import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AzureBlobAdapter } from '../AzureBlobAdapter'

const makeAsyncIterator = <T>(items: T[]) => ({
  async *[Symbol.asyncIterator]() {
    for (const item of items) yield item
  }
})

let mockContainer: any

vi.mock('@azure/storage-blob', () => {
  class BlobServiceClient {
    static fromConnectionString(_cs: string) {
      return new BlobServiceClient()
    }

    getContainerClient(_name: string) {
      return mockContainer
    }
  }

  class StorageSharedKeyCredential {
    constructor(_name: string, _key: string) {}
  }

  return { BlobServiceClient, StorageSharedKeyCredential }
})

describe('AzureBlobAdapter', () => {
  beforeEach(() => {
    mockContainer = {
      createIfNotExists: vi.fn().mockResolvedValue(undefined),
      listBlobsByHierarchy: vi.fn(),
      listBlobsFlat: vi.fn(),
      getBlobClient: vi.fn((name: string) => ({
        name,
        url: `https://example/${name}`,
        exists: vi.fn().mockResolvedValue(false),
        getProperties: vi.fn().mockResolvedValue({ contentLength: 1, lastModified: new Date() }),
        downloadToBuffer: vi.fn().mockResolvedValue(Buffer.from('x'))
      })),
      getBlockBlobClient: vi.fn((name: string) => ({
        name,
        uploadData: vi.fn().mockResolvedValue(undefined)
      })),
      deleteBlob: vi.fn().mockResolvedValue(undefined)
    }
  })

  it('mkdir does not duplicate prefix', async () => {
    const adapter = new AzureBlobAdapter({
      connectionString: 'UseDevelopmentStorage=true',
      containerName: 'test',
      prefix: 'tmp'
    })

    await adapter.mkdir('tmp/aaa')
    expect(mockContainer.getBlockBlobClient).toHaveBeenCalled()
    const name = mockContainer.getBlockBlobClient.mock.calls[0][0]
    expect(name).toBe('tmp/aaa/')
  })

  it('list uses prefix and maps entries', async () => {
    mockContainer.listBlobsByHierarchy.mockReturnValue(
      makeAsyncIterator([{ name: 'tmp/dir/', kind: 'prefix' }])
    )

    const adapter = new AzureBlobAdapter({
      connectionString: 'UseDevelopmentStorage=true',
      containerName: 'test',
      prefix: 'tmp'
    })

    const entries = await adapter.list('dir')
    expect(entries).toEqual([{ path: 'dir', isDirectory: true }])
  })
})
