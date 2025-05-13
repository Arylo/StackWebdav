import { expect, test } from 'vitest'
import type { Test } from 'supertest'

export const webdavTest = (st: Test) => {
  test('should include common headers', async () => {
    const res = await st.then((res) => res)
    expect(res.get('DAV')).toBe('1,2')
    expect(res.get('Server')).toEqual(expect.stringMatching(/stack-webdav\/\d+\.\d+\.\d+/))
    expect(res.get('Allow')?.split(',').filter(Boolean)).toContain(res.request.method)
  })
}
