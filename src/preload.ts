// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'
import type { Api } from './types/shared'
import { CONFIG_UPDATEED, GET_CONFIG } from './types/shared'

export const api: Api = {
  getConfig: async () => {
    const result = await ipcRenderer.invoke(GET_CONFIG)
    return result
  },
  configUpdated: async (callback) => {
    ipcRenderer.on(CONFIG_UPDATEED, (_event, value) => callback(value))
  },
}

// This exposes the api object in `window.api`, in the react app.
contextBridge.exposeInMainWorld('api', api)
