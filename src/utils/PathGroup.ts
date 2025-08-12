import lodash from 'lodash'
import {
  match as pathMatch,
  compile as pathCompile
} from 'path-to-regexp'
import { match, P } from 'ts-pattern'

const splatPath = (p: string) => {
  const fn = pathMatch('/*splat')
  const result = fn(p) as any
  return result.params.splat as string[]
}

const parsePath = (paths: string[]) => {
  const fn = pathCompile('/*segment')
  return fn({ segment: paths })
}

type PathGroupLike = PathGroup | string[] | string

type NextFunction = (matchObj: NextFunctionMatchObject) => any
type NextFunctionMatchObject = {
  allMatch: boolean,
  anyMatch: boolean,
  matchGroup: string[],
  nextResourcePathGroup?: PathGroup,
}

export default class PathGroup {
  private paths: string[]
  constructor (resourcePath: string | string[]) {
    this.paths = Array.isArray(resourcePath) ? resourcePath : splatPath(resourcePath)
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

  public prepend (prependResourcePathGroup: PathGroupLike) {
    const pendResourcePathGroup = this.parseResourcePathGroup(prependResourcePathGroup)
    return new PathGroup(pendResourcePathGroup.toGroup().concat(this.toGroup()))
  }
  public append (appendResourcePathGroup: PathGroupLike) {
    const pendResourcePathGroup = this.parseResourcePathGroup(appendResourcePathGroup)
    return new PathGroup(this.toGroup().concat(pendResourcePathGroup.toGroup()))
  }

  public matches (resourcePathGroup: PathGroupLike) {
    const prefixResourcePathGroup = this.parseResourcePathGroup(resourcePathGroup)
    let [anyMatch, allMatch] = [true, true]
    let matchGroup: string[] = []
    if (prefixResourcePathGroup.length !== 0) {
      const [targetGroup, sourceGroup] = [lodash.take(this.toGroup(), prefixResourcePathGroup.length), prefixResourcePathGroup.toGroup()]
      allMatch = lodash.isEqual(targetGroup, sourceGroup)
      anyMatch = allMatch || targetGroup[0] === sourceGroup[0]

      if (allMatch) {
        matchGroup = prefixResourcePathGroup.toGroup()
      } else if (anyMatch) {
        const [targetGroup, sourceGroup] = [this.toGroup(), prefixResourcePathGroup.toGroup()]
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
  public next<F extends NextFunction> (resourcePathGroup: PathGroupLike, fn: F) {
    const prefixResourcePathGroup = this.parseResourcePathGroup(resourcePathGroup)
    const {
      allMatch,
      anyMatch,
      matchGroup,
    } = this.matches(prefixResourcePathGroup)
    return fn({
      allMatch,
      anyMatch,
      matchGroup,
      nextResourcePathGroup: allMatch ? new PathGroup(lodash.drop(prefixResourcePathGroup.toGroup(), matchGroup.length)) : undefined
    })
  }
  private parseResourcePathGroup (resourcePathGroup: PathGroupLike) {
    return match(resourcePathGroup)
      .returnType<PathGroup>()
      .with(P.array(P.string), (resourcePathGroup) => new PathGroup(resourcePathGroup))
      .with(P.string, (resourcePathGroup) => new PathGroup(resourcePathGroup))
      .otherwise(() => resourcePathGroup as PathGroup)
  }
}
