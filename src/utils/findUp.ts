import fs from 'fs'
import path from 'path'
import lodash from 'lodash'

export function findUp (targets: string | string[], options: { cwd: string }): string | undefined {
  const currentPath = options.cwd
  if (currentPath === '/') return
  const paths = lodash.castArray(targets)
    .map((target) => path.resolve(currentPath, target))
  return paths.every((p) => fs.existsSync(p)) ? currentPath : findUp(targets, { cwd: path.resolve(currentPath, '..') })
}

export default findUp
