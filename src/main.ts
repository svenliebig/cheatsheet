import path from 'node:path'
import process from 'node:process'
import { BrowserWindow, app, globalShortcut, ipcMain } from 'electron'
import { Log } from './utils/logging'
import { ConfigControler } from './controller/config'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line ts/no-require-imports
if (require('electron-squirrel-startup')) {
  app.quit()
}

let mainWindow: BrowserWindow

function createWindow() {
  Log.trace('main.createWindow')

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    // vibrancy: 'fullscreen-ui',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  mainWindow.setIgnoreMouseEvents(true)
  // mainWindow.hide()

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    Log.info(`Using Vite dev server at ${MAIN_WINDOW_VITE_DEV_SERVER_URL}`)
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  }
  else {
    const html = path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    Log.info(`Loading production build from ${html}`)
    mainWindow.loadFile(html)
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  registerEvents()
}

function registerEvents() {
  Log.trace('main.registerEvents')
  ConfigControler.register(ipcMain, mainWindow)
}

function unregister() {
  Log.trace('main.unregister')
  ConfigControler.unregister()
}

app.whenReady().then(() => {
  Log.trace('main.appReady')
  createWindow()

  // Register for Meta (Command) key
  const ret = globalShortcut.register('Meta+Option+Z', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide()
    }
    else {
      mainWindow?.showInactive()
    }
  })

  if (!ret) {
    Log.error('could not register shortcut')
  }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
  unregister()
})

app.on('will-quit', () => {
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
