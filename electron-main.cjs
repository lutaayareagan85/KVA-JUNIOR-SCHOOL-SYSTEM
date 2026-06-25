const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow = null;
let serverProcess = null;

// Determine if we are running in a development environment
const isDev = !app.isPackaged;
const PORT = 3000;
const SERVER_URL = `http://localhost:${PORT}`;

function startBackendServer() {
  console.log(`[Electron] Launching backend server (isDev=${isDev})...`);
  
  const env = { ...process.env, NODE_ENV: isDev ? 'development' : 'production' };
  
  if (isDev) {
    // In development mode, spawn tsx server.ts
    serverProcess = spawn('npx', ['tsx', 'server.ts'], {
      stdio: 'inherit',
      shell: true,
      env: env
    });
  } else {
    // In production mode, spawn node dist/server.cjs
    const serverPath = path.join(__dirname, 'dist', 'server.cjs');
    console.log(`[Electron] Executing production server at ${serverPath}`);
    serverProcess = spawn('node', [serverPath], {
      stdio: 'inherit',
      env: env
    });
  }

  serverProcess.on('error', (err) => {
    console.error('[Electron] Failed to start backend server:', err);
  });

  serverProcess.on('exit', (code, signal) => {
    console.log(`[Electron] Backend server exited with code ${code} and signal ${signal}`);
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 720,
    title: "KVA Pre-School Management Portal (Desktop Edition)",
    backgroundColor: '#F0F9FF', // Light blue background matching the system theme
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron-preload.js')
    }
  });

  // Apply a custom, clean desktop application menu
  const menuTemplate = [
    {
      label: 'Portal Controls',
      submenu: [
        { label: 'Overview Dashboard', click: () => { mainWindow.webContents.send('go-to-tab', 'dashboard'); } },
        { label: 'Pupil Registry', click: () => { mainWindow.webContents.send('go-to-tab', 'registry'); } },
        { label: 'Fees & Ledger', click: () => { mainWindow.webContents.send('go-to-tab', 'fees'); } },
        { type: 'separator' },
        { label: 'Reload Portal', role: 'reload' },
        { label: 'Force Reload (Clear Cache)', role: 'forceReload' },
        { type: 'separator' },
        { label: 'Minimize Window', role: 'minimize' },
        { label: 'Exit KVA Portal', role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'togglefullscreen' },
        { type: 'separator' },
        { label: 'Actual Size', role: 'resetZoom' },
        { label: 'Zoom In', role: 'zoomIn' },
        { label: 'Zoom Out', role: 'zoomOut' },
        { type: 'separator' },
        { label: 'Developer Web Inspector', accelerator: 'CmdOrCtrl+Shift+I', click: () => { mainWindow.webContents.toggleDevTools(); } }
      ]
    },
    {
      label: 'Support & Community',
      submenu: [
        {
          label: 'UG Nursery Curriculum (NCDC)',
          click: async () => { await shell.openExternal('https://ncdc.go.ug/'); }
        },
        {
          label: 'Offline Database Troubleshooting',
          click: () => { mainWindow.webContents.send('show-pwa-troubleshoot'); }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Poll server and load once responding
  pollServerAndLoad(SERVER_URL, 0);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function pollServerAndLoad(url, attempts) {
  if (attempts > 50) {
    console.error('[Electron] Backend server failed to respond within time limits.');
    return;
  }

  // Attempt to query the server
  http.get(url, (res) => {
    console.log(`[Electron] Server is alive (Status ${res.statusCode}). Loading in Electron Window.`);
    mainWindow.loadURL(url);
  }).on('error', (err) => {
    console.log(`[Electron] Server not ready yet. Retrying attempt ${attempts + 1}/50...`);
    setTimeout(() => pollServerAndLoad(url, attempts + 1), 600);
  });
}

// Ensure background processes are cleaned up upon exit
app.on('ready', () => {
  startBackendServer();
  createMainWindow();
});

app.on('window-all-closed', () => {
  // Respect macOS conventions
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});

app.on('will-quit', () => {
  if (serverProcess) {
    console.log('[Electron] Shutting down backend Express server...');
    serverProcess.kill('SIGINT');
  }
});
