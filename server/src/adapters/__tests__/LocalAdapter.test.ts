import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, rm } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { LocalAdapter } from '../LocalAdapter'

describe('LocalAdapter', () => {
  let root: string
  let adapter: LocalAdapter

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'stackwebdav-local-'))
    adapter = new LocalAdapter({ root })
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  it('write/read roundtrip', async () => {
    const data = new Uint8Array([1, 2, 3])
    await adapter.write('a/b.txt', data)
    const read = await adapter.read('a/b.txt')
    expect(Array.from(read)).toEqual([1, 2, 3])
  })

  it('list returns entries', async () => {
    await adapter.write('dir/file.txt', new Uint8Array([9]))
    const items = await adapter.list('dir')
    expect(items.length).toBe(1)
    expect(items[0].path).toContain('dir')
  })

  it('stat returns exists false for missing', async () => {
    const stat = await adapter.stat('missing.txt')
    expect(stat.exists).toBe(false)
  })

  it('mkdir creates directory', async () => {
    await adapter.mkdir('newdir')
    const stat = await adapter.stat('newdir')
    expect(stat.exists).toBe(true)
    expect(stat.isDirectory).toBe(true)
  })

  it('delete removes files and folders', async () => {
    await adapter.write('to/remove.txt', new Uint8Array([1]))
    await adapter.delete('to')
    const stat = await adapter.stat('to/remove.txt')
    expect(stat.exists).toBe(false)
  })

  it('move renames file', async () => {
    await adapter.write('src.txt', new Uint8Array([5]))
    await adapter.move('src.txt', 'dest.txt')
    const statOld = await adapter.stat('src.txt')
    const statNew = await adapter.stat('dest.txt')
    expect(statOld.exists).toBe(false)
    expect(statNew.exists).toBe(true)
  })

  it('copy duplicates file', async () => {
    await adapter.write('src.txt', new Uint8Array([7]))
    await adapter.copy('src.txt', 'copy.txt')
    const buf = await adapter.read('copy.txt')
    expect(Array.from(buf)).toEqual([7])
  })

  it('resolve treats absolute-like path as root-relative', async () => {
    await adapter.write('abs.txt', new Uint8Array([4]))
    const data = await adapter.read('/abs.txt')
    expect(Array.from(data)).toEqual([4])
  })
})
