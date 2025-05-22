interface JSONObject {
  [key: string]: {
    '$': {
      [key: string]: string,
    },
    [key: string]: any,
  },
}

export const getZone = (jsonObject: JSONObject) => {
  const rootKeys = Object.keys(jsonObject)
  if (rootKeys.length !== 1) {
    throw new Error('Invalid XML format')
  }
  const rootKey = rootKeys[0]
  const metadata = jsonObject[rootKey]['$']
  const [key] = Object.entries(metadata).find(([_, value]) => value.toString() === 'DAV:') as [string, string]
  return key.replace(/^xmlns:/, '')
}
