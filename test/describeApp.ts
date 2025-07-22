import http from 'http'
import { AddressInfo } from 'net'
import { afterAll, describe } from 'vitest'
import { addStorage, withStorages } from '../src/storage/utils'
import Storage from '../src/storage/Storage'
import app from '../src/app'

export const describeApp = (
  name: string,
  cb: (address: string) => unknown,
  { storages = [] as Storage[] } = {}
) => {
  withStorages(() => {
    storages.forEach((storage) => addStorage(storage))
    const server = http.createServer(app.callback()).listen()
    const addressInfo = server.address() as AddressInfo
    describe(name, () => {
      afterAll(() => {
        server.close()
      })
      cb(`http://localhost:${addressInfo.port}`)
    })
  })
}

export default describeApp
