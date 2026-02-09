import lodash from 'lodash'
import {
  match as pathMatch,
  compile as pathCompile
} from 'path-to-regexp'
import { match, P } from 'ts-pattern'

const splitPath = (p: string) => {
  const fn = pathMatch('/*splat')
  const result = fn(p) as any
  const paths: string[] = result.params?.splat ?? []
  return paths.filter((p) => p.length > 0)
}

const parsePath = (paths: string[]) => {
  const fn = pathCompile('/*segment')
  return fn({ segment: paths })
}

export type PathGroupLike = PathGroup | string[] | string

type NextFunction<V = any> = (matchObj: NextFunctionMatchObject) => V
type NextFunctionMatchObject = {
  allMatch: boolean,
  anyMatch: boolean,
  matchGroup: string[],
  nextPathGroup?: PathGroup,
}

export class PathGroup {
  private paths: string[]
  constructor (resourcePath: string | string[]) {
    this.paths = match(resourcePath)
      .returnType<string[]>()
      .with(P.array(P.string), (v) => v)
      .with(P.string.startsWith('/'), (v) => splitPath(v))
      .otherwise((v) => splitPath(`/${v}`))
  }
  public toGroup () {
    return this.paths
  }
  public toString () {
    return parsePath(this.paths)
  }
  public [Symbol.toStringTag] () {
    return this.toString()
  }
  public get length () {
    return this.toGroup().length
  }

  public prepend (prependPathGroup: PathGroupLike) {
    const pendingPathGroup = this.parsePathGroup(prependPathGroup)
    return new PathGroup(pendingPathGroup.toGroup().concat(this.toGroup()))
  }
  public append (appendPathGroup: PathGroupLike) {
    const pendingPathGroup = this.parsePathGroup(appendPathGroup)
    return new PathGroup(this.toGroup().concat(pendingPathGroup.toGroup()))
  }

  public matches (pathGroup: PathGroupLike) {
    const prefixPathGroup = this.parsePathGroup(pathGroup)
    let [anyMatch, allMatch] = [true, true]
    let matchGroup: string[] = []
    if (prefixPathGroup.length !== 0) {
      const [targetGroup, sourceGroup] = [lodash.take(this.toGroup(), prefixPathGroup.length), prefixPathGroup.toGroup()]
      allMatch = lodash.isEqual(targetGroup, sourceGroup)
      anyMatch = allMatch || targetGroup[0] === sourceGroup[0]

      if (allMatch) {
        matchGroup = prefixPathGroup.toGroup()
      } else if (anyMatch) {
        const [targetGroup, sourceGroup] = [this.toGroup(), prefixPathGroup.toGroup()]
        for (const index in sourceGroup) {
          if (sourceGroup[index] === targetGroup[index]) {
            matchGroup.push(sourceGroup[index])
          } else {
            break
          }
        }
      }
    }

    return {
      anyMatch,
      allMatch,
      matchGroup,
    }
  }
  public next<V = any>(pathGroup: PathGroupLike, fn: NextFunction<V>) {
    const prefixPathGroup = this.parsePathGroup(pathGroup)
    const {
      allMatch,
      anyMatch,
      matchGroup,
    } = this.matches(prefixPathGroup)
    return fn({
      allMatch,
      anyMatch,
      matchGroup,
      nextPathGroup: allMatch ? new PathGroup(lodash.drop(this.toGroup(), matchGroup.length)) : undefined
    })
  }
  private parsePathGroup (pathGroup: PathGroupLike) {
    return match(pathGroup)
      .returnType<PathGroup>()
      .with(P.array(P.string), (pathGroup) => new PathGroup(pathGroup))
      .with(P.string, (pathGroup) => new PathGroup(pathGroup))
      .otherwise(() => pathGroup as PathGroup)
  }
}

export default function genPathGroup (p: string | string[]) {
  return new PathGroup(p)
}
