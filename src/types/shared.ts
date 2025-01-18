export const GET_CONFIG = 'GET_CONFIG'
export const CONFIG_UPDATED = 'CONFIG_UPDATED'
export const GET_CONFIG_PATH = 'GET_CONFIG_PATH'
export const SET_CHEATSHEET_PATH = 'SET_CHEATSHEET_PATH'
export const SET_DEBUG = 'SET_DEBUG'

export interface Api {
  getConfig: () => Promise<Record<string, any>>
  configUpdated: (callback: (config: Record<string, any>) => void) => Promise<void>
  getConfigPath: () => Promise<string>
  setConfigPath: (path: string) => Promise<void>
  setDebug: (debug: boolean) => Promise<void>
}
