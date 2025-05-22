import getPassedStores from "./getPassedStores";

async function getResource (targetPath: string) {
  const stores = getPassedStores(targetPath)
  for (const store of stores) {
    const stat = await store.HEAD(targetPath)
    if (stat) return stat
  }
}

export default getResource
