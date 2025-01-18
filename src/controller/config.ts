import { join } from 'node:path'
import type { BrowserWindow, IpcMain } from 'electron'
import type { Api } from '../types/shared'
import { CONFIG_UPDATED, GET_CHEATSHEET_PATH, GET_CONFIG, SET_CHEATSHEET_PATH, SET_DEBUG } from '../types/shared'
import { Cheatsheet } from '../utils/cheatsheet'
import { Config } from '../utils/config'
import { getConfigurationDirectory } from '../utils/dir'
import { Log } from '../utils/logging'

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

    ipc.handle(GET_CHEATSHEET_PATH, async () => {
      Log.trace(`ConfigController.${GET_CHEATSHEET_PATH}`)
      return ConfigControler.config.path
    })

    ipc.handle(SET_CHEATSHEET_PATH, async (_event, path: string) => {
      Log.trace(`ConfigController.${SET_CHEATSHEET_PATH}: ${path}`)

      ConfigControler.config.path = path
      Config.write(ConfigControler.config)

      ConfigControler.cheatsheet = Cheatsheet.load(path)
      Cheatsheet.watch(ConfigControler.config.path, onCheatsheetUpdateWin)

      onCheatsheetUpdateWin(ConfigControler.cheatsheet)
    })

    ipc.handle(SET_DEBUG, async (_event, debug: boolean) => {
      Log.trace(`ConfigController.${SET_DEBUG}: ${debug}`)
      ConfigControler.config.debug = debug
      Config.write(ConfigControler.config)
    })

    // Try to load saved path
    try {
      ConfigControler.config = Config.read()
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
