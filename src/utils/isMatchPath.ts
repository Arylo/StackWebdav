import baseMatchPath, { MatchPathResult } from "./baseMatchPath"
export { MatchPathResult } from './baseMatchPath'

const options = {
  [MatchPathResult.UNDER]: () => MatchPathResult.UNDER,
  [MatchPathResult.MATCH]: () => MatchPathResult.MATCH,
  [MatchPathResult.IN]: () => MatchPathResult.IN,
  [MatchPathResult.NOT]: () => false,
}

export default function isMatchPath (mountPath: string, targetPath: string) {
  return baseMatchPath(mountPath, targetPath, options)
}
