import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { BrowserWindow, IpcMain } from 'electron'
import type { Api } from '../types/shared'
import { CONFIG_UPDATED, GET_CONFIG, GET_CONFIG_PATH, SET_CHEATSHEET_PATH, SET_DEBUG } from '../types/shared'
import { Cheatsheet } from '../utils/cheatsheet'
import { getConfigurationDirectory } from '../utils/dir'
import { Log } from '../utils/logging'

const configPath = join(getConfigurationDirectory(), 'config.json')

export const ConfigControler = {
  config: { path: join(getConfigurationDirectory(), 'cheatsheet.toml'), debug: false },
  cheatsheet: {},
  register(ipc: IpcMain, win: BrowserWindow) {
    Log.trace('ConnectionController.register')

    const onCheatsheetUpdateWin = onCheatsheetFileChange(win)

    ipc.handle(GET_CONFIG, async (): ReturnType<Api['getConfig']> => {
      Log.trace(`ConfigController.${GET_CONFIG}`)
      Log.debug(`return configuration: ${JSON.stringify(ConfigControler.cheatsheet)}`)
      return { ...ConfigControler.cheatsheet }
    })

    ipc.handle(GET_CONFIG_PATH, async () => {
      Log.trace(`ConfigController.${GET_CONFIG_PATH}`)
      return configPath
    })

    ipc.handle(SET_CHEATSHEET_PATH, async (_event, path: string) => {
      Log.trace(`ConfigController.${SET_CHEATSHEET_PATH}: ${path}`)

      ConfigControler.config.path = path
      writeFileSync(configPath, JSON.stringify(ConfigControler.config))

      ConfigControler.cheatsheet = Cheatsheet.load(path)
      Cheatsheet.watch(ConfigControler.config.path, onCheatsheetUpdateWin)

      onCheatsheetUpdateWin(ConfigControler.cheatsheet)
    })

    ipc.handle(SET_DEBUG, async (_event, debug: boolean) => {
      Log.trace(`ConfigController.${SET_DEBUG}: ${debug}`)
      ConfigControler.config.debug = debug
      writeFileSync(configPath, JSON.stringify(ConfigControler.config))
    })

    // Try to load saved path
    try {
      ConfigControler.config = JSON.parse(readFileSync(configPath, 'utf-8'))
    }
    catch {
      Log.info('No saved config path found, using default')
    }

    ConfigControler.cheatsheet = Cheatsheet.load(ConfigControler.config.path)
    Cheatsheet.watch(ConfigControler.config.path, onCheatsheetUpdateWin)
    onCheatsheetUpdateWin(ConfigControler.cheatsheet)
  },
  unregister() {
    Cheatsheet.unwatch()
  },
}

function onCheatsheetFileChange(win: BrowserWindow): (sheet: Record<string, any>) => void {
  return (cheatsheet) => {
    Log.debug(`Sending updated config: ${JSON.stringify(cheatsheet)}`)
    win.webContents.send(CONFIG_UPDATED, { ...cheatsheet })
  }
}
