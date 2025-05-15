import getPassedStores from "./getPassedStores";

async function getResource (targetPath: string) {
  const stores = getPassedStores(targetPath)
  for (const store of stores) {
    const isExist = await store.has(targetPath)
    if (isExist) return store.stat(targetPath)
  }
}

export default getResource
