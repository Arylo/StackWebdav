import { describe, it, expect } from 'vitest'
import isMatchPath, { MatchPathResult } from './isMatchPath'

// Mock baseMatchPath for isolated testing if needed
// import * as baseMatchPathModule from './baseMatchPath'

describe('isMatchPath', () => {
  it('should return MATCH when mountPath and targetPath are the same', () => {
    // Assuming baseMatchPath returns MatchPathResult.MATCH for equal paths
    expect(isMatchPath('/foo', '/foo')).toBe(MatchPathResult.MATCH)
  })

  it('should return UNDER when targetPath is under mountPath', () => {
    // e.g. /foo is the mount, /foo/bar is under
    expect(isMatchPath('/foo', '/foo/bar')).toBe(MatchPathResult.UNDER)
  })

  it('should return IN when mountPath is under targetPath', () => {
    // e.g. /foo/bar is the mount, /foo is the target
    expect(isMatchPath('/foo/bar', '/foo')).toBe(MatchPathResult.IN)
  })

  it('should return false when paths do not match', () => {
    expect(isMatchPath('/foo', '/bar')).toBe(false)
  })

  it('should handle trailing slashes correctly', () => {
    expect(isMatchPath('/foo/', '/foo')).toBe(MatchPathResult.MATCH)
    expect(isMatchPath('/foo', '/foo/')).toBe(MatchPathResult.MATCH)
    expect(isMatchPath('/foo/', '/foo/bar')).toBe(MatchPathResult.UNDER)
  })

  it('should handle root path correctly', () => {
    expect(isMatchPath('/', '/')).toBe(MatchPathResult.MATCH)
    expect(isMatchPath('/', '/foo')).toBe(MatchPathResult.UNDER)
    expect(isMatchPath('/foo', '/')).toBe(MatchPathResult.IN)
  })

  it('should be case sensitive', () => {
    expect(isMatchPath('/Foo', '/foo')).toBe(false)
  })
})
