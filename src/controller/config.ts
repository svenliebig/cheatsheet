import { readFileSync } from 'node:fs'
import type { FSWatcher } from 'node:original-fs'
import { join } from 'node:path'
import type { BrowserWindow, IpcMain } from 'electron'
import { watch } from 'chokidar'
import * as toml from 'toml'
import type { Api } from '../types/shared'
import { CONFIG_UPDATEED, GET_CONFIG } from '../types/shared'
import { Log } from '../utils/logging'

let configWatcher: FSWatcher
let config: Record<string, any> = {}

export const ConfigControler = {
  register(ipc: IpcMain, win: BrowserWindow) {
    Log.trace('ConnectionController.register')

    ipc.handle(GET_CONFIG, async (): ReturnType<Api['getConfig']> => {
      Log.trace(`Handle: ${GET_CONFIG} ${JSON.stringify(config)}`)
      return config
    })

    loadConfig()
    watchConfig(win)
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

function watchConfig(win: BrowserWindow) {
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
      win.webContents.send(CONFIG_UPDATEED, config)
    }
    catch (error) {
      Log.error('Error reading config:', error)
    }
  })
}
