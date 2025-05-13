import path from 'path'
import { nanoid } from 'nanoid'
import { ROOT_PATH } from './constant'

export const getStores = () => [
  {
    path: '/',
    device: {
      type: 'local',
      /** @TODO */
      path: path.resolve(ROOT_PATH, 'dist'),
      filter: undefined,
    },
  },
].map((item) => ({ id: nanoid(), ...item }))
