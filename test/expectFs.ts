import fs from 'fs'
import { expect } from "vitest"
import '../types/vitest.d'

const getStatType = (p: string) => {
  const stat = fs.statSync(p)
  switch (true) {
    case stat.isFile(): return 'file'
    case stat.isDirectory(): return 'folder'
    case stat.isSymbolicLink(): return 'link'
    case stat.isSocket(): return 'socket'
  }
  return 'unknown'
}

expect.extend({
  toBeFsExist(received: string) {
    if (typeof received !== 'string') {
      return {
        pass: false,
        message: () => `Target ${received} must be a string value`,
        actual: typeof received,
        expected: 'string',
      }
    }
    const { isNot } = this
    const result = fs.existsSync(received)
    return {
      pass: result,
      message: () => `Path ${received} is${isNot ? ' not' : ''} exist`,
    }
  },
  toBeFileExist(received: string) {
    if (typeof received !== 'string') {
      return {
        pass: false,
        message: () => `Target ${received} must be a string value`,
        actual: typeof received,
        expected: 'string',
      }
    }
    const { isNot } = this
    const isExist = fs.existsSync(received)
    const result = isExist && fs.statSync(received).isFile()
    return {
      pass: result,
      message: () => `Path ${received} is${isNot ? '' : ' not'} file`,
      actual: !isExist ? 'unknown' : getStatType(received),
      expected: 'file',
    }
  },
  toBeFolderExist(received: string) {
    if (typeof received !== 'string') {
      return {
        pass: false,
        message: () => `Target ${received} must be a string value`,
        actual: typeof received,
        expected: 'string',
      }
    }
    const { isNot } = this
    const isExist = fs.existsSync(received)
    const result = isExist && fs.statSync(received).isDirectory()
    return {
      pass: result,
      message: () => `Path ${received} is${isNot ? '' : ' not'} folder`,
      actual: !isExist ? 'unknown' : getStatType(received),
      expected: 'folder',
    }
  },
  toBeFileContent(received: string, content, encoding = 'utf-8') {
    if (typeof received !== 'string') {
      return {
        pass: false,
        message: () => `Target ${received} must be a string value`,
        actual: typeof received,
        expected: 'string',
      }
    }
    const { isNot } = this
    const raw = fs.readFileSync(received, encoding)
    const result = raw === content
    return {
      pass: result,
      message: () => `Path ${received} is${isNot ? '' : ' not'} folder`,
      actual: raw,
      expected: content,
    }
  },
})
