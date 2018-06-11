const {app, BrowserWindow, ipcMain, ipcRenderer} = require('electron')
const { blockWindowAds } = require('electron-ad-blocker')

const path = require('path')
const url = require('url')

app.commandLine.appendSwitch('widevine-cdm-path', '/Users/MatteoPiatti/Projects/aqua/plugins/WidevineCdm/1.4.8.984/widevinecdmadapter.plugin')
app.commandLine.appendSwitch('widevine-cdm-version', '1.4.8.984')

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({width: 800, hasShadow: false, height: 600, title: "Aqua", frame: false, transparent: true, show: false, fullscreenable: false, webPreferences: {plugins: true}})
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
    mainWindow.setAspectRatio(arg.width / (arg.height + 38))
    event.sender.send('fullscreen-dimensions-reply', 'success')
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