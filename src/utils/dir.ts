import fs from 'node:fs'
import { resolve } from 'node:path'
import os from 'node:os'

export function getAppDirectory() {
  const appDirectory = resolve(os.homedir(), 'cheatsheet')
  if (!fs.existsSync(appDirectory)) {
    fs.mkdirSync(appDirectory, { recursive: true })
  }
  return appDirectory
}
