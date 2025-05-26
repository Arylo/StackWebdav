import { getStorages } from './utils'

function getPassedStorages (targetPath: string) {
  return getStorages().filter((store) => store.check(targetPath))
}

export default getPassedStorages
