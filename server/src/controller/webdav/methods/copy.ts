import type { Context } from 'koa'
import { getMounts } from '../getMounts'
import { findMount, getDestinationPath, getRequestSubpath, normalizeDestinationForMount, toAdapterPath } from '../utils'

async function copyBetweenAdapters(
  srcAdapter: any,
  srcPath: string,
  destAdapter: any,
  destPath: string
) {
  const stat = await srcAdapter.stat(srcPath)
  if (!stat.exists) return

  if (stat.isDirectory) {
    await destAdapter.mkdir(destPath)
    const items = await srcAdapter.list(srcPath)
    for (const item of items) {
      const parts = item.path.split(/[/\\]+/).filter(Boolean)
      const name = parts[parts.length - 1] || ''
      await copyBetweenAdapters(
        srcAdapter,
        item.path,
        destAdapter,
        `${destPath.replace(/\/$/, '')}/${name}`
      )
    }
    return
  }

  const data = await srcAdapter.read(srcPath)
  await destAdapter.write(destPath, data)
}

export function copyHandler() {
  return async (ctx: Context) => {
    const mounts = await getMounts(ctx)
    const dest = getDestinationPath(ctx)
    if (!dest) {
      ctx.status = 400
      ctx.body = { message: 'Missing Destination header' }
      return
    }

    const srcWebdav = getRequestSubpath(ctx)
    const srcMatch = findMount(mounts, srcWebdav)
    const destNormalized = normalizeDestinationForMount(ctx, dest)
    const destMatch = findMount(mounts, destNormalized)
    if (!srcMatch || !destMatch) {
      ctx.status = 409
      ctx.body = { message: 'COPY requires valid source and destination mounts' }
      return
    }

    const srcPath = toAdapterPath(srcMatch.subPath)
    const destPath = toAdapterPath(destMatch.subPath)

    if (srcMatch.adapter === destMatch.adapter) {
      await srcMatch.adapter.copy(srcPath, destPath)
    } else {
      await copyBetweenAdapters(srcMatch.adapter, srcPath, destMatch.adapter, destPath)
    }
    ctx.status = 201
  }
}
