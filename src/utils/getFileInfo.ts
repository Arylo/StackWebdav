import path from 'path'
import fs from 'fs'
import { getStorages } from "../storage"

const getFileInfo = (filepath: string) => {
  const storages = getStorages()
  const filteredStores = storages.filter((storage) => filepath.startsWith(storage.getStoreInfo().path))
  for (const store of filteredStores) {
    const deviceInfo = store.getStoreInfo().device
    switch (deviceInfo.type) {
      case 'local':
        if (fs.existsSync(path.join(deviceInfo.path, filepath))) {
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
