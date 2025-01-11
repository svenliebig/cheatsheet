import fs from 'node:fs'
import { resolve } from 'node:path'
import { getAppDirectory } from '../utils/dir'

enum LogLevel {
  Trace = 'TRACE',
  Info = 'INFO',
  Debug = 'DEBUG',
  Error = 'ERROR',
}

class Logger {
  trace(message?: any, ...optionalParams: any[]) {
    this.log(LogLevel.Trace, message, ...optionalParams)
  }

  info(message?: any, ...optionalParams: any[]) {
    this.log(LogLevel.Info, message, ...optionalParams)
  }

  debug(message?: any, ...optionalParams: any[]) {
    this.log(LogLevel.Debug, message, ...optionalParams)
  }

  error(message?: any, ...optionalParams: any[]) {
    this.log(LogLevel.Error, message, ...optionalParams)
  }

  private log(level: LogLevel, message?: any, ...optionalParams: any[]) {
    const m = this.format(level, message, ...optionalParams)
    // eslint-disable-next-line no-console
    console.log(m)
    this.appendToFile(m)
  }

  private format(level: string, message: string, ...optionalParams: any[]) {
    const time = new Date().toISOString()
    return `[${level}][${time}] ${message} ${optionalParams.map(p => JSON.stringify(p)).join(' ')}`
  }

  private async appendToFile(message: string) {
    try {
      fs.appendFileSync(resolve(getAppDirectory(), 'log.txt'), `${message}\n`)
    }
    catch (error) {
      console.error(`Failed to write to log file: ${error.message}`)
    }
  }
}

export const Log = new Logger()
