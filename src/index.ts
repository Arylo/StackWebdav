import app from '../app'
import * as settings from '../storages/common/settings'
import { loadConfig, withStorages } from './storage/utils'

withStorages(() => {
  loadConfig()
  app.listen(settings.PORT, '0.0.0.0', () => {
    console.log(`Listening 0.0.0.0:${settings.PORT} ...`)
  })
})
