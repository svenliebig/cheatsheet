import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import type { FSWatcher } from 'node:original-fs'
import * as toml from 'toml'
import { type IpcMain, app } from 'electron'
import { watch } from 'chokidar'
import { Log } from '../utils/logging'
import type { Api } from '../types/shared'
import { GET_CONFIG } from '../types/shared'

let configWatcher: FSWatcher
let config: Record<string, any> = {}

export const ConfigControler = {
  register(ipc: IpcMain) {
    Log.trace('ConnectionController.register')

    ipc.handle(GET_CONFIG, async (): ReturnType<Api['getConfig']> => {
      Log.trace(`Handle: ${GET_CONFIG} ${JSON.stringify(config)}`)
      return config
    })

    loadConfig()
    watchConfig()
  },
  unregister() {
    configWatcher.close()
  },
}

function getPath() {
  return join(
    __dirname,
    '..',
    '..',
    'cheatsheet.toml',
  )
}

function loadConfig() {
  try {
    const configPath = getPath()
    config = toml.parse(readFileSync(configPath, 'utf-8'))
  }
  catch (error) {
    Log.error('Error reading config:', error)
    config = {}
  }
}

function watchConfig() {
  const configPath = getPath()
  Log.info(`Path: ${configPath}`)

  if (configWatcher) {
    configWatcher.close()
  }

  configWatcher = watch(configPath, {
    persistent: true,
    ignoreInitial: true,
  })

  configWatcher.on('change', () => {
    Log.info('config watch change')
    try {
      config = toml.parse(readFileSync(configPath, 'utf-8'))
    }
    catch (error) {
      Log.error('Error reading config:', error)
    }
  })
}
