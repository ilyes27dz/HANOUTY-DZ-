const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const https = require('https');
const crypto = require('crypto');
const initSqlJs = require('sql.js');
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
app.disableHardwareAcceleration();
let mainWindow = null;
let db = null;
const isDevelopment = process.env.NODE_ENV === 'development';
let trialCheckInterval = null;

// ============================================
// 🔹 مسارات ثابتة - PATHS
// ============================================
const USER_DATA_PATH = app.getPath('userData');
const DB_PATH = path.join(USER_DATA_PATH, 'products.db');
const ACTIVATION_PATH = path.join(USER_DATA_PATH, '.activation');
const TRIAL_FLAG_PATH = path.join(USER_DATA_PATH, '.trial_used');
const LAST_TIME_PATH = path.join(USER_DATA_PATH, '.last_time');
const BACKUP_DIR = path.join(app.getPath('documents'), 'HANOUTY_Backups');
const TRIAL_DATA_PATH = path.join(USER_DATA_PATH, '.trial_data');

console.log('📂 USER_DATA_PATH:', USER_DATA_PATH);
console.log('📂 DB_PATH:', DB_PATH);
console.log('📂 BACKUP_DIR:', BACKUP_DIR);

// ============================================
// 🔹 نظام التشفير AES-256 - ENCRYPTION
// ============================================
const ENCRYPTION_KEY = 'HANOUTY_2025_SECRET_KEY_32BYTE!';
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

function log(message) {
  const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  }

function logError(message) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ❌ ${message}`);
}

// ============================================
// 🔹 نظام التجريب - TRIAL MANAGEMENT
// ============================================
function getTrialData() {
  try {
    if (fs.existsSync(TRIAL_DATA_PATH)) {
      const encrypted = fs.readFileSync(TRIAL_DATA_PATH, 'utf8');
      const decrypted = decrypt(encrypted);
      return JSON.parse(decrypted);
    }
  } catch (error) {
    logError('Failed to read trial data: ' + error.message);
  }
  return null;
}

function saveTrialData(data) {
  try {
    const encrypted = encrypt(JSON.stringify(data));
    fs.writeFileSync(TRIAL_DATA_PATH, encrypted);
    log('✅ Trial data saved (encrypted)');
  } catch (error) {
    logError('Failed to save trial data: ' + error.message);
  }
}

function isTrialExpired() {
  const trialData = getTrialData();
  if (!trialData || !trialData.startDate) return false;

  const startDate = new Date(trialData.startDate);
  const currentDate = new Date();
  const daysPassed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const result = daysPassed >= (trialData.daysAllowed || 5);
  log(`⏰ Trial check: ${daysPassed} days passed, allowed: ${trialData.daysAllowed}, expired: ${result}`);
  return result;
}

function startTrialHeartbeat() {
  log('💓 Starting trial heartbeat every 30 seconds');
  trialCheckInterval = setInterval(() => {
    if (isTrialExpired() && mainWindow) {
      clearInterval(trialCheckInterval);
      log('⏰ TRIAL EXPIRED - Sending kill signal to renderer');
      mainWindow.webContents.send('trial-expired');
      
      setTimeout(() => {
        log('🔴 Force closing app - Trial expired');
        app.quit();
  }, 3000);
    }
  }, 30000);
}

// ============================================
// 🔹 تهيئة قاعدة البيانات - DATABASE INITIALIZATION
// ============================================
async function initDatabase() {
try {
    log('🔄 Initializing database...');
    
  const SQL = await initSqlJs({
    locateFile: file => path.join(__dirname, '../../node_modules/sql.js/dist', file)
  });

  // تحميل أو إنشاء قاعدة البيانات
    if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
    log('✅ Database loaded from: ' + DB_PATH);
  } else {
    db = new SQL.Database();
    log('✅ New database created');
  }

// ============================================
    // 🔹 إنشاء الجداول - CREATE TABLES
    // ============================================
    
    // جدول المنتجات
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ref TEXT, 
      designation TEXT NOT NULL, 
      category TEXT, 
      marque TEXT, 
      unite TEXT,
      barcode TEXT UNIQUE, 
      fournisseur TEXT, 
      prixAchat REAL DEFAULT 0, 
      prixVente1 REAL DEFAULT 0,
      prixVente2 REAL DEFAULT 0, 
      prixVente3 REAL DEFAULT 0, 
      prixGros REAL DEFAULT 0,
      remise1 REAL DEFAULT 0, 
      remise2 REAL DEFAULT 0, 
      remise3 REAL DEFAULT 0,
      stock INTEGER DEFAULT 0, 
      stockAlerte INTEGER DEFAULT 10, 
      stockNecessaire INTEGER DEFAULT 50,
      stockMin INTEGER DEFAULT 5, 
      emplacement TEXT, 
      image TEXT, 
      dateCreation TEXT,
      datePeremption TEXT, 
      lotNumber TEXT, 
      poids REAL DEFAULT 0, 
      hauteur REAL DEFAULT 0,
      largeur REAL DEFAULT 0, 
      profondeur REAL DEFAULT 0, 
      notes TEXT,
      enBalanceActive BOOLEAN DEFAULT 0, 
      stockActive BOOLEAN DEFAULT 1,
      permisVente BOOLEAN DEFAULT 1, 
      vetements BOOLEAN DEFAULT 0, 
      estActif BOOLEAN DEFAULT 1,
      taille TEXT, 
      nbrColier INTEGER DEFAULT 1, 
      prixColis REAL DEFAULT 0,
      processeur TEXT,
      systeme TEXT DEFAULT 'ANDROID',
      stockage TEXT,
      ram TEXT,
      batterie TEXT,
      camera TEXT,
      imei TEXT
    )
  `);
