import fs from 'node:fs'
import { join, resolve } from 'node:path'
import os from 'node:os'

export function getConfigurationDirectory() {
  const appDirectory = resolve(os.homedir(), '.config', 'cheatsheet')
  if (!fs.existsSync(appDirectory)) {
    fs.mkdirSync(appDirectory, { recursive: true })
  }
  return appDirectory
}

export function appRoot() {
  return join(__dirname, '..', '..', '..')
}

export function getAssetsDirectory() {
  return join(appRoot(), 'assets')
}
