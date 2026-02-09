import type { Context } from 'koa'
import { promises as fs } from 'fs'
import { resolve } from 'path'
import { parse as parseToml } from '@iarna/toml'
import { LocalAdapter } from '../../adapters/LocalAdapter'
import { WebdavAdapter } from '../../adapters/WebdavAdapter'
import { AzureBlobAdapter } from '../../adapters/AzureBlobAdapter'
import { S3Adapter } from '../../adapters/S3Adapter'
import type { WebdavMount } from './types'

export type AdapterType = 'local' | 'azure' | 's3' | 'webdav'

export type AdapterConfig = {
  mount: string
  type: AdapterType
  options?: Record<string, unknown>
}

// 当前已加载的 adapters（由 config.toml 加载）
export let StorageAdapters: WebdavMount[] = []

function createAdapter(config: AdapterConfig) {
  switch (config.type) {
    case 'local':
      return new LocalAdapter(config.options as any)
    case 'webdav':
      return new WebdavAdapter(config.options as any)
    case 'azure':
      return new AzureBlobAdapter(config.options as any)
    case 's3':
      return new S3Adapter(config.options) as any
    default:
      throw new Error('Unknown adapter type')
  }
}

export function buildWebdavMounts(configs: AdapterConfig[]): WebdavMount[] {
  return configs.map((cfg) => ({ mount: cfg.mount, adapter: createAdapter(cfg) }))
}

export function webdavMountsMiddleware() {
  return async (ctx: Context, next: () => Promise<unknown>) => {
    ctx.state.webdavMounts = StorageAdapters
    await next()
  }
}

export async function loadWebdavConfig(filePath = resolve(process.cwd(), 'config.toml')) {
  const content = await fs.readFile(filePath, 'utf-8')
  const data = parseToml(content) as { adapters?: AdapterConfig[] }
  const configs = Array.isArray(data.adapters) ? data.adapters : []
  StorageAdapters = buildWebdavMounts(configs)
}
