import { readFileSync, writeFileSync } from 'node:fs'
import type { FSWatcher } from 'node:original-fs'
import { join } from 'node:path'
import type { BrowserWindow, IpcMain } from 'electron'
import { watch } from 'chokidar'
import * as toml from 'toml'
import { getAppDirectory } from '../utils/dir'
import type { Api } from '../types/shared'
import { CONFIG_UPDATEED, GET_CONFIG, GET_CONFIG_PATH, SET_CONFIG_PATH } from '../types/shared'
import { Log } from '../utils/logging'

let configWatcher: FSWatcher
let config: Record<string, any> = {}
let configPath = join(__dirname, '..', '..', 'cheatsheet.toml')

export const ConfigControler = {
  register(ipc: IpcMain, win: BrowserWindow) {
    Log.trace('ConnectionController.register')

    ipc.handle(GET_CONFIG, async (): ReturnType<Api['getConfig']> => {
      Log.trace(`Handle: ${GET_CONFIG} ${JSON.stringify(config)}`)
      return config
    })

    ipc.handle(GET_CONFIG_PATH, async () => {
      return configPath
    })

    ipc.handle(SET_CONFIG_PATH, async (_event, path: string) => {
      Log.trace(`ConfigController`, SET_CONFIG_PATH)
      configPath = path
      // Save the path to app directory
      writeFileSync(join(getAppDirectory(), 'config.json'), JSON.stringify({ path }))
      loadConfig()
      watchConfig(win)
      win.webContents.send(CONFIG_UPDATEED, config)
    })

    // Try to load saved path
    try {
      const savedConfig = JSON.parse(readFileSync(join(getAppDirectory(), 'config.json'), 'utf-8'))
      configPath = savedConfig.path
    }
    catch {
      Log.info('No saved config path found, using default')
    }

    loadConfig()
    watchConfig(win)
  },
  unregister() {
    configWatcher?.close()
  },
}

function loadConfig() {
  try {
    config = toml.parse(readFileSync(configPath, 'utf-8'))
  }
  catch (error) {
    Log.error('Error reading config:', error)
    config = {}
  }
}

function watchConfig(win: BrowserWindow) {
  Log.info(`Watching config at: ${configPath}`)

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
