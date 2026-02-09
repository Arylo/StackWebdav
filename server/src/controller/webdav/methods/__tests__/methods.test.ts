import { describe, expect, it, vi } from 'vitest'
import { optionsHandler } from '../options'
import { propfindHandler } from '../propfind'
import { getHandler } from '../get'
import { putHandler } from '../put'
import { deleteHandler } from '../delete'
import { mkcolHandler } from '../mkcol'
import { moveHandler } from '../move'
import { copyHandler } from '../copy'
import type { WebdavMount } from '../../types'
import { Context } from 'koa'

function createAdapter(overrides: Partial<any> = {}) {
  return {
    list: vi.fn().mockResolvedValue([]),
    stat: vi.fn().mockResolvedValue({ exists: true, isDirectory: true }),
    read: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    write: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
    move: vi.fn().mockResolvedValue(undefined),
    copy: vi.fn().mockResolvedValue(undefined),
    ...overrides
  }
}

function makeCtx(overrides: Partial<any> = {}) {
  const headers: Record<string, string> = {}
  return {
    params: { path: '' },
    path: '/webdav',
    status: undefined as number | undefined,
    body: undefined as any,
    state: { webdavMounts: [] as WebdavMount[] },
    req: undefined as any,
    get: (key: string) => headers[key] ?? '',
    set: (key: string, value: string) => {
      headers[key] = value
    },
    _headers: headers,
    ...overrides
  } as unknown as Context
}

function makeReq(data: Buffer) {
  return {
    async *[Symbol.asyncIterator]() {
      yield data
    }
  }
}

