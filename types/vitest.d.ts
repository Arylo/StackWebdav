import fs from 'fs'
import 'vitest'

interface CustomMatchers<R = unknown> {
  toBeFsExist: () => R,
  toBeFileExist: () => R,
  toBeFolderExist: () => R,
  toBeFileContent: (content: string, encoding?: fs.EncodingOption) => R,
}

declare module 'vitest' {
  interface Matchers<T = any> extends CustomMatchers<T> {}
}
