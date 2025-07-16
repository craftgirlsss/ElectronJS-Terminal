const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');
const { exec } = require('child_process');

let mainWindow; // Jendela utama
let secondWindow; // Jendela kedua

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Penting untuk keamanan
            nodeIntegration: false, // Disarankan false untuk keamanan
            contextIsolation: true // Disarankan true untuk keamanan
        }
    });

    mainWindow.loadFile('index.html');

    // Buka DevTools (opsional)
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on('open-second-window', () => {
    if (!secondWindow || secondWindow.isDestroyed()) {
        secondWindow = new BrowserWindow({
            width: 700,
            height: 500,
            webPreferences: {
              preload: path.join(__dirname, 'src/controllers/preloadSecondWindow.js'), // Separate preload for second window
              nodeIntegration: false,
              contextIsolation: true
            }
        });

        secondWindow.loadFile('src/views/terminal_page.html');

        secondWindow.on('closed', () => {
            secondWindow = null;
        });
    } else {
        secondWindow.focus();
    }
});

// --- New IPC Listener for executing commands ---
ipcMain.handle('execute-command', async (event, command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                resolve({ success: false, output: stderr || error.message });
                return;
            }
            if (stderr) {
                console.warn(`stderr: ${stderr}`);
                resolve({ success: true, output: stdout + '\n' + stderr });
                return;
            }
            resolve({ success: true, output: stdout });
        });
    });
});