describe('webdav methods', () => {
  it('OPTIONS sets DAV headers', async () => {
    const ctx = makeCtx()
    await optionsHandler()(ctx)
    expect(ctx._headers.DAV).toBe('1,2')
    expect(ctx._headers.Allow).toContain('PROPFIND')
    expect(ctx.status).toBe(200)
  })

  it('PROPFIND lists adapter root and virtual children', async () => {
    const rootAdapter = createAdapter({
      list: vi.fn().mockResolvedValue([{ path: 'docs', isDirectory: true }])
    })
    const ctx = makeCtx({
      params: { path: '' },
      path: '/webdav',
      get: (key: string) => (key === 'Depth' ? '1' : '')
    })
    ctx.state.webdavMounts = [
      { mount: '/', adapter: rootAdapter },
      { mount: '/foo/bar', adapter: createAdapter() }
    ]

    await propfindHandler()(ctx)
    expect(ctx.status).toBe(207)
    const body = String(ctx.body)
    expect(body).toContain('/webdav/docs')
    expect(body).toContain('/webdav/foo')
  })

  it('PROPFIND depth=0 returns only self', async () => {
    const rootAdapter = createAdapter({
      list: vi.fn().mockResolvedValue([{ path: 'docs', isDirectory: true }])
    })
    const ctx = makeCtx({
      params: { path: '' },
      path: '/webdav',
      get: (key: string) => (key === 'Depth' ? '0' : '')
    })
    ctx.state.webdavMounts = [{ mount: '/', adapter: rootAdapter }]

    await propfindHandler()(ctx)
    const body = String(ctx.body)
    expect(body).toContain('/webdav')
    expect(body).not.toContain('/webdav/docs')
  })

  it('PROPFIND returns virtual folders when no direct mount', async () => {
    const ctx = makeCtx({
      params: { path: '' },
      path: '/webdav',
      get: (key: string) => (key === 'Depth' ? '1' : '')
    })
    ctx.state.webdavMounts = [
      { mount: '/foo/bar', adapter: createAdapter() },
      { mount: '/foc/baz', adapter: createAdapter() }
    ]

    await propfindHandler()(ctx)
    const body = String(ctx.body)
    expect(body).toContain('/webdav/foo')
    expect(body).toContain('/webdav/foc')
  })

  it('GET returns file body', async () => {
    const adapter = createAdapter({
      stat: vi.fn().mockResolvedValue({ exists: true, isDirectory: false })
    })
    const ctx = makeCtx({ params: { path: 'file.txt' }, path: '/webdav/file.txt' })
    ctx.state.webdavMounts = [{ mount: '/', adapter }]

    await getHandler()(ctx)
    expect(ctx.status).toBe(200)
    expect(Buffer.isBuffer(ctx.body)).toBe(true)
  })

  it('GET returns 403 for directory', async () => {
    const adapter = createAdapter({
      stat: vi.fn().mockResolvedValue({ exists: true, isDirectory: true })
    })
    const ctx = makeCtx({ params: { path: 'dir' }, path: '/webdav/dir' })
    ctx.state.webdavMounts = [{ mount: '/', adapter }]

    await getHandler()(ctx)
    expect(ctx.status).toBe(403)
  })

  it('GET returns 404 when not found', async () => {
    const adapter = createAdapter({
      stat: vi.fn().mockResolvedValue({ exists: false, isDirectory: false })
    })
    const ctx = makeCtx({ params: { path: 'missing' }, path: '/webdav/missing' })
    ctx.state.webdavMounts = [{ mount: '/', adapter }]

    await getHandler()(ctx)
    expect(ctx.status).toBe(404)
  })

  it('PUT writes data', async () => {
    const adapter = createAdapter()
    const ctx = makeCtx({
      params: { path: 'file.txt' },
      path: '/webdav/file.txt',
      req: makeReq(Buffer.from('hello'))
    })
    ctx.state.webdavMounts = [{ mount: '/', adapter }]

    await putHandler()(ctx)
    expect(adapter.write).toHaveBeenCalled()
    expect(ctx.status).toBe(201)
  })

  it('PUT returns 404 when no mount matches', async () => {
    const ctx = makeCtx({
      params: { path: 'file.txt' },
      path: '/webdav/file.txt',
      req: makeReq(Buffer.from('hello'))
    })
    ctx.state.webdavMounts = [{ mount: '/other', adapter: createAdapter() }]

    await putHandler()(ctx)
    expect(ctx.status).toBe(404)
  })

  it('DELETE removes resource', async () => {
    const adapter = createAdapter()
    const ctx = makeCtx({ params: { path: 'file.txt' } })
    ctx.state.webdavMounts = [{ mount: '/', adapter }]

    await deleteHandler()(ctx)
    expect(adapter.delete).toHaveBeenCalled()
    expect(ctx.status).toBe(204)
  })

  it('DELETE returns 404 when no mount matches', async () => {
    const ctx = makeCtx({ params: { path: 'file.txt' } })
    ctx.state.webdavMounts = [{ mount: '/other', adapter: createAdapter() }]

    await deleteHandler()(ctx)
    expect(ctx.status).toBe(404)
  })

  it('MKCOL returns 405 if exists', async () => {
    const adapter = createAdapter({
      stat: vi.fn().mockResolvedValue({ exists: true, isDirectory: true })
    })
    const ctx = makeCtx({ params: { path: 'dir' } })
    ctx.state.webdavMounts = [{ mount: '/', adapter }]

    await mkcolHandler()(ctx)
    expect(ctx.status).toBe(405)
  })

  it('MKCOL creates directory', async () => {
    const adapter = createAdapter({
      stat: vi.fn().mockResolvedValue({ exists: false, isDirectory: false })
    })
    const ctx = makeCtx({ params: { path: 'dir' } })
    ctx.state.webdavMounts = [{ mount: '/', adapter }]

    await mkcolHandler()(ctx)
    expect(adapter.mkdir).toHaveBeenCalled()
    expect(ctx.status).toBe(201)
  })

  it('MOVE rejects cross-mount', async () => {
    const adapterA = createAdapter()
    const adapterB = createAdapter()
    const ctx = makeCtx({
      params: { path: 'a.txt' },
      get: (key: string) => (key === 'Destination' ? '/webdav/b.txt' : '')
    })
    ctx.state.webdavMounts = [
      { mount: '/a', adapter: adapterA },
      { mount: '/b', adapter: adapterB }
    ]

    await moveHandler()(ctx)
    expect(ctx.status).toBe(409)
  })

  it('MOVE returns 400 when Destination missing', async () => {
    const ctx = makeCtx({ params: { path: 'a.txt' } })
    ctx.state.webdavMounts = [{ mount: '/', adapter: createAdapter() }]

    await moveHandler()(ctx)
    expect(ctx.status).toBe(400)
  })

  it('MOVE succeeds within same mount', async () => {
    const adapter = createAdapter()
    const ctx = makeCtx({
      params: { path: 'a.txt' },
      get: (key: string) => (key === 'Destination' ? '/webdav/a2.txt' : '')
    })
    ctx.state.webdavMounts = [{ mount: '/', adapter }]

    await moveHandler()(ctx)
    expect(adapter.move).toHaveBeenCalled()
    expect(ctx.status).toBe(201)
  })

  it('COPY rejects cross-mount', async () => {
    const adapterA = createAdapter()
    const adapterB = createAdapter()
    const ctx = makeCtx({
      params: { path: 'a.txt' },
      get: (key: string) => (key === 'Destination' ? '/webdav/b.txt' : '')
    })
    ctx.state.webdavMounts = [
      { mount: '/a', adapter: adapterA },
      { mount: '/b', adapter: adapterB }
    ]

    await copyHandler()(ctx)
    expect(ctx.status).toBe(409)
  })

  it('COPY returns 400 when Destination missing', async () => {
    const ctx = makeCtx({ params: { path: 'a.txt' } })
    ctx.state.webdavMounts = [{ mount: '/', adapter: createAdapter() }]

    await copyHandler()(ctx)
    expect(ctx.status).toBe(400)
  })

  it('COPY succeeds within same mount', async () => {
    const adapter = createAdapter()
    const ctx = makeCtx({
      params: { path: 'a.txt' },
      get: (key: string) => (key === 'Destination' ? '/webdav/a2.txt' : '')
    })
    ctx.state.webdavMounts = [{ mount: '/', adapter }]

    await copyHandler()(ctx)
    expect(adapter.copy).toHaveBeenCalled()
    expect(ctx.status).toBe(201)
  })
})