log('✅ Products table created');

    // جداول إضافية
  db.run(`CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, description TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS marques (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, description TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS unites (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, abbreviation TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS tailles (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, abbreviation TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS lost_products (id INTEGER PRIMARY KEY AUTOINCREMENT, productName TEXT NOT NULL, quantity INTEGER DEFAULT 0, reason TEXT, date TEXT, estimatedLoss REAL DEFAULT 0)`);
  db.run(`CREATE TABLE IF NOT EXISTS stock_corrections (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL, productId INTEGER NOT NULL, productName TEXT NOT NULL, oldQuantity REAL DEFAULT 0, newQuantity REAL DEFAULT 0, difference REAL DEFAULT 0, reason TEXT, user TEXT, purchaseValue REAL DEFAULT 0, saleValue REAL DEFAULT 0)`);
  db.run(`CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY AUTOINCREMENT, storeName TEXT DEFAULT 'HANOUTY DZ', storeAddress TEXT, storePhone TEXT, storeLogo TEXT, currency TEXT DEFAULT 'DA', taxRate REAL DEFAULT 0)`);

log('✅ All tables created');

    // إضافة البيانات الافتراضية
  await addDefaultData();

    // حفظ قاعدة البيانات
  saveDatabase();
  log('✅ Database initialized successfully');
  } catch (error) {
    logError('Database initialization failed: ' + error);
}
}

// ============================================
// 🔹 إضافة البيانات الافتراضية - DEFAULT DATA
// ============================================
async function addDefaultData() {
  try {
// التحقق من الإعدادات
    const settingsCheck = db.exec('SELECT COUNT(*) as count FROM settings');
    if (settingsCheck[0]?.values[0][0] === 0) {
      db.run(`INSERT INTO settings (storeName, storeAddress, storePhone, currency) VALUES ('HANOUTY DZ', '', '', 'DA')`);
log('✅ Default settings added');
    }

// التحقق من الوحدات
    const unitesCheck = db.exec('SELECT COUNT(*) as count FROM unites');
    if (unitesCheck[0]?.values[0][0] === 0) {
      db.run(`INSERT INTO unites (name, abbreviation) VALUES ('Pièce', 'Pce')`);
      db.run(`INSERT INTO unites (name, abbreviation) VALUES ('Kilogramme', 'Kg')`);
      db.run(`INSERT INTO unites (name, abbreviation) VALUES ('Litre', 'L')`);
      db.run(`INSERT INTO unites (name, abbreviation) VALUES ('Mètre', 'M')`);
      db.run(`INSERT INTO unites (name, abbreviation) VALUES ('Boîte', 'Bte')`);
log('✅ Default unites added');
    }

// التحقق من المقاسات
    const taillesCheck = db.exec('SELECT COUNT(*) as count FROM tailles');
    if (taillesCheck[0]?.values[0][0] === 0) {
      const sizes = ['S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42'];
      sizes.forEach(size => {
      db.run(`INSERT INTO tailles (name, abbreviation) VALUES (?, ?)`, [size, size]);
      });
      log('✅ Default tailles added');
    }

// التحقق من العلامات
    const marquesCheck = db.exec('SELECT COUNT(*) as count FROM marques');
    if (marquesCheck[0]?.values[0][0] === 0) {
      db.run(`INSERT INTO marques (name, description) VALUES ('Samsung', 'Électronique')`);
      db.run(`INSERT INTO marques (name, description) VALUES ('Apple', 'Électronique')`);
      db.run(`INSERT INTO marques (name, description) VALUES ('LG', 'Électroménager')`);
      db.run(`INSERT INTO marques (name, description) VALUES ('Générique', 'Marque générale')`);
log('✅ Default marques added');
    }

// التحقق من الفئات
    const categoriesCheck = db.exec('SELECT COUNT(*) as count FROM categories');
    if (categoriesCheck[0]?.values[0][0] === 0) {
      db.run(`INSERT INTO categories (name, description) VALUES ('Général', 'Produits généraux')`);
      db.run(`INSERT INTO categories (name, description) VALUES ('Électronique', 'Appareils électroniques')`);
      db.run(`INSERT INTO categories (name, description) VALUES ('Alimentaire', 'Produits alimentaires')`);
      db.run(`INSERT INTO categories (name, description) VALUES ('Vêtements', 'Habillement')`);
log('✅ Default categories added');
    }

    log('✅ Default data verification completed');
  } catch (error) {
    logError('Default data error: ' + error.message);
  }
}

// ============================================
// 🔹 حفظ قاعدة البيانات - SAVE DATABASE
// ============================================
function saveDatabase() {
  try {
    if (db) {
  const data = db.export();
  fs.writeFileSync(DB_PATH, data);
      log('💾 Database saved to: ' + DB_PATH);
    }
  } catch (error) {
    logError('Database save error: ' + error);
  }
}

