export const GET_CONFIG = 'GET_CONFIG'

export interface Api {
  getConfig: () => Promise<Record<string, any>>
}
