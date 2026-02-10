import type { Context } from 'koa'
import { getMounts } from '../getMounts'
import {
  buildPropfindResponse,
  findMount,
  getRequestSubpath,
  getVirtualChildren,
  toAdapterPath
} from '../utils'

export function propfindHandler() {
  return async (ctx: Context) => {
    const mounts = await getMounts(ctx)
    const webdavPath = getRequestSubpath(ctx)
    const depth = ctx.get('Depth') || '1'
    const base = ctx.path.replace(/\/$/, '')

    const match = findMount(mounts, webdavPath)
    const children: { href: string; isDirectory: boolean }[] = []

    if (match) {
      const adapterPath = toAdapterPath(match.subPath)
      const stat = await match.adapter.stat(adapterPath)

      if (!stat.exists) {
        ctx.status = 404
        return
      }

      if (stat.isDirectory && depth !== '0') {
        const entries = await match.adapter.list(adapterPath)
        for (const entry of entries) {
          const parts = entry.path.split(/[/\\]+/).filter(Boolean)
          const name = parts[parts.length - 1] || ''
          const href = `${base}/${encodeURIComponent(name)}`
          children.push({ href, isDirectory: entry.isDirectory })
        }
      }

      const virtual = getVirtualChildren(mounts, webdavPath)
      for (const name of virtual) {
        const href = `${base}/${encodeURIComponent(name)}`
        children.push({ href, isDirectory: true })
      }

      const body = buildPropfindResponse(ctx.path, stat, depth === '0' ? [] : children)
      ctx.status = 207
      ctx.set('Content-Type', 'application/xml; charset=utf-8')
      ctx.body = body
      return
    }

    const virtual = getVirtualChildren(mounts, webdavPath)
    if (virtual.length > 0) {
      for (const name of virtual) {
        const href = `${base}/${encodeURIComponent(name)}`
        children.push({ href, isDirectory: true })
      }
      const body = buildPropfindResponse(ctx.path, { exists: true, isDirectory: true }, depth === '0' ? [] : children)
      ctx.status = 207
      ctx.set('Content-Type', 'application/xml; charset=utf-8')
      ctx.body = body
      return
    }

    ctx.status = 404
  }
}
