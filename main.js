const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');



// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win; 

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
                           width: 1400, 
                           height: 1000,
                           "nodeIntegration": false,
                           icon: path.join(__dirname, 'src/icons/favicon.ico')
                         });

  // and load the index.html of the app
  // win.loadURL(url.format({
  // 	pathname: path.join(__dirname, '/src/index.html'),
  // 	protocol: 'file://',
  // 	slashes: true
  // }))

  win.loadURL('file://' + __dirname + "/src/index.html");

  //Open teh DevTools
  //win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
  	// Derefence the window object
  	win = null
  });
};

// called when Electron has finished initialization
app.on('ready', createWindow);

// Quit when all windows are  closed
app.on('window-closed', () => {
  // case macOS
  if (process.platform !== 'darwin') {
  	app.quit()
  }
});

app.on('activate', () => {
  if (win === null) {
  	createWindow()
  };
});