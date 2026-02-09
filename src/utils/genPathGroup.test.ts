import { describe, expect, test } from "vitest";
import genPathGroup from "./genPathGroup";

describe(genPathGroup.name, () => {
  const defaultPaths = ['foo', 'bar']
  const defaultPath = `/${defaultPaths.join('/')}`
  const pathGroup = genPathGroup(defaultPath)

  test(`Method [${pathGroup.toString.name}]`, () => {
    expect(pathGroup.toString()).toBe(defaultPath)
  })
  test(`Method [${pathGroup.toGroup.name}]`, () => {
    expect(pathGroup.toGroup()).toStrictEqual(defaultPaths)
  })
  test('Property [length]', () => {
    expect(pathGroup.length).toBe(2)
  })
  describe(`Method [${pathGroup.prepend.name}]`, () => {
    test('with string', () => {
      expect(pathGroup.prepend('/faker'))
        .toStrictEqual(genPathGroup(`/faker${defaultPath}`))
    })
    test('with array', () => {
      expect(pathGroup.prepend(['faker', 'array']))
        .toStrictEqual(genPathGroup(`/faker/array${defaultPath}`))
    })
    test('with PathGroup', () => {
      expect(pathGroup.prepend(genPathGroup('/path')))
        .toStrictEqual(genPathGroup(`/path${defaultPath}`))
    })
  })
  describe(`Method [${pathGroup.append.name}]`, () => {
    test('with string', () => {
      expect(pathGroup.append('/faker'))
        .toStrictEqual(genPathGroup(`${defaultPath}/faker`))
    })
    test('with array', () => {
      expect(pathGroup.append(['faker', 'array']))
        .toStrictEqual(genPathGroup(`${defaultPath}/faker/array`))
    })
    test('with PathGroup', () => {
      expect(pathGroup.append(genPathGroup('/path')))
        .toStrictEqual(genPathGroup(`${defaultPath}/path`))
    })
  })
  describe(`Method [${pathGroup.next.name}]`, () => {
    describe('with string', () => {
      test('all match', () => {
        pathGroup.next('/foo', ({ allMatch, anyMatch, matchGroup, nextPathGroup }) => {
          expect(allMatch).toBeTruthy()
          expect(anyMatch).toBeTruthy()
          expect(matchGroup).toStrictEqual(['foo'])
          expect(nextPathGroup).toStrictEqual(genPathGroup('/bar'))
        })
        pathGroup.next('/', ({ allMatch, anyMatch, matchGroup, nextPathGroup }) => {
          expect(allMatch).toBeTruthy()
          expect(anyMatch).toBeTruthy()
          expect(matchGroup).toStrictEqual([])
          expect(nextPathGroup).toStrictEqual(genPathGroup('/foo/bar'))
        })
      })
      test('any match', () => {
        pathGroup.next('/foo/bar/match', ({ allMatch, anyMatch, matchGroup, nextPathGroup }) => {
          expect(allMatch).toBeFalsy()
          expect(anyMatch).toBeTruthy()
          expect(matchGroup).toStrictEqual(['foo', 'bar'])
          expect(nextPathGroup).toBeUndefined()
        })
      })
      test('no match', () => {
        pathGroup.next('/foz/baz', ({ allMatch, anyMatch, matchGroup, nextPathGroup }) => {
          expect(allMatch).toBeFalsy()
          expect(anyMatch).toBeFalsy()
          expect(matchGroup).toStrictEqual([])
          expect(nextPathGroup).toBeUndefined()
        })
      })
    })
    describe('with array', () => {
      test('all match', () => {
        pathGroup.next(['foo'], ({ allMatch, anyMatch, matchGroup, nextPathGroup }) => {
          expect(allMatch).toBeTruthy()
          expect(anyMatch).toBeTruthy()
          expect(matchGroup).toStrictEqual(['foo'])
          expect(nextPathGroup).toStrictEqual(genPathGroup('/bar'))
        })
        pathGroup.next([], ({ allMatch, anyMatch, matchGroup, nextPathGroup }) => {
          expect(allMatch).toBeTruthy()
          expect(anyMatch).toBeTruthy()
          expect(matchGroup).toStrictEqual([])
          expect(nextPathGroup).toStrictEqual(genPathGroup('/foo/bar'))
        })
      })
      test('any match', () => {
        pathGroup.next(['foo', 'bar', 'match'], ({ allMatch, anyMatch, matchGroup, nextPathGroup }) => {
          expect(allMatch).toBeFalsy()
          expect(anyMatch).toBeTruthy()
          expect(matchGroup).toStrictEqual(['foo', 'bar'])
          expect(nextPathGroup).toBeUndefined()
        })
      })
      test('no match', () => {
        pathGroup.next(['foz', 'baz'], ({ allMatch, anyMatch, matchGroup, nextPathGroup }) => {
          expect(allMatch).toBeFalsy()
          expect(anyMatch).toBeFalsy()
          expect(matchGroup).toStrictEqual([])
          expect(nextPathGroup).toBeUndefined()
        })
      })
    })
    describe('with PathGroup', () => {
      test('all match', () => {
        pathGroup.next(genPathGroup('/foo'), ({ allMatch, anyMatch, matchGroup, nextPathGroup }) => {
          expect(allMatch).toBeTruthy()
          expect(anyMatch).toBeTruthy()
          expect(matchGroup).toStrictEqual(['foo'])
          expect(nextPathGroup).toStrictEqual(genPathGroup('/bar'))
        })
        pathGroup.next(genPathGroup('/'), ({ allMatch, anyMatch, matchGroup, nextPathGroup }) => {
          expect(allMatch).toBeTruthy()
          expect(anyMatch).toBeTruthy()
          expect(matchGroup).toStrictEqual([])
          expect(nextPathGroup).toStrictEqual(genPathGroup('/foo/bar'))
        })
      })
      test('any match', () => {
        pathGroup.next(genPathGroup('/foo/bar/match'), ({ allMatch, anyMatch, matchGroup, nextPathGroup }) => {
          expect(allMatch).toBeFalsy()
          expect(anyMatch).toBeTruthy()
          expect(matchGroup).toStrictEqual(['foo', 'bar'])
          expect(nextPathGroup).toBeUndefined()
        })
      })
      test('no match', () => {
        pathGroup.next(genPathGroup('/foz/baz'), ({ allMatch, anyMatch, matchGroup, nextPathGroup }) => {
          expect(allMatch).toBeFalsy()
          expect(anyMatch).toBeFalsy()
          expect(matchGroup).toStrictEqual([])
          expect(nextPathGroup).toBeUndefined()
        })
      })
    })
  })
})
