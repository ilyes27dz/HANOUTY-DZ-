// src/main/preload.js - ✅ النسخة النهائية الكاملة مع الحماية
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Products
  getProducts: () => ipcRenderer.invoke('get-products'),
  addProduct: (product) => ipcRenderer.invoke('add-product', product),
  updateProduct: (product) => ipcRenderer.invoke('update-product', product),
  deleteProduct: (id) => ipcRenderer.invoke('delete-product', id),
  
  // Categories
  getCategories: () => ipcRenderer.invoke('get-categories'),
  addCategory: (category) => ipcRenderer.invoke('add-category', category),
  updateCategory: (category) => ipcRenderer.invoke('update-category', category),
  deleteCategory: (id) => ipcRenderer.invoke('delete-category', id),
  
  // Marques
  getMarques: () => ipcRenderer.invoke('get-marques'),
  addMarque: (marque) => ipcRenderer.invoke('add-marque', marque),
  updateMarque: (marque) => ipcRenderer.invoke('update-marque', marque),
  deleteMarque: (id) => ipcRenderer.invoke('delete-marque', id),
  
  // Unites
  getUnites: () => ipcRenderer.invoke('get-unites'),
  addUnite: (unite) => ipcRenderer.invoke('add-unite', unite),
  updateUnite: (unite) => ipcRenderer.invoke('update-unite', unite),
  deleteUnite: (id) => ipcRenderer.invoke('delete-unite', id),
  
  // Tailles
  getTailles: () => ipcRenderer.invoke('get-tailles'),
  addTaille: (taille) => ipcRenderer.invoke('add-taille', taille),
  updateTaille: (taille) => ipcRenderer.invoke('update-taille', taille),
  deleteTaille: (id) => ipcRenderer.invoke('delete-taille', id),
  
  // Lost Products
  getLostProducts: () => ipcRenderer.invoke('get-lost-products'),
  addLostProduct: (product) => ipcRenderer.invoke('add-lost-product', product),
  deleteLostProduct: (id) => ipcRenderer.invoke('delete-lost-product', id),
  
  // Stock Corrections
  getStockCorrections: () => ipcRenderer.invoke('get-stock-corrections'),
  addStockCorrection: (correction) => ipcRenderer.invoke('add-stock-correction', correction),
  deleteStockCorrection: (id) => ipcRenderer.invoke('delete-stock-correction', id),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),
  
  // Machine Info & Trial
  getMachineInfo: () => ipcRenderer.invoke('get-machine-info'),
  checkTrialUsed: () => ipcRenderer.invoke('check-trial-used'),
  markTrialUsed: () => ipcRenderer.invoke('mark-trial-used'),
  
  // Activation System (encrypted)
  saveActivation: (data) => ipcRenderer.invoke('save-activation', data),
  loadActivation: () => ipcRenderer.invoke('load-activation'),
  deleteActivation: () => ipcRenderer.invoke('delete-activation'),
  
  // Time manipulation & Reset
  checkTimeManipulation: () => ipcRenderer.invoke('check-time-manipulation'),
  resetEverything: () => ipcRenderer.invoke('reset-everything'),
  quitApp: () => ipcRenderer.invoke('quit-app'),
  
  // Backup & Updates
  backupDatabase: () => ipcRenderer.invoke('backup-database'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: (url) => ipcRenderer.invoke('download-update', url),
  
  // Window Controls
maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  logout: () => ipcRenderer.send('logout'),
  onLogoutComplete: (callback) => ipcRenderer.on('logout-complete', callback),
  
  // Barcode
  openBarcodeWindow: (product) => ipcRenderer.send('open-barcode-window', product),
});

console.log('✅ Preload script loaded successfully!');
