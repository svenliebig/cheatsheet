import path from 'node:path'
import process from 'node:process'
import { BrowserWindow, Menu, Tray, app, globalShortcut, ipcMain, nativeImage } from 'electron'
import { Log } from './utils/logging'
import { ConfigControler } from './controller/config'

// Only include this if you're actually using it for Windows
if (process.platform === 'win32') {
  try {
    // eslint-disable-next-line ts/no-require-imports
    require('electron-squirrel-startup')
  }
  catch (e) {
    console.warn('Failed to load electron-squirrel-startup:', e)
  }
}

let mainWindow: BrowserWindow
let tray: Tray
let settingsWindow: BrowserWindow | null = null

function createWindow() {
  Log.trace('main.createWindow')

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 1000,
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

function createTray() {
  const imagePath = path.join(__dirname, 'assets', 'sunTemplate.png')
  // Create a default icon - you should replace this with your own icon file
  const icon = nativeImage.createFromPath(imagePath)
  icon.setTemplateImage(true)

  // Create the tray
  tray = new Tray(icon)

  // Menu
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Cheatsheet', type: 'normal', click: () => {
      if (mainWindow?.isVisible())
        mainWindow.hide()
      else
        mainWindow?.showInactive()
    } },
    { label: 'Settings', type: 'normal', click: () => {
      if (!settingsWindow)
        createSettingsWindow()
      else
        settingsWindow.focus()
    } },
    { label: 'Quit', type: 'normal', click: () => {
      app.quit()
    } },
  ])
  tray.setContextMenu(contextMenu)

  // Set tooltip
  tray.setToolTip('Cheatsheet')
}

function createSettingsWindow() {
  settingsWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    settingsWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}#/settings`)
  }
  else {
    settingsWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      { hash: 'settings' },
    )
  }

  settingsWindow.on('closed', () => {
    settingsWindow = null
  })
}

app.whenReady().then(() => {
  Log.trace('main.appReady')
  createWindow()
  createTray()

  // Hide from dock (macOS only)
  if (process.platform === 'darwin')
    app.dock.hide()

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
  if (tray)
    tray.destroy()
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
