export const GET_CONFIG = 'GET_CONFIG'
export const CONFIG_UPDATEED = 'CONFIG_UPDATED'
export const GET_CONFIG_PATH = 'GET_CONFIG_PATH'
export const SET_CONFIG_PATH = 'SET_CONFIG_PATH'

export interface Api {
  getConfig: () => Promise<Record<string, any>>
  configUpdated: (callback: (config: Record<string, any>) => void) => Promise<void>
  getConfigPath: () => Promise<string>
  setConfigPath: (path: string) => Promise<void>
}
