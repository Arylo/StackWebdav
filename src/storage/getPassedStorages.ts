import resourcePath from '../utils/ResourcePath'
import { getStorages } from './utils'

function getPassedStorages (targetPath: string) {
  return getStorages().filter((store) => store.match(resourcePath(targetPath)))
}

export default getPassedStorages
