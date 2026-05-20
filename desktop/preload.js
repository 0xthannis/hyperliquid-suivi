const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('atCapitalDesktop', {
  platform: 'macos',
  version: '1.1.1',
});
