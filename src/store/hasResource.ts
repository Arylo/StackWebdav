import getPassedStores from "./getPassedStores"

async function hasResource (targetPath: string) {
  const stores = getPassedStores(targetPath)
  for (const store of stores) {
    if (await store.has(targetPath)) return true
  }
  return false
}

export default hasResource
