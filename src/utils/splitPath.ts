import path from "path"

export default function splitPath (target: string) {
  const paths: string[] = []
  let currentPath = target
  while (currentPath !== '/') {
    paths.push(path.basename(currentPath))
    currentPath = path.dirname(currentPath)
  }
  return paths.reverse()
}
