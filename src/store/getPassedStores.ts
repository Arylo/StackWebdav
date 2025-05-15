import { getStores } from "./index"

function getPassedStores (targetPath: string) {
  return getStores().filter((store) => store.check(targetPath))
}

export default getPassedStores
