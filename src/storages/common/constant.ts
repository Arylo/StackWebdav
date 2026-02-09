import path from 'path'
import { findUpSync } from 'find-up'

const PROJECT_FILE_PATH = findUpSync('package.json') as string

export const ROOT_PATH = path.dirname(PROJECT_FILE_PATH)
