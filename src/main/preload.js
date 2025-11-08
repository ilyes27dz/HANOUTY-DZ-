// src/main/preload.js - ✅ ULTIMATE PRODUCTION VERSION v2.0 - COMPLETE & SECURE
const { contextBridge, ipcRenderer } = require('electron');

// ============================================
// 🔹 Error Handler Wrapper
// ============================================
function safeInvoke(channel, ...args) {
  try {
    return ipcRenderer.invoke(channel, ...args);
  } catch (error) {
    console.error(`❌ IPC Error on ${channel}:`, error);
    return null;
  }
}

function safeSend(channel, ...args) {
  try {
    ipcRenderer.send(channel, ...args);
  } catch (error) {
    console.error(`❌ IPC Send Error on ${channel}:`, error);
  }
}

// ============================================
// 🔹 Expose Electron API to Renderer
// ============================================
contextBridge.exposeInMainWorld('electron', {
  
  // ============================================
  // 📦 Products Management
  // ============================================
  getProducts: () => ipcRenderer.invoke('get-products'),
  addProduct: (product) => ipcRenderer.invoke('add-product', product),
  updateProduct: (product) => ipcRenderer.invoke('update-product', product),
  deleteProduct: (id) => ipcRenderer.invoke('delete-product', id),
  
  // ============================================
  // 📂 Categories Management
  // ============================================
  getCategories: () => ipcRenderer.invoke('get-categories'),
  addCategory: (category) => ipcRenderer.invoke('add-category', category),
  updateCategory: (category) => ipcRenderer.invoke('update-category', category),
  deleteCategory: (id) => ipcRenderer.invoke('delete-category', id),
  
  // ============================================
  // 🏷️ Marques Management
  // ============================================
  getMarques: () => ipcRenderer.invoke('get-marques'),
  addMarque: (marque) => ipcRenderer.invoke('add-marque', marque),
  updateMarque: (marque) => ipcRenderer.invoke('update-marque', marque),
  deleteMarque: (id) => ipcRenderer.invoke('delete-marque', id),
  
  // ============================================
  // 📏 Unites Management
  // ============================================
  getUnites: () => ipcRenderer.invoke('get-unites'),
  addUnite: (unite) => ipcRenderer.invoke('add-unite', unite),
  updateUnite: (unite) => ipcRenderer.invoke('update-unite', unite),
  deleteUnite: (id) => ipcRenderer.invoke('delete-unite', id),
  
  // ============================================
  // 👕 Tailles Management
  // ============================================
  getTailles: () => ipcRenderer.invoke('get-tailles'),
  addTaille: (taille) => ipcRenderer.invoke('add-taille', taille),
  updateTaille: (taille) => ipcRenderer.invoke('update-taille', taille),
  deleteTaille: (id) => ipcRenderer.invoke('delete-taille', id),
  
  // ============================================
  // 📛 Lost Products Management
  // ============================================
  getLostProducts: () => ipcRenderer.invoke('get-lost-products'),
  addLostProduct: (product) => ipcRenderer.invoke('add-lost-product', product),
  deleteLostProduct: (id) => ipcRenderer.invoke('delete-lost-product', id),
  
  // ============================================
  // 🔄 Stock Corrections
// ============================================
  getStockCorrections: () => ipcRenderer.invoke('get-stock-corrections'),
  addStockCorrection: (correction) => ipcRenderer.invoke('add-stock-correction', correction),
  deleteStockCorrection: (id) => ipcRenderer.invoke('delete-stock-correction', id),
  
  // ============================================
  // ⚙️ Settings
// ============================================
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),
  
  // ============================================
  // 💾 Backup & Restore
  // ============================================
  backupDatabase: () => ipcRenderer.invoke('backup-database'),
  restoreDatabase: () => ipcRenderer.invoke('restore-database'),
  listBackups: () => ipcRenderer.invoke('list-backups'),
  deleteBackup: (backupPath) => ipcRenderer.invoke('delete-backup', backupPath),
  openBackupFolder: () => ipcRenderer.invoke('open-backup-folder'),
  
  // ============================================
  // 🔄 Updates
  // ============================================
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: (url) => ipcRenderer.invoke('download-update', url),
  
  // ============================================
  // 🪟 Window Controls
  // ============================================
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  logout: () => ipcRenderer.send('logout'),
  
  // ============================================
  // 🪟 Event Listeners
  // ============================================
  onLogoutComplete: (callback) => {
    const listener = (event) => callback();
    ipcRenderer.on('logout-complete', listener);
    return () => ipcRenderer.removeListener('logout-complete', listener);
  },
  
  // ✅ Trial Expiration Event Listener
  onTrialExpired: (callback) => {
    const listener = (event) => {
      console.log('⏰ Trial expired signal received from main process');
      callback();
    };
    ipcRenderer.on('trial-expired', listener);
    return () => ipcRenderer.removeListener('trial-expired', listener);
  },
  
  // ============================================
  // ✅ Close App - إغلاق البرنامج (للتجريبية)
  // ============================================
  closeApp: () => safeSend('close-app'),
  
  // ============================================
  // 🔐 Machine Info & Activation
  // ============================================
  getMachineInfo: () => ipcRenderer.invoke('get-machine-info'),
    saveActivation: (data) => ipcRenderer.invoke('save-activation', data),
  loadActivation: () => ipcRenderer.invoke('load-activation'),
  deleteActivation: () => ipcRenderer.invoke('delete-activation'),
  checkTrialUsed: () => ipcRenderer.invoke('check-trial-used'),
  markTrialUsed: () => ipcRenderer.invoke('mark-trial-used'),
  checkTimeManipulation: () => ipcRenderer.invoke('check-time-manipulation'),

  // ============================================
  // 🔐 Trial Data Handlers - NEW
  // ============================================
  saveTrialData: (trialData) => ipcRenderer.invoke('save-trial-data', trialData),
  checkTrialExpiration: () => ipcRenderer.invoke('check-trial-expiration'),
  
  // ============================================
  // 🔧 System & Reset
  // ============================================
  resetEverything: () => ipcRenderer.invoke('reset-everything'),
  quitApp: () => ipcRenderer.invoke('quit-app'),
  });

// ============================================
// 🔹 Logging
// ============================================
console.log('✅ Preload script loaded successfully!');
