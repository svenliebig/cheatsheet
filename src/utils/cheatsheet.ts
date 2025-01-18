import { copyFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { FSWatcher } from 'node:original-fs'
import * as toml from 'toml'
import { watch } from 'chokidar'
import { getAssetsDirectory } from './dir'
import { Log } from './logging'

let configWatcher: FSWatcher

export const Cheatsheet = {
  load: (path: string): Record<string, any> | undefined => {
    Log.trace(`Cheatsheet.load: ${path}`)

    try {
      return toml.parse(readFileSync(path, 'utf-8'))
    }
    catch (error) {
      if (isENOENT(error)) {
        const dftConfigPath = join(getAssetsDirectory(), 'cheatsheet.toml')
        Log.info(`cheatsheet file does not exist in:\n  ${path}\ncopying from default:\n  ${dftConfigPath}`)
        try {
          copyFileSync(dftConfigPath, path)
          return Cheatsheet.load(path)
        }
        catch (error) {
          Log.error('Error copying default config file:', error)
        }
      }
      else {
        Log.error('Error reading config:', error)
      }
    }

    return {}
  },
  watch(path: string, onChange: (sheet: Record<string, any>) => void) {
    Log.trace(`Cheatsheet.watch: ${path}`)

    if (configWatcher) {
      configWatcher.close()
    }

    configWatcher = watch(path, {
      persistent: true,
      ignoreInitial: true,
    })

    configWatcher.on('change', () => {
      Log.info('Cheatsheet.watch change')
      try {
        const cheatsheet = Cheatsheet.load(path)
        onChange(cheatsheet)
      }
      catch (error) {
        Log.error('Error reading config:', error)
      }
    })
  },
  unwatch() {
    if (configWatcher) {
      configWatcher.close()
    }
  },
}

function isENOENT(error: any) {
  return error.code === 'ENOENT'
}
