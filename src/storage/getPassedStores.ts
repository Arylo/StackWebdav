import { getStorages } from "./index"

function getPassedStores (targetPath: string) {
  return getStorages().filter((store) => store.check(targetPath))
}

export default getPassedStores
