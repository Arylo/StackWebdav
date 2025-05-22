import getResource from "./getResource"

async function hasResource (targetPath: string) {
  return!! (await getResource(targetPath))
}

export default hasResource
