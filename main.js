// const { app, BrowserWindow, ipcMain } = require('electron');
// const { exec } = require('child_process');

// let mainWindow;
// let outputWindow;

// function createMainWindow() {
//     mainWindow = new BrowserWindow({
//         width: 800,
//         height: 600,
//         resizable: false,
//         webPreferences: {
//             nodeIntegration: true,
//             contextIsolation: false
//         }
//     });

//     mainWindow.loadFile('index.html');
// }

// function createOutputWindow() {
//     outputWindow = new BrowserWindow({
//         width: 800,
//         height: 600,
//         resizable: false,
//         webPreferences: {
//             nodeIntegration: true,
//             contextIsolation: false
//         }
//     });

//     outputWindow.loadFile('src/views/terminal_page.html');
// }

// // Handle command execution
// ipcMain.on('execute-command', (event, command) => {
//     exec(command, (error, stdout, stderr) => {
//         if (error) {
//             event.sender.send('command-response', { error: error.message });
//             return;
//         }
//         if (stderr) {
//             event.sender.send('command-response', { error: stderr });
//             return;
//         }
//         event.sender.send('command-response', { output: stdout });
//     });
// });

// ipcMain.on('open-terminal-window', () => {
//     if (!outputWindow || outputWindow.isDestroyed()) {
//         createOutputWindow();
//     } else {
//         outputWindow.focus();
//     }
// });

// ipcMain.on('open-terminal-with-command', (event, command) => {

//   terminalWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: false
//     }
//   });

//   // Pass the command as a URL parameter
//   terminalWindow.loadFile('src/views/terminal_page.html', {
//     query: { command: encodeURIComponent(command) }
//   });

//   // Alternative: Store command globally and send via IPC
//   // terminalWindow.commandToExecute = command;
//   // terminalWindow.loadFile('terminal.html');
// });

// ipcMain.on('close-app', () => {
//   app.quit();
// });

// try {
//   require('electron-reloader')(module, {
//     debug: true,
//     watchRenderer: true
//   });
// } catch (_) { console.log('Error'); }

// app.whenReady().then(() => {
//     createMainWindow();
// });


const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');

// Window references
let mainWindow;
let terminalWindow;

// Configuration
const windowConfig = {
  width: 800,
  height: 600,
  resizable: false,
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false,
    enableRemoteModule: true // Only if you need remote module
  }
};

function createMainWindow() {
  mainWindow = new BrowserWindow(windowConfig);
  mainWindow.loadFile('index.html');
  
  // Optional: DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

function createTerminalWindow(command = null) {
  if (terminalWindow && !terminalWindow.isDestroyed()) {
    terminalWindow.close();
  }

  terminalWindow = new BrowserWindow(windowConfig);
  
  if (command) {
    // Pass command via URL parameter
    terminalWindow.loadFile(path.join(__dirname, 'src/views/terminal_page.html'), {
      query: { command: encodeURIComponent(command) }
    });
  } else {
    terminalWindow.loadFile(path.join(__dirname, 'src/views/terminal_page.html'));
  }

  // Optional: DevTools in development
  if (process.env.NODE_ENV === 'development') {
    terminalWindow.webContents.openDevTools();
  }
}

// IPC Handlers
function setupIPCHandlers() {
  // Execute command handler
  ipcMain.on('execute-command', (event, command) => {
    exec(command, (error, stdout, stderr) => {
      const response = error 
        ? { error: error.message } 
        : stderr 
          ? { error: stderr } 
          : { output: stdout };
          
      event.sender.send('command-response', response);
    });
  });

  // Open terminal window handlers
  ipcMain.on('open-terminal-window', () => {
    if (!terminalWindow || terminalWindow.isDestroyed()) {
      createTerminalWindow();
    } else {
      terminalWindow.focus();
    }
  });

  ipcMain.on('open-terminal-with-command', (event, command) => {
    createTerminalWindow(command);
  });

  // App control handlers
  ipcMain.on('close-app', () => {
    app.quit();
  });

  ipcMain.on('minimize-app', () => {
    BrowserWindow.getFocusedWindow()?.minimize();
  });
}

// App lifecycle
app.whenReady().then(() => {
  createMainWindow();
  setupIPCHandlers();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Hot reload in development
if (process.env.NODE_ENV === 'development') {
  try {
    require('electron-reloader')(module, {
      debug: true,
      watchRenderer: true
    });
  } catch (error) {
    console.error('Hot reload error:', error);
  }
}