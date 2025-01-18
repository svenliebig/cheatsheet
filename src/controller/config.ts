import { copyFile, copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import type { FSWatcher } from 'node:original-fs'
import { join } from 'node:path'
import type { BrowserWindow, IpcMain } from 'electron'
import { watch } from 'chokidar'
import * as toml from 'toml'
import { getAssetsDirectory, getConfigurationDirectory } from '../utils/dir'
import type { Api } from '../types/shared'
import { CONFIG_UPDATED, GET_CONFIG, GET_CONFIG_PATH, SET_CONFIG_PATH, SET_DEBUG } from '../types/shared'
import { Log } from '../utils/logging'

let configWatcher: FSWatcher
let config: Record<string, any> = {}
let configPath = join(getConfigurationDirectory(), 'cheatsheet.toml')

export const ConfigControler = {
  localConfig: { path: configPath, debug: false },
  register(ipc: IpcMain, win: BrowserWindow) {
    Log.trace('ConnectionController.register')

    ipc.handle(GET_CONFIG, async (): ReturnType<Api['getConfig']> => {
      Log.trace(`ConfigController.${GET_CONFIG}`)
      Log.debug(`return configuration: ${JSON.stringify(config)}`)
      return { ...config, debug: ConfigControler.localConfig.debug }
    })

    ipc.handle(GET_CONFIG_PATH, async () => {
      return configPath
    })

    ipc.handle(SET_CONFIG_PATH, async (_event, path: string) => {
      Log.trace(`ConfigController.${SET_CONFIG_PATH}: ${path}`)
      configPath = path
      ConfigControler.localConfig.path = path
      // Save the path to app directory
      writeFileSync(join(getConfigurationDirectory(), 'config.json'), JSON.stringify(ConfigControler.localConfig))
      loadConfig()
      watchConfig(win)
      win.webContents.send(CONFIG_UPDATED, { ...config, debug: ConfigControler.localConfig.debug })
    })

    ipc.handle(SET_DEBUG, async (_event, debug: boolean) => {
      Log.trace(`ConfigController.${SET_DEBUG}: ${debug}`)
      ConfigControler.localConfig.debug = debug
      writeFileSync(join(getConfigurationDirectory(), 'config.json'), JSON.stringify(ConfigControler.localConfig))
      win.webContents.send(CONFIG_UPDATED, { ...config, debug: ConfigControler.localConfig.debug })
    })

    // Try to load saved path
    try {
      const savedConfig = JSON.parse(readFileSync(join(getConfigurationDirectory(), 'config.json'), 'utf-8'))
      configPath = savedConfig.path
      ConfigControler.localConfig = savedConfig
    }
    catch {
      Log.info('No saved config path found, using default')
    }

    config = loadConfig()
    watchConfig(win)
  },
  unregister() {
    configWatcher?.close()
  },
}

function loadConfig() {
  Log.trace(`loadConfig: ${configPath}`)

  try {
    return toml.parse(readFileSync(configPath, 'utf-8'))
  }
  catch (error) {
    if (isENOENT(error)) {
      const dftConfigPath = join(getAssetsDirectory(), 'cheatsheet.toml')
      Log.info(`config file does not exist in:\n  ${configPath}\ncopying from default:\n  ${dftConfigPath}`)
      try {
        copyFileSync(dftConfigPath, configPath)
      }
      catch (error) {
        Log.error('Error copying default config file:', error)
      }
    }
    else {
      Log.error('Error reading config:', error)
    }
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
      config = loadConfig()
      Log.debug(`Sending updated config: ${JSON.stringify(config)}`)
      win.webContents.send(CONFIG_UPDATED, { ...config })
    }
    catch (error) {
      Log.error('Error reading config:', error)
    }
  })
}

function isENOENT(error: any) {
  return error.code === 'ENOENT'
}
