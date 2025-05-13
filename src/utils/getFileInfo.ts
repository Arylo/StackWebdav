import path from 'path'
import fs from 'fs'
import { getStores } from "../store"

const getFileInfo = (filepath: string) => {
  const stores = getStores()
  const filteredStores = stores.filter((store) => filepath.startsWith(store.path))
  for (const store of filteredStores) {
    switch (store.device.type) {
      case 'local':
        if (fs.existsSync(path.resolve(store.device.path, `.${filepath}`))) {
          return {
            path: filepath,
            store,
          }
        }
        break
    }
  }
  return
}

export default getFileInfo
