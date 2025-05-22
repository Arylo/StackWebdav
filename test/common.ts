import { expect, test } from 'vitest'
import type { Test } from 'supertest'

export const testWebdavCommon = (st: Test) => {
  test('should include the WebDav versions header', async () => {
    const res = await st.then((res) => res)
    expect(res.get('DAV')).toBe('1,2')
  })
  test('should include the server info header', async () => {
    const res = await st.then((res) => res)
    expect(res.get('Server')).toEqual(expect.stringMatching(/stack-webdav\/\d+\.\d+\.\d+/))
  })
  test('should the current method include the allowed header', async () => {
    const res = await st.then((res) => res)
    expect(res.get('Allow')?.split(',')).length.greaterThan(0)
    expect(res.get('Allow')?.split(',').filter(Boolean)).toContain(res.request.method)
  })
}

export const testWebdavCommonResult = (st: Test) => {
  test('should content-type is application/xml', async () => {
    const res = await st.then((res) => res)
    expect(res.get('Content-Type')).toBe('application/xml')
  })
}
