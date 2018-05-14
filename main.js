const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const { blockWindowAds } = require('electron-ad-blocker');

const path = require('path')
const url = require('url')

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({width: 800, height: 600, title: "Aqua", titleBarStyle: 'hiddenInset', show: false, fullscreenable: false})
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
