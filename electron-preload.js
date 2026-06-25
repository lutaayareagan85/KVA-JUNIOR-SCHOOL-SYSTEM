const { contextBridge, ipcRenderer } = require('electron');

// Securely expose APIs to the renderer thread
contextBridge.exposeInMainWorld('KVADesktopBridge', {
  isDesktop: true,
  onGoToTab: (callback) => {
    ipcRenderer.on('go-to-tab', (event, tabName) => callback(tabName));
  },
  onShowPwaTroubleshoot: (callback) => {
    ipcRenderer.on('show-pwa-troubleshoot', () => callback());
  },
  triggerNotification: (title, body) => {
    new Notification(title, { body });
  }
});

console.log('[Electron] Preload script initialized. KVADesktopBridge is active.');
