import { mkdtemp, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import Koa from 'koa'
import Router from '@koa/router'
import { createClient } from 'webdav'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { LocalAdapter } from '../../../adapters/LocalAdapter'
import { createWebdavRouter } from '../index'

describe('webdav-client integration', () => {
  let root: string
  let app: Koa
  let server: any
  let baseUrl: string

  async function startServerWithMounts(mounts: { mount: string; root: string }[]) {
    const tempApp = new Koa()
    const tempRouter = new Router()

    tempRouter.use(async (ctx, next) => {
      ctx.state.webdavMounts = mounts.map((m) => ({ mount: m.mount, adapter: new LocalAdapter({ root: m.root }) }))
      await next()
    })

    const webdavRouter = createWebdavRouter()
    tempRouter.use('/webdav', webdavRouter.routes(), webdavRouter.allowedMethods())
    tempApp.use(tempRouter.routes()).use(tempRouter.allowedMethods())

    let tempServer: any
    await new Promise<void>((resolve) => {
      tempServer = tempApp.listen(0, () => resolve())
    })
    const address = tempServer.address()
    const url = `http://127.0.0.1:${address.port}`

    return {
      client: createClient(`${url}/webdav`),
      close: async () => new Promise<void>((resolve) => tempServer.close(() => resolve()))
    }
  }

  beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), 'stackwebdav-client-'))
    await writeFile(join(root, 'seed.txt'), 'seed')

    app = new Koa()
    const router = new Router()

    router.use(async (ctx, next) => {
      ctx.state.webdavMounts = [{ mount: '/', adapter: new LocalAdapter({ root }) }]
      await next()
    })

    const webdavRouter = createWebdavRouter()
    router.use('/webdav', webdavRouter.routes(), webdavRouter.allowedMethods())

    app.use(router.routes()).use(router.allowedMethods())

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve())
    })
    const address = server.address()
    baseUrl = `http://127.0.0.1:${address.port}`
  })

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()))
    }
    await rm(root, { recursive: true, force: true })
  })

  describe('zero adapters', () => {
    it('returns 404 when no adapters are configured', async () => {
      const tempRoot = await mkdtemp(join(tmpdir(), 'stackwebdav-empty-'))
      const { client, close } = await startServerWithMounts([])
      await expect(client.getDirectoryContents('/')).rejects.toBeTruthy()
      await close()
      await rm(tempRoot, { recursive: true, force: true })
    })
  })

  describe('one adapter', () => {
    it('can list, read, write, copy, move, delete', async () => {
      const client = createClient(`${baseUrl}/webdav`)

      const list = await client.getDirectoryContents('/')
      const names = list.map((i: any) => i.basename)
      expect(names).toContain('seed.txt')

      await client.putFileContents('/hello.txt', 'hello', { overwrite: true })
      const content = await client.getFileContents('/hello.txt', { format: 'text' })
      expect(content).toBe('hello')

      await client.copyFile('/hello.txt', '/copy.txt')
      const copyContent = await client.getFileContents('/copy.txt', { format: 'text' })
      expect(copyContent).toBe('hello')

      await client.moveFile('/copy.txt', '/moved.txt')
      const movedContent = await client.getFileContents('/moved.txt', { format: 'text' })
      expect(movedContent).toBe('hello')

      await client.deleteFile('/moved.txt')
      const listAfter = await client.getDirectoryContents('/')
      const namesAfter = listAfter.map((i: any) => i.basename)
      expect(namesAfter).not.toContain('moved.txt')
    })

    it('can create directory and list nested contents', async () => {
      const client = createClient(`${baseUrl}/webdav`)

      await client.createDirectory('/dir1')
      await client.putFileContents('/dir1/nested.txt', 'nested', { overwrite: true })

      const list = await client.getDirectoryContents('/dir1')
      const names = list.map((i: any) => i.basename)
      expect(names).toContain('nested.txt')
    })

    it('PROPFIND depth=0 returns only self', async () => {
      const client = createClient(`${baseUrl}/webdav`)
      const res = await client.customRequest('/', { method: 'PROPFIND', headers: { Depth: '0' } })
      expect(res.status).toBe(207)
    })

    it('returns 404 when reading missing file', async () => {
      const client = createClient(`${baseUrl}/webdav`)
      await expect(client.getFileContents('/missing.txt', { format: 'text' })).rejects.toBeTruthy()
    })

    it('can overwrite existing file', async () => {
      const client = createClient(`${baseUrl}/webdav`)
      await client.putFileContents('/overwrite.txt', 'v1', { overwrite: true })
      await client.putFileContents('/overwrite.txt', 'v2', { overwrite: true })
      const content = await client.getFileContents('/overwrite.txt', { format: 'text' })
      expect(content).toBe('v2')
    })

    it('MOVE within same mount works with full Destination URL', async () => {
      const client = createClient(`${baseUrl}/webdav`)
      await client.putFileContents('/move-src.txt', 'mv', { overwrite: true })

      await client.customRequest('/move-src.txt', {
        method: 'MOVE',
        headers: {
          Destination: `${baseUrl}/webdav/move-dest.txt`
        }
      })

      const moved = await client.getFileContents('/move-dest.txt', { format: 'text' })
      expect(moved).toBe('mv')
    })

    it('COPY within same mount works with full Destination URL', async () => {
      const client = createClient(`${baseUrl}/webdav`)
      await client.putFileContents('/copy-src.txt', 'cp', { overwrite: true })

      await client.customRequest('/copy-src.txt', {
        method: 'COPY',
        headers: {
          Destination: `${baseUrl}/webdav/copy-dest.txt`
        }
      })

      const copied = await client.getFileContents('/copy-dest.txt', { format: 'text' })
      expect(copied).toBe('cp')
    })
  })

  describe('multiple adapters', () => {
    it('lists virtual folders for multiple adapters', async () => {
      const rootA = await mkdtemp(join(tmpdir(), 'stackwebdav-a-'))
      const rootB = await mkdtemp(join(tmpdir(), 'stackwebdav-b-'))
      await writeFile(join(rootA, 'root.txt'), 'root')

      const { client, close } = await startServerWithMounts([
        { mount: '/', root: rootA },
        { mount: '/foo/bar', root: rootB }
      ])

      const list = await client.getDirectoryContents('/')
      const names = list.map((i: any) => i.basename)
      expect(names).toContain('root.txt')
      expect(names).toContain('foo')

      await close()
      await rm(rootA, { recursive: true, force: true })
      await rm(rootB, { recursive: true, force: true })
    })
  })
})
