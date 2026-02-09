import path from 'path'
import { ROOT_PATH } from './constant'

const { name, version } = require(path.resolve(ROOT_PATH, 'package.json'))

export default {
  name,
  version,
}
