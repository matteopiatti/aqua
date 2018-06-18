const {app, BrowserWindow, ipcMain, ipcRenderer} = require('electron')
const { blockWindowAds } = require('electron-ad-blocker')

const path = require('path')
const url = require('url')

let pluginName
switch (process.platform) {
  case 'win32':
    pluginName = 'pepflashplayer.dll'
    break
  case 'darwin':
    pluginName = 'PepperFlashPlayer.plugin'
    break
  case 'linux':
    pluginName = 'libpepflashplayer.so'
    break
}
app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginName))

// Optional: Specify flash version, for example, v17.0.0.169
app.commandLine.appendSwitch('ppapi-flash-version', '17.0.0.169')

app.commandLine.appendSwitch('widevine-cdm-path', '/Users/MatteoPiatti/Projects/aqua/plugins/WidevineCdm/1.4.8.984/widevinecdmadapter.plugin')
app.commandLine.appendSwitch('widevine-cdm-version', '1.4.8.984')

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({minHeight: 72, minWidth: 122, width: 1000, hasShadow: false, height: 600, vibrancy: "light", transparent: true, title: "Aqua", frame: false, show: false, fullscreenable: false, webPreferences: {plugins: true}})
  blockWindowAds(mainWindow)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  let onTopInterval = setInterval(function(){
    mainWindow.setAlwaysOnTop(true);
  }, 1);

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  ipcMain.on('fullscreen-dimensions', (event, arg) => {
    //TODO: Actual aspect ratio not just 16/9
    mainWindow.setAspectRatio(16 / 9)
    event.sender.send('fullscreen-dimensions-reply', 'success')
  })

  ipcMain.on('remove-aspect-ratio', (event, arg) => {
    mainWindow.setAspectRatio(0)
    event.sender.send('remove-aspect-ratio-reply', 'success')
  })

  mainWindow.on('closed', function () {
    clearInterval(onTopInterval)
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})