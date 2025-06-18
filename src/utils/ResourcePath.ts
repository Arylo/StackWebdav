import path from "path"
import baseMatchPath, { MatchPathResult } from "./baseMatchPath"
import splitPath from "./splitPath"

export class ResourcePath {
  private path: string
  constructor (resourcePath: string) {
    this.path = resourcePath
  }
  public toRaw () {
    return decodeURIComponent(this.path)
  }
  public split () {
    return splitPath(this.toRaw())
  }
  public relative (fromPath: string) {
    const p = baseMatchPath(fromPath, this.toRaw(), {
      [MatchPathResult.MATCH]: () => '/',
      [MatchPathResult.UNDER]: ({ index, targetPaths }) => targetPaths.slice(index).join('/'),
      [MatchPathResult.NOT]: () => undefined,
      [MatchPathResult.IN]: () => undefined,
    })
    return typeof p === 'string' ? resourcePath(encodeURIComponent(p)) : p
  }
  public join (toPath: string) {
    return resourcePath(path.join(this.toRaw(), toPath))
  }
}

export default function resourcePath (p: string) {
  return new ResourcePath(p)
}
