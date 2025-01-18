// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'
import type { Api } from './types/shared'
import { CONFIG_UPDATED, GET_CHEATSHEET_PATH, GET_CONFIG, SET_CHEATSHEET_PATH, SET_DEBUG } from './types/shared'

export const api: Api = {
  getConfig: async () => {
    const result = await ipcRenderer.invoke(GET_CONFIG)
    return result
  },
  configUpdated: async (callback) => {
    ipcRenderer.on(CONFIG_UPDATED, (_event, value) => callback(value))
  },
  getConfigPath: async () => {
    return await ipcRenderer.invoke(GET_CHEATSHEET_PATH)
  },
  setConfigPath: async (path: string) => {
    await ipcRenderer.invoke(SET_CHEATSHEET_PATH, path)
  },
  setDebug: async (debug: boolean) => {
    await ipcRenderer.invoke(SET_DEBUG, debug)
  },
}

// This exposes the api object in `window.api`, in the react app.
contextBridge.exposeInMainWorld('api', api)
