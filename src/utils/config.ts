import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { Log } from './logging'
import { getConfigurationDirectory } from './dir'

const configPath = join(getConfigurationDirectory(), 'config.json')

export const Config = {
  write: (config: Record<string, any>) => {
    Log.trace(`Config.write: ${configPath}`)
    writeFileSync(configPath, JSON.stringify(config))
  },
  read: () => {
    Log.trace(`Config.read: ${configPath}`)
    return JSON.parse(readFileSync(configPath, 'utf-8'))
  },
}
