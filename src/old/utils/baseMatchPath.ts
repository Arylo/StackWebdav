import splitPath from "./splitPath"

export enum MatchPathResult {
  /**
   * the target path under the mount path
   * - mount path: /files
   * - target path: /files/content.txt
   */
  UNDER = 'UNDER',
  /**
   * mount path in the target path
   * - mount path: /files/mount
   * - target path: /files
   */
  IN = 'IN',
  /**
   * - mount path: /files/mount
   * - target path: /files/mount
   */
  MATCH = 'MATCH',
  /**
   * - mount path: /files/mount
   * - target path: /files/none
   */
  NOT = 'NOT',
}

interface IsMatchPathOptions<U, M, I, N> {
  [MatchPathResult.UNDER]: (options: { index: number, mountPaths: string[], targetPaths: string[] }) => U,
  [MatchPathResult.MATCH]: (options: { index: number, mountPaths: string[], targetPaths: string[] }) => M,
  [MatchPathResult.IN]: (options: { index: number, mountPaths: string[], targetPaths: string[] }) => I,
  [MatchPathResult.NOT]: (options: { index: number, mountPaths: string[], targetPaths: string[] }) => N,
}

export default function baseMatchPath<U = unknown, M = unknown, I = unknown, N = unknown>(mountPath: string, targetPath: string, options: IsMatchPathOptions<U, M, I, N>) {
  const mountPaths = splitPath(mountPath)
  const targetPaths = splitPath(targetPath)
  let result = MatchPathResult.MATCH
  let i = 0
  for (; i < Math.max(mountPaths.length, targetPaths.length); i++) {
    const [a, b] = [mountPaths[i], targetPaths[i]]
    if (a === undefined) {
      result = MatchPathResult.UNDER
      break
    }
    if (b === undefined) {
      result = MatchPathResult.IN
      break
    }
    if (a !== b) {
      result = MatchPathResult.NOT
      break
    }
  }
  return options[result]({
    index: i,
    mountPaths,
    targetPaths,
  })
}
