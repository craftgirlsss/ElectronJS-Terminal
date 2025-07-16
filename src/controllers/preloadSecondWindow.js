// preloadSecondWindow.js (for second.html)
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('terminalAPI', {
    executeCommand: (command) => ipcRenderer.invoke('execute-command', command)
});