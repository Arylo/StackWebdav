import getPassedStorages from "./getPassedStorages";

async function getResource (targetPath: string) {
  const stores = getPassedStorages(targetPath)
  for (const store of stores) {
    const stat = await store.HEAD(targetPath)
    if (stat) return stat
  }
}

export default getResource
