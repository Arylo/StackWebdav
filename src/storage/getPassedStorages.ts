import { getStorages } from "./index"

function getPassedStorages (targetPath: string) {
  return getStorages().filter((store) => store.check(targetPath))
}

export default getPassedStorages