// ============================================
// 🔹 تحويل النتائج إلى Array - RESULT CONVERTER
// ============================================
function resultToArray(result) {
  if (!result || result.length === 0) return [];
  const columns = result[0].columns;
  const values = result[0].values;
  return values.map(row => {
    let obj = {};
    columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
}

// ============================================
// 🔹 معلومات الجهاز - MACHINE INFO
// ============================================
ipcMain.handle('get-machine-info', async () => {
  try {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const platform = os.platform();
    const arch = os.arch();
    const hostname = os.hostname();
    
    const rawId = `${platform}-${arch}-${totalMem}-${cpus[0]?.model || 'unknown'}`;
    let hash = 0;
    for (let i = 0; i < rawId.length; i++) {
      const char = rawId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const machineId = Math.abs(hash).toString().substring(0, 10);
    
log('✅ Machine info retrieved: ' + machineId);
    return {
      success: true,
      computerName: hostname,
      machineId: machineId,
      platform: platform,
      arch: arch,
    };
  } catch (error) {
    logError('Get machine info error: ' + error);
    return { success: false, error: error.message };
  }
});

// ============================================
// 🔹 علامة التجريب - TRIAL FLAGS
// ============================================
ipcMain.handle('check-trial-used', async () => {
      const exists = fs.existsSync(TRIAL_FLAG_PATH);
  log(`⏰ Check trial used: ${exists}`);
      return exists;
});

ipcMain.handle('mark-trial-used', async () => {
  try {
        fs.writeFileSync(TRIAL_FLAG_PATH, new Date().toISOString());
log('✅ Trial marked as used');
    return { success: true };
  } catch (error) {
    logError('Mark trial error: ' + error);
    return { success: false };
  }
});

// ============================================
// 🔹 حماية ضد تغيير التاريخ - TIME MANIPULATION CHECK
// ============================================
ipcMain.handle('check-time-manipulation', async () => {
  try {
        const currentTime = new Date().getTime();
    
    if (fs.existsSync(LAST_TIME_PATH)) {
      const lastTime = parseInt(fs.readFileSync(LAST_TIME_PATH, 'utf8'), 10);
      if (currentTime < lastTime) {
        log('⚠️ TIME MANIPULATION DETECTED!');
        return { 
          success: false, 
          manipulated: true,
          message: 'تم اكتشاف تلاعب في تاريخ النظام!' 
        };
      }
    }
    fs.writeFileSync(LAST_TIME_PATH, currentTime.toString());
    return { success: true, manipulated: false };
  } catch (error) {
    logError('Time check error: ' + error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-activation', async (event, activationData) => {
  try {
        const encryptedData = encrypt(JSON.stringify(activationData));
    fs.writeFileSync(ACTIVATION_PATH, encryptedData);
    log('✅ Activation saved (encrypted): ' + ACTIVATION_PATH);
    return { success: true };
  } catch (error) {
    logError('Save activation error: ' + error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-activation', async () => {
  try {
        if (!fs.existsSync(ACTIVATION_PATH)) {
      return { success: false, data: null };
    }
    const encryptedData = fs.readFileSync(ACTIVATION_PATH, 'utf8');
    const decryptedData = decrypt(encryptedData);
    const activationData = JSON.parse(decryptedData);
    log('✅ Activation loaded (decrypted)');
    return { success: true, data: activationData };
  } catch (error) {
    logError('Load activation error: ' + error);
    return { success: false, data: null };
  }
});

ipcMain.handle('delete-activation', async () => {
  try {
        if (fs.existsSync(ACTIVATION_PATH)) {
      fs.unlinkSync(ACTIVATION_PATH);
        log('✅ Activation deleted');
}
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============================================
// 🔹 بيانات التجريب - TRIAL DATA HANDLERS
// ============================================
ipcMain.handle('save-trial-data', async (event, trialData) => {
  try {
    saveTrialData(trialData);
    startTrialHeartbeat();
    return { success: true };
  } catch (error) {
    logError('Save trial data error: ' + error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('check-trial-expiration', async () => {
  try {
    const expired = isTrialExpired();
    return { success: true, expired: expired };
  } catch (error) {
    logError('Check trial expiration error: ' + error);
    return { success: false, error: error.message };
  }
});

// ============================================
// 🔹 المنتجات - PRODUCTS CRUD
// ============================================
ipcMain.handle('get-products', async () => {
try {
  const result = db.exec('SELECT * FROM products ORDER BY id DESC');
  const products = resultToArray(result);
log(`✅ Retrieved ${products.length} products`);
    return products;
  } catch (error) {
    logError('Get products error: ' + error);
    return [];
  }
});

ipcMain.handle('add-product', async (event, product) => {
  try {
const now = new Date().toISOString();
    db.run(`
      INSERT INTO products (
        ref, designation, category, marque, unite, barcode, fournisseur,
        prixAchat, prixVente1, prixVente2, prixVente3, prixGros, remise1, remise2, remise3,
        stock, stockAlerte, stockNecessaire, stockMin, emplacement, image, dateCreation,
        datePeremption, lotNumber, poids, hauteur, largeur, profondeur, notes,
        enBalanceActive, stockActive, permisVente, vetements, estActif,
        taille, nbrColier, prixColis,
        processeur, systeme, stockage, ram, batterie, camera, imei
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      product.ref || '', product.designation || '', product.category || '', product.marque || '', product.unite || '',
      product.barcode || '', product.fournisseur || '', Number(product.prixAchat) || 0, Number(product.prixVente1) || 0,
Number(product.prixVente2) || 0, Number(product.prixVente3) || 0, Number(product.prixGros) || 0, Number(product.remise1) || 0,
Number(product.remise2) || 0, Number(product.remise3) || 0, Number(product.stock) || 0, Number(product.stockAlerte) || 10,
Number(product.stockNecessaire) || 50, Number(product.stockMin) || 5, product.emplacement || '',
      product.image || '', now, product.datePeremption || null,
      product.lotNumber || null, Number(product.poids) || 0, Number(product.hauteur) || 0,
Number(product.largeur) || 0, Number(product.profondeur) || 0, product.notes || '',
      product.enBalanceActive ? 1 : 0, product.stockActive ? 1 : 0,
      product.permisVente ? 1 : 0, product.vetements ? 1 : 0,
      product.estActif ? 1 : 0, product.taille || '', Number(product.nbrColier) || 1, Number(product.prixColis) || 0,
      product.processeur || '', product.systeme || 'ANDROID', product.stockage || '',
      product.ram || '', product.batterie || '', product.camera || '', product.imei || ''
    ]);
    saveDatabase();
log('✅ Product added: ' + product.designation);
    return { success: true };
  } catch (error) {
    logError('Add product error: ' + error);
    throw error;
  }
});

// ✅ تحديث آمن - FIXED UPDATE
ipcMain.handle('update-product', async (event, productData) => {
  try {
console.log('🔄 Update request received for product:', productData.id);

    // ✅ معالجة آمنة للبيانات - SAFE DATA PROCESSING
    const updateParams = [
      productData.ref || '',
      productData.designation || '',
      productData.category || '',
      productData.marque || '',
      productData.unite || '',
      productData.barcode || '',
      productData.fournisseur || '',
      Number(productData.prixAchat) || 0,
      Number(productData.prixVente1) || 0,
      Number(productData.prixVente2) || 0,
      Number(productData.prixVente3) || 0,
      Number(productData.prixGros) || 0,
      Number(productData.remise1) || 0,
      Number(productData.remise2) || 0,
      Number(productData.remise3) || 0,
      Number(productData.stock) || 0,
      Number(productData.stockAlerte) || 10,
      Number(productData.stockNecessaire) || 50,
      Number(productData.stockMin) || 5,
      productData.emplacement || '',
      productData.image || '',
      productData.notes || '',
      productData.enBalanceActive ? 1 : 0,
      productData.stockActive ? 1 : 0,
      productData.permisVente ? 1 : 0,
      productData.vetements ? 1 : 0,
      productData.estActif ? 1 : 0,
      productData.taille || '',
      Number(productData.nbrColier) || 1,
      Number(productData.prixColis) || 0,
      productData.processeur || '',
      productData.systeme || 'ANDROID',
      productData.stockage || '',
      productData.ram || '',
      productData.batterie || '',
      productData.camera || '',
      productData.imei || '',
      Number(productData.id)
    ];

    db.run(`
      UPDATE products SET 
        ref = ?, designation = ?, category = ?, marque = ?, unite = ?, barcode = ?, fournisseur = ?,
        prixAchat = ?, prixVente1 = ?, prixVente2 = ?, prixVente3 = ?, prixGros = ?,
remise1 = ?, remise2 = ?, remise3 = ?,
        stock = ?, stockAlerte = ?, stockNecessaire = ?, stockMin = ?, emplacement = ?, image = ?, notes = ?,
        enBalanceActive = ?, stockActive = ?, permisVente = ?, vetements = ?, estActif = ?, taille = ?, nbrColier = ?, prixColis = ?,
        processeur = ?, systeme = ?, stockage = ?, ram = ?, batterie = ?, camera = ?, imei = ?
      WHERE id = ?
    `, updateParams);

    saveDatabase();
log('✅ Product updated: ' + productData.id + ' | Stock: ' + (Number(productData.stock) || 0));
    return { success: true, message: 'Product updated successfully' };
  } catch (error) {
    logError('Update product error: ' + error.message);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-product', async (event, id) => {
  try {
    db.run('DELETE FROM products WHERE id = ?', [Number(id)]);
    saveDatabase();
log('✅ Product deleted: ' + id);
    return { success: true };
  } catch (error) {
    logError('Delete product error: ' + error);
    throw error;
  }
});

// ============================================
// 🔹 الفئات - CATEGORIES CRUD
// ============================================
ipcMain.handle('get-categories', async () => {
  try {
    const result = db.exec(`
      SELECT c.id, c.name, c.description, COUNT(p.id) as productCount
      FROM categories c
      LEFT JOIN products p ON p.category = c.name
      GROUP BY c.id
      ORDER BY c.name
    `);
    return resultToArray(result);
  } catch (error) {
    logError('Get categories error: ' + error);
    return [];
  }
});

ipcMain.handle('add-category', async (event, category) => {
  try {
    db.run(`INSERT INTO categories (name, description) VALUES (?, ?)`, 
      [category.name || '', category.description || '']);
    saveDatabase();
log('✅ Category added: ' + category.name);
    return { success: true };
  } catch (error) {
    logError('Add category error: ' + error);
    throw error;
  }
});

ipcMain.handle('update-category', async (event, category) => {
  try {
    db.run(`UPDATE categories SET name = ?, description = ? WHERE id = ?`, 
      [category.name || '', category.description || '', Number(category.id)]);
    saveDatabase();
log('✅ Category updated: ' + category.name);
    return { success: true };
  } catch (error) {
    logError('Update category error: ' + error);
    throw error;
  }
});

ipcMain.handle('delete-category', async (event, id) => {
  try {
    db.run('DELETE FROM categories WHERE id = ?', [Number(id)]);
    saveDatabase();
log('✅ Category deleted: ' + id);
    return { success: true };
  } catch (error) {
    logError('Delete category error: ' + error);
    throw error;
  }
});

// ============================================
// 🔹 العلامات - MARQUES CRUD
// ============================================
ipcMain.handle('get-marques', async () => {
  try {
    const result = db.exec(`
      SELECT m.id, m.name, m.description, COUNT(p.id) as productCount
      FROM marques m
      LEFT JOIN products p ON p.marque = m.name
      GROUP BY m.id
      ORDER BY m.name
    `);
    return resultToArray(result);
  } catch (error) {
    logError('Get marques error: ' + error);
    return [];
  }
});

ipcMain.handle('add-marque', async (event, marque) => {
  try {
    db.run(`INSERT INTO marques (name, description) VALUES (?, ?)`, 
      [marque.name || '', marque.description || '']);
    saveDatabase();
log('✅ Marque added: ' + marque.name);
    return { success: true };
  } catch (error) {
    logError('Add marque error: ' + error);
    throw error;
  }
});

ipcMain.handle('update-marque', async (event, marque) => {
  try {
    db.run(`UPDATE marques SET name = ?, description = ? WHERE id = ?`, 
      [marque.name || '', marque.description || '', Number(marque.id)]);
    saveDatabase();
log('✅ Marque updated: ' + marque.name);
    return { success: true };
  } catch (error) {
    logError('Update marque error: ' + error);
    throw error;
  }
});

ipcMain.handle('delete-marque', async (event, id) => {
  try {
    db.run('DELETE FROM marques WHERE id = ?', [Number(id)]);
    saveDatabase();
log('✅ Marque deleted: ' + id);
    return { success: true };
  } catch (error) {
    logError('Delete marque error: ' + error);
    throw error;
  }
});

// ============================================
// 🔹 الوحدات - UNITES CRUD
// ============================================
ipcMain.handle('get-unites', async () => {
  try {
    const result = db.exec(`
      SELECT u.id, u.name, u.abbreviation, COUNT(p.id) as productCount
      FROM unites u
      LEFT JOIN products p ON p.unite = u.name
      GROUP BY u.id
      ORDER BY u.name
    `);
    return resultToArray(result);
  } catch (error) {
    logError('Get unites error: ' + error);
    return [];
  }
});

ipcMain.handle('add-unite', async (event, unite) => {
  try {
    db.run(`INSERT INTO unites (name, abbreviation) VALUES (?, ?)`, 
      [unite.name || '', unite.abbreviation || '']);
    saveDatabase();
log('✅ Unite added: ' + unite.name);
    return { success: true };
  } catch (error) {
    logError('Add unite error: ' + error);
    throw error;
  }
});

ipcMain.handle('update-unite', async (event, unite) => {
  try {
    db.run(`UPDATE unites SET name = ?, abbreviation = ? WHERE id = ?`, 
      [unite.name || '', unite.abbreviation || '', Number(unite.id)]);
    saveDatabase();
log('✅ Unite updated: ' + unite.name);
    return { success: true };
  } catch (error) {
    logError('Update unite error: ' + error);
    throw error;
  }
});

ipcMain.handle('delete-unite', async (event, id) => {
  try {
    db.run('DELETE FROM unites WHERE id = ?', [Number(id)]);
    saveDatabase();
log('✅ Unite deleted: ' + id);
    return { success: true };
  } catch (error) {
    logError('Delete unite error: ' + error);
    throw error;
  }
});

// ============================================
// 🔹 المقاسات - TAILLES CRUD
// ============================================
ipcMain.handle('get-tailles', async () => {
  try {
    const result = db.exec(`
      SELECT t.id, t.name, t.abbreviation, COUNT(p.id) as productCount
      FROM tailles t
      LEFT JOIN products p ON p.taille = t.name
      GROUP BY t.id
      ORDER BY t.name
    `);
    return resultToArray(result);
  } catch (error) {
    logError('Get tailles error: ' + error);
    return [];
  }
});

ipcMain.handle('add-taille', async (event, taille) => {
  try {
    db.run(`INSERT INTO tailles (name, abbreviation) VALUES (?, ?)`, 
      [taille.name || '', taille.abbreviation || '']);
    saveDatabase();
log('✅ Taille added: ' + taille.name);
    return { success: true };
  } catch (error) {
    logError('Add taille error: ' + error);
    throw error;
  }
});

ipcMain.handle('update-taille', async (event, taille) => {
  try {
    db.run(`UPDATE tailles SET name = ?, abbreviation = ? WHERE id = ?`, 
      [taille.name || '', taille.abbreviation || '', Number(taille.id)]);
    saveDatabase();
log('✅ Taille updated: ' + taille.name);
    return { success: true };
  } catch (error) {
    logError('Update taille error: ' + error);
    throw error;
  }
});

ipcMain.handle('delete-taille', async (event, id) => {
  try {
    db.run('DELETE FROM tailles WHERE id = ?', [Number(id)]);
    saveDatabase();
log('✅ Taille deleted: ' + id);
    return { success: true };
  } catch (error) {
    logError('Delete taille error: ' + error);
    throw error;
  }
});

// ============================================
// 🔹 المنتجات المفقودة - LOST PRODUCTS
// ============================================
ipcMain.handle('get-lost-products', async () => {
  try {
    const result = db.exec('SELECT * FROM lost_products ORDER BY date DESC');
    return resultToArray(result);
  } catch (error) {
    logError('Get lost products error: ' + error);
    return [];
  }
});

ipcMain.handle('add-lost-product', async (event, product) => {
  try {
    db.run(`
      INSERT INTO lost_products (productName, quantity, reason, date, estimatedLoss) 
      VALUES (?, ?, ?, ?, ?)
    `, [product.productName || '', Number(product.quantity) || 0, product.reason || '', product.date || new Date().toISOString(), Number(product.estimatedLoss) || 0]);
    saveDatabase();
log('✅ Lost product added: ' + product.productName);
    return { success: true };
  } catch (error) {
    logError('Add lost product error: ' + error);
    throw error;
  }
});

ipcMain.handle('delete-lost-product', async (event, id) => {
  try {
    db.run('DELETE FROM lost_products WHERE id = ?', [Number(id)]);
    saveDatabase();
log('✅ Lost product deleted: ' + id);
    return { success: true };
  } catch (error) {
    logError('Delete lost product error: ' + error);
    throw error;
  }
});

// ============================================
// 🔹 تصحيحات المخزون - STOCK CORRECTIONS
// ============================================
ipcMain.handle('get-stock-corrections', async () => {
  try {
    const result = db.exec('SELECT * FROM stock_corrections ORDER BY date DESC');
    return resultToArray(result);
  } catch (error) {
    logError('Get stock corrections error: ' + error);
    return [];
  }
});

ipcMain.handle('add-stock-correction', async (event, correction) => {
  try {
    db.run(`
      INSERT INTO stock_corrections (date, productId, productName, oldQuantity, newQuantity, difference, reason, user, purchaseValue, saleValue) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      correction.date || new Date().toISOString(),
      Number(correction.productId) || 0,
correction.productName || '',
      Number(correction.oldQuantity) || 0, 
      Number(correction.newQuantity) || 0,
      Number(correction.difference) || 0,
correction.reason || '',
correction.user || '',
      Number(correction.purchaseValue) || 0,
      Number(correction.saleValue) || 0
    ]);
    saveDatabase();
log('✅ Stock correction added for: ' + correction.productName);
    return { success: true };
  } catch (error) {
    logError('Add stock correction error: ' + error);
    throw error;
  }
});

ipcMain.handle('delete-stock-correction', async (event, id) => {
  try {
    db.run('DELETE FROM stock_corrections WHERE id = ?', [Number(id)]);
    saveDatabase();
log('✅ Stock correction deleted: ' + id);
    return { success: true };
  } catch (error) {
    logError('Delete stock correction error: ' + error);
    throw error;
  }
});

// ============================================
// 🔹 الإعدادات - SETTINGS
// ============================================
ipcMain.handle('get-settings', async () => {
  try {
    const result = db.exec('SELECT * FROM settings LIMIT 1');
    const settings = resultToArray(result);
log('✅ Settings loaded');
    return settings.length > 0 ? settings[0] : null;
  } catch (error) {
    logError('Get settings error: ' + error);
    return null;
  }
});

ipcMain.handle('update-settings', async (event, settings) => {
  try {
    db.run(`
      UPDATE settings 
      SET storeName = ?, storeAddress = ?, storePhone = ?, storeLogo = ?, currency = ?, taxRate = ?
      WHERE id = 1
    `, [settings.storeName || '', settings.storeAddress || '', settings.storePhone || '', settings.storeLogo || '', settings.currency || 'DA', Number(settings.taxRate) || 0]);
    saveDatabase();
log('✅ Settings updated');
    return { success: true };
  } catch (error) {
    logError('Update settings error: ' + error);
    throw error;
  }
});

// ============================================
// 🔹 النسخ الاحتياطية - BACKUP & RESTORE
// ============================================
ipcMain.handle('backup-database', async () => {
  try {
        if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupPath = path.join(BACKUP_DIR, `backup_${timestamp}.db`);
    
    if (fs.existsSync(DB_PATH)) {
      fs.copyFileSync(DB_PATH, backupPath);
      const stats = fs.statSync(backupPath);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      const result = db.exec('SELECT COUNT(*) as count FROM products');
      const productCount = result[0]?.values[0][0] || 0;
      
      log('✅ Backup created: ' + backupPath);
      return { 
        success: true, 
        path: backupPath,
        size: fileSizeInMB + ' MB',
        productCount: productCount,
        timestamp: new Date().toLocaleString('fr-FR')
      };
    } else {
      return { success: false, error: 'Database file not found' };
    }
  } catch (error) {
    logError('Backup error: ' + error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('restore-database', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'استعادة النسخة الاحتياطية',
      defaultPath: BACKUP_DIR,
      filters: [{ name: 'Database', extensions: ['db'] }],
      properties: ['openFile']
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, cancelled: true };
    }

    const backupFile = result.filePaths[0];
    const emergencyBackup = path.join(BACKUP_DIR, `emergency_${Date.now()}.db`);
    
    if (fs.existsSync(DB_PATH)) {
      fs.copyFileSync(DB_PATH, emergencyBackup);
    }

    fs.copyFileSync(backupFile, DB_PATH);
    await initDatabase();
    
    log('✅ Database restored from: ' + backupFile);
    return { 
      success: true, 
      message: 'تمت استعادة النسخة الاحتياطية بنجاح!',
      emergencyBackup: emergencyBackup
    };
  } catch (error) {
    logError('Restore error: ' + error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('list-backups', async () => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return [];
    }

    const files = fs.readdirSync(BACKUP_DIR);
    const backups = files
      .filter(file => file.endsWith('.db') && file.startsWith('backup_'))
      .map(file => {
        const fullPath = path.join(BACKUP_DIR, file);
        try {
          const stats = fs.statSync(fullPath);
          return {
            name: file,
            path: fullPath,
            size: stats.size,
            sizeKB: (stats.size / 1024).toFixed(2),
            created: stats.birthtimeMs,
            createdDate: new Date(stats.birthtime).toLocaleString('ar-DZ'),
          };
        } catch (err) {
          logError('Error reading backup file: ' + file);
          return null;
        }
      })
      .filter(item => item !== null)
      .sort((a, b) => b.created - a.created);

    log('✅ Loaded ' + backups.length + ' backups');
    return backups;
  } catch (error) {
    logError('List backups error: ' + error);
    return [];
  }
});

ipcMain.handle('delete-backup', async (event, backupPath) => {
  try {
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
      log('✅ Backup deleted: ' + backupPath);
      return { success: true };
    }
    return { success: false, error: 'Backup file not found' };
  } catch (error) {
    logError('Delete backup error: ' + error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-backup-folder', async () => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    if (process.platform === 'win32') {
      require('child_process').exec(`start "" "${BACKUP_DIR}"`);
    } else if (process.platform === 'darwin') {
      require('child_process').exec(`open "${BACKUP_DIR}"`);
    } else {
      require('child_process').exec(`xdg-open "${BACKUP_DIR}"`);
    }
    
    log('✅ Opened backup folder: ' + BACKUP_DIR);
    return { success: true, path: BACKUP_DIR };
  } catch (error) {
    logError('Open backup folder error: ' + error);
    return { success: false, error: error.message };
  }
});

// ============================================
// 🔹 التحديثات - UPDATES
// ============================================
ipcMain.handle('check-for-updates', async () => {
  try {
const packageJson = require('../../package.json');
    const currentVersion = packageJson.version;
    const updateUrl = 'https://raw.githubusercontent.com/ilyes27dz/hanouty-pos-/main/update.json';
    
    return new Promise((resolve) => {
      https.get(updateUrl, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const updateInfo = JSON.parse(data);
            if (updateInfo.version && updateInfo.version !== currentVersion) {
              log('✅ Update available: ' + updateInfo.version);
              resolve({
                available: true,
                version: updateInfo.version,
                descriptionAr: updateInfo.descriptionAr || 'تحديث جديد متاح',
                descriptionFr: updateInfo.descriptionFr || 'Nouvelle mise à jour disponible',
                downloadUrl: updateInfo.downloadUrl || '',
                releaseDate: updateInfo.releaseDate || new Date().toISOString(),
                changes: updateInfo.changes || []
              });
            } else {
              resolve({ available: false, version: currentVersion });
            }
          } catch (error) {
            resolve({ available: false, version: currentVersion });
          }
        });
      }).on('error', (error) => {
logError('Check updates error: ' + error);
        resolve({ available: false, version: packageJson.version });
      });
    });
  } catch (error) {
logError('Check updates error: ' + error);
    return { available: false, error: error.message };
  }
});

ipcMain.handle('download-update', async (event, downloadUrl) => {
  try {
    if (downloadUrl) {
      shell.openExternal(downloadUrl);
      return { success: true };
    } else {
      return { success: false, error: 'No download URL' };
    }
  } catch (error) {
    logError('Download error: ' + error);
    return { success: false, error: error.message };
  }
});

// ============================================
// 🔹 التحكم بالنافذة - WINDOW CONTROLS
// ============================================
ipcMain.handle('maximize-window', async () => {
  if (mainWindow) {
    mainWindow.setSize(1500, 1000);
    mainWindow.center();
    mainWindow.setResizable(true);
log('✅ Window maximized');
  }
  return { success: true };
});

ipcMain.on('minimize-window', () => {
  if (mainWindow) {
    mainWindow.setResizable(false);
    mainWindow.setSize(500, 700);
    mainWindow.center();
log('✅ Window minimized');
  }
});

ipcMain.on('logout', () => {
  if (mainWindow) {
    mainWindow.setResizable(false);
    mainWindow.setSize(500, 700);
    mainWindow.center();
    setTimeout(() => {
      if (mainWindow) {
        mainWindow.webContents.send('logout-complete');
log('✅ Logout completed');
      }
    }, 150);
  }
});

// ============================================
// 🔹 إغلاق التطبيق - APP CLOSE
// ============================================
ipcMain.on('close-app', () => {
  log('🔴 CLOSE APP - Trial expired signal received');
  saveDatabase();
  if (trialCheckInterval) {
    clearInterval(trialCheckInterval);
  }
  app.quit();
});

ipcMain.handle('quit-app', async () => {
  log('🔴 QUIT APP - User requested close');
  saveDatabase();
  if (trialCheckInterval) {
    clearInterval(trialCheckInterval);
  }
  app.quit();
  return { success: true };
});

// ============================================
// 🔹 إعادة تعيين - RESET EVERYTHING
// ============================================
ipcMain.handle('reset-everything', async () => {
  try {
    if (fs.existsSync(ACTIVATION_PATH)) {
      fs.unlinkSync(ACTIVATION_PATH);
      log('✅ Activation deleted');
    }
    if (fs.existsSync(TRIAL_FLAG_PATH)) {
      fs.unlinkSync(TRIAL_FLAG_PATH);
      log('✅ Trial flag deleted');
    }
    if (fs.existsSync(TRIAL_DATA_PATH)) {
      fs.unlinkSync(TRIAL_DATA_PATH);
      log('✅ Trial data deleted');
    }
    return { success: true, message: 'Reset completed!' };
  } catch (error) {
    logError('Reset error: ' + error);
    return { success: false, error: error.message };
  }
});

// ============================================
// 🔹 دورة حياة التطبيق - APP LIFECYCLE
// ============================================
app.on('ready', async () => {
  log('🚀 App starting...');
  log('📂 USER DATA PATH: ' + USER_DATA_PATH);
  log('📂 DATABASE PATH: ' + DB_PATH);
  
  await initDatabase();
  
  // التحقق من انتهاء التجريب
  if (isTrialExpired()) {
    log('⏰ Trial already expired - blocking app start');
  setTimeout(() => {
      app.quit();
  }, 1000);
    return;
  }
  
  // بدء heartbeat للتحقق من التجريب
  startTrialHeartbeat();
  
  // التحقق من التفعيل
  if (fs.existsSync(ACTIVATION_PATH)) {
    try {
      const encryptedData = fs.readFileSync(ACTIVATION_PATH, 'utf8');
      const decryptedData = decrypt(encryptedData);
      const activationData = JSON.parse(decryptedData);
      
      const cpus = os.cpus();
      const totalMem = os.totalmem();
      const platform = os.platform();
      const arch = os.arch();
      const rawId = `${platform}-${arch}-${totalMem}-${cpus[0]?.model || 'unknown'}`;
      let hash = 0;
      for (let i = 0; i < rawId.length; i++) {
        const char = rawId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      const machineId = Math.abs(hash).toString().substring(0, 10);
      
      if (activationData.machineId !== machineId) {
        log('⚠️ Invalid activation (wrong machine), removing...');
        fs.unlinkSync(ACTIVATION_PATH);
      } else {
        log('✅ Valid activation found');
      }
    } catch (error) {
      logError('Activation check error: ' + error);
      try {
        fs.unlinkSync(ACTIVATION_PATH);
      } catch {}
    }
  }
  
  createWindow();
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 700,
    center: true,
    resizable: false,
    title: 'Hanouty DZ',
    icon: path.join(__dirname, '../../public/icons/favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      sandbox: false,
      enableRemoteModule: false
    },
  });

  const isPackaged = app.isPackaged;

  if (!isPackaged) {
    mainWindow.loadURL('http://localhost:3000');
    if (isDevelopment) {
      mainWindow.webContents.openDevTools();
    }
  } else {
    const publicPath = path.join(__dirname, '../../public');
    const indexPath = path.join(publicPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else {
      const buildPath = path.join(__dirname, '../../build');
      const buildIndexPath = path.join(buildPath, 'index.html');
      if (fs.existsSync(buildIndexPath)) {
        mainWindow.loadFile(buildIndexPath);
      } else {
        log('❌ No index.html found');
        mainWindow.loadURL('http://localhost:3000');
      }
    }
  }

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['script-src \'self\' \'unsafe-inline\' \'unsafe-eval\'']
      }
    });
  });

  mainWindow.on('closed', () => {
saveDatabase();
    if (trialCheckInterval) {
      clearInterval(trialCheckInterval);
    }
    mainWindow = null;
log('✅ Window closed');
  });

  mainWindow.webContents.on('did-finish-load', () => {
    log('✅ Window loaded successfully');
  });
}

app.on('window-all-closed', () => {
saveDatabase();
  if (trialCheckInterval) {
    clearInterval(trialCheckInterval);
  }
  if (process.platform !== 'darwin') {
        app.quit();
  }
log('✅ Window all closed');
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
log('✅ App activated');
});

app.on('before-quit', () => {
  log('💾 Saving database before quit...');
  saveDatabase();
  if (trialCheckInterval) {
    clearInterval(trialCheckInterval);
  }
});

process.on('uncaughtException', (error) => {
  logError('Uncaught Exception: ' + error.message);
});
