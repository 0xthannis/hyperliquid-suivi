const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');

const isDev = process.env.AT_DEV === '1';
const useRemote = process.env.AT_REMOTE === '1';

function webDistPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'web');
  }
  return path.join(__dirname, '..', 'web', 'dist');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 640,
    backgroundColor: '#060608',
    title: 'A&T CAPITAL · Terminal 277',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (useRemote) {
    win.loadURL('https://atcapital.up.railway.app/app');
  } else if (isDev) {
    win.loadURL('http://localhost:5173/app');
  } else {
    const indexHtml = path.join(webDistPath(), 'index.html');
    win.loadFile(indexHtml, { hash: '/app' });
  }
}

function buildMenu() {
  const template = [
    {
      label: 'Terminal 277',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Édition',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'Affichage',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Fenêtre',
      submenu: [{ role: 'minimize' }, { role: 'zoom' }, { type: 'separator' }, { role: 'front' }],
    },
    {
      label: 'Aide',
      submenu: [
        {
          label: 'Terminal 277',
          click: () => shell.openExternal('https://atcapital.up.railway.app'),
        },
        {
          label: 'Vérifier sur Hyperliquid',
          click: () =>
            shell.openExternal(
              'https://app.hyperliquid.xyz/explorer/address/0x994Ff80b7dA1174a164e0F93121bDfbb68cf7A3F'
            ),
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  buildMenu();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
