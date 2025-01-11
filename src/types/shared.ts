export const GET_CONFIG = 'GET_CONFIG'
export const CONFIG_UPDATEED = 'CONFIG_UPDATED'

export interface Api {
  getConfig: () => Promise<Record<string, any>>
  configUpdated: (callback: (config: Record<string, any>) => void) => Promise<void>
}
