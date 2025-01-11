import type { Api } from '../../types/shared'

export function getApi(): Api {
  const api = (window as any).api

  if (!api) {
    throw new Error('API is not found. Something went wrong.')
  }

  return api
}
