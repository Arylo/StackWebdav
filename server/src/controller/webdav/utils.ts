import type { Context } from 'koa'
import type { StatEntry } from '../../adapters/StorageAdapter'
import type { WebdavMount } from './types'

export function normalizeWebdavPath(rawPath: string | undefined) {
  const p = rawPath ? `/${rawPath}` : '/'
  return decodeURIComponent(p)
}

export function getRequestSubpath(ctx: Context) {
  const raw = (ctx.state?.webdavSubpath as string | undefined) ?? ctx.params?.path
  return normalizeWebdavPath(raw)
}

export function getRequestSubpathRaw(ctx: Context) {
  return (ctx.state?.webdavSubpath as string | undefined) ?? (ctx.params?.path ? `/${ctx.params.path}` : '/')
}

export function toAdapterPath(webdavPath: string) {
  if (webdavPath === '/' || webdavPath === '') return '.'
  return webdavPath.replace(/^\/+/, '')
}

export function normalizeMountPath(mount: string) {
  if (!mount) return '/'
  const p = mount.startsWith('/') ? mount : `/${mount}`
  return p.replace(/\/$/, '') || '/'
}

export function findMount(mounts: WebdavMount[], path: string) {
  const sorted = [...mounts].sort((a, b) => normalizeMountPath(b.mount).length - normalizeMountPath(a.mount).length)
  for (const m of sorted) {
    const mp = normalizeMountPath(m.mount)
    if (mp === '/') {
      return { mountPath: mp, adapter: m.adapter, subPath: path }
    }
    if (path === mp || path.startsWith(`${mp}/`)) {
      const sub = path.slice(mp.length) || '/'
      return { mountPath: mp, adapter: m.adapter, subPath: sub }
    }
  }
  return null
}

function splitSegments(p: string) {
  return p.split('/').filter(Boolean)
}

export function getVirtualChildren(mounts: WebdavMount[], requestPath: string) {
  const reqSegs = splitSegments(requestPath)
  const children = new Set<string>()
  for (const m of mounts) {
    const mp = normalizeMountPath(m.mount)
    const mountSegs = splitSegments(mp)
    if (reqSegs.length >= mountSegs.length) continue
    let isPrefix = true
    for (let i = 0; i < reqSegs.length; i += 1) {
      if (reqSegs[i] !== mountSegs[i]) {
        isPrefix = false
        break
      }
    }
    if (!isPrefix) continue
    const next = mountSegs[reqSegs.length]
    if (next) children.add(next)
  }
  return Array.from(children)
}

export async function readRequestBody(req: any): Promise<Uint8Array> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return new Uint8Array(Buffer.concat(chunks))
}

export function xmlEscape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function buildPropfindResponse(baseHref: string, stat: StatEntry, children: { href: string; isDirectory: boolean }[]) {
  const responseItems = [{ href: baseHref, isDirectory: stat.isDirectory }, ...children]

  const responseXml = responseItems
    .map((item) => {
      return [
        '<d:response>',
        `<d:href>${xmlEscape(item.href)}</d:href>`,
        '<d:propstat>',
        '<d:prop>',
        '<d:resourcetype>',
        item.isDirectory ? '<d:collection />' : '',
        '</d:resourcetype>',
        '</d:prop>',
        '<d:status>HTTP/1.1 200 OK</d:status>',
        '</d:propstat>',
        '</d:response>'
      ].join('')
    })
    .join('')

  return `<?xml version="1.0" encoding="utf-8"?>` +
    `<d:multistatus xmlns:d="DAV:">${responseXml}</d:multistatus>`
}

export function getDestinationPath(ctx: Context) {
  const destHeader = ctx.get('Destination')
  if (!destHeader) return null
  try {
    const url = new URL(destHeader)
    return decodeURIComponent(url.pathname)
  } catch {
    return decodeURIComponent(destHeader)
  }
}

export function normalizeDestinationForMount(ctx: Context, destPath: string) {
  const srcWebdavRaw = getRequestSubpathRaw(ctx)
  const basePrefix = ctx.path.slice(0, Math.max(0, ctx.path.length - srcWebdavRaw.length))
  let normalized = destPath
  if (normalized.startsWith(basePrefix)) {
    normalized = normalized.slice(basePrefix.length)
  }
  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`
  }
  return normalized
}
