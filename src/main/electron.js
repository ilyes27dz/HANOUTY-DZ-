// src/main/electron.js - ✅ النسخة النهائية الكاملة 891+ سطر
const { app, BrowserWindow, ipcMain, shell } = require('electron');
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

// ============================================
// 🔹 نظام التشفير للحماية
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

// ============================================
// 🔹 تهيئة قاعدة البيانات
// ============================================
async function initDatabase() {
  const SQL = await initSqlJs({
    locateFile: file => path.join(__dirname, '../../node_modules/sql.js/dist', file)
  });

  const dbPath = path.join(app.getPath('userData'), 'products.db');
  
  try {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
    console.log('✅ Database loaded from:', dbPath);
  } catch {
    db = new SQL.Database();
    console.log('✅ New database created');
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ref TEXT, 
      designation TEXT NOT NULL, 
      category TEXT, 
      marque TEXT, 
      unite TEXT,
      barcode TEXT, 
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

  try {
    db.run(`ALTER TABLE products ADD COLUMN processeur TEXT`);
    db.run(`ALTER TABLE products ADD COLUMN systeme TEXT DEFAULT 'ANDROID'`);
    db.run(`ALTER TABLE products ADD COLUMN stockage TEXT`);
    db.run(`ALTER TABLE products ADD COLUMN ram TEXT`);
    db.run(`ALTER TABLE products ADD COLUMN batterie TEXT`);
    db.run(`ALTER TABLE products ADD COLUMN camera TEXT`);
    db.run(`ALTER TABLE products ADD COLUMN imei TEXT`);
    console.log('✅ Smartphone columns added');
  } catch (error) {
    console.log('⚠️ Columns already exist');
  }

  db.run(`CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, description TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS marques (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, description TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS unites (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, abbreviation TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS tailles (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, abbreviation TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS lost_products (id INTEGER PRIMARY KEY AUTOINCREMENT, productName TEXT NOT NULL, quantity INTEGER DEFAULT 0, reason TEXT, date TEXT, estimatedLoss REAL DEFAULT 0)`);
  db.run(`CREATE TABLE IF NOT EXISTS stock_corrections (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL, productId INTEGER NOT NULL, productName TEXT NOT NULL, oldQuantity REAL DEFAULT 0, newQuantity REAL DEFAULT 0, difference REAL DEFAULT 0, reason TEXT, user TEXT, purchaseValue REAL DEFAULT 0, saleValue REAL DEFAULT 0)`);
  db.run(`CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY AUTOINCREMENT, storeName TEXT DEFAULT 'HANOUTY DZ', storeAddress TEXT, storePhone TEXT, storeLogo TEXT, currency TEXT DEFAULT 'DA', taxRate REAL DEFAULT 0)`);

  await addDefaultData();
  saveDatabase();
  console.log('✅ Database initialized:', dbPath);
}

async function addDefaultData() {
  try {
    const settingsCheck = db.exec('SELECT COUNT(*) as count FROM settings');
    if (settingsCheck[0]?.values[0][0] === 0) {
      db.run(`INSERT INTO settings (storeName, storeAddress, storePhone, currency) VALUES ('HANOUTY DZ', '', '', 'DA')`);
    }

    const unitesCheck = db.exec('SELECT COUNT(*) as count FROM unites');
    if (unitesCheck[0]?.values[0][0] === 0) {
      db.run(`INSERT INTO unites (name, abbreviation) VALUES ('Pièce', 'Pce')`);
      db.run(`INSERT INTO unites (name, abbreviation) VALUES ('Kilogramme', 'Kg')`);
      db.run(`INSERT INTO unites (name, abbreviation) VALUES ('Litre', 'L')`);
      db.run(`INSERT INTO unites (name, abbreviation) VALUES ('Mètre', 'M')`);
      db.run(`INSERT INTO unites (name, abbreviation) VALUES ('Boîte', 'Bte')`);
    }

    const taillesCheck = db.exec('SELECT COUNT(*) as count FROM tailles');
    if (taillesCheck[0]?.values[0][0] === 0) {
      db.run(`INSERT INTO tailles (name, abbreviation) VALUES ('Small', 'S')`);
      db.run(`INSERT INTO tailles (name, abbreviation) VALUES ('Medium', 'M')`);
      db.run(`INSERT INTO tailles (name, abbreviation) VALUES ('Large', 'L')`);
      db.run(`INSERT INTO tailles (name, abbreviation) VALUES ('Extra Large', 'XL')`);
      db.run(`INSERT INTO tailles (name, abbreviation) VALUES ('XXL', 'XXL')`);
      db.run(`INSERT INTO tailles (name, abbreviation) VALUES ('38', '38')`);
      db.run(`INSERT INTO tailles (name, abbreviation) VALUES ('39', '39')`);
      db.run(`INSERT INTO tailles (name, abbreviation) VALUES ('40', '40')`);
      db.run(`INSERT INTO tailles (name, abbreviation) VALUES ('41', '41')`);
      db.run(`INSERT INTO tailles (name, abbreviation) VALUES ('42', '42')`);
    }

    const marquesCheck = db.exec('SELECT COUNT(*) as count FROM marques');
    if (marquesCheck[0]?.values[0][0] === 0) {
      db.run(`INSERT INTO marques (name, description) VALUES ('Samsung', 'Électronique')`);
      db.run(`INSERT INTO marques (name, description) VALUES ('Apple', 'Électronique')`);
      db.run(`INSERT INTO marques (name, description) VALUES ('LG', 'Électroménager')`);
      db.run(`INSERT INTO marques (name, description) VALUES ('Générique', 'Marque générale')`);
    }

    const categoriesCheck = db.exec('SELECT COUNT(*) as count FROM categories');
    if (categoriesCheck[0]?.values[0][0] === 0) {
      db.run(`INSERT INTO categories (name, description) VALUES ('Général', 'Produits généraux')`);
      db.run(`INSERT INTO categories (name, description) VALUES ('Électronique', 'Appareils électroniques')`);
      db.run(`INSERT INTO categories (name, description) VALUES ('Alimentaire', 'Produits alimentaires')`);
      db.run(`INSERT INTO categories (name, description) VALUES ('Vêtements', 'Habillement')`);
    }

    console.log('✅ Default data added');
  } catch (error) {
    console.error('⚠️ Default data already exists or error:', error.message);
  }
}

function saveDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'products.db');
  const data = db.export();
  fs.writeFileSync(dbPath, data);
}

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
// 🔹 IPC HANDLERS - معلومات الجهاز
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
    
    return {
      success: true,
      computerName: hostname,
      machineId: machineId,
      platform: platform,
      arch: arch,
    };
  } catch (error) {
    console.error('❌ Get machine info error:', error);
    return { success: false, error: error.message };
  }
});

// ============================================
// 🔹 IPC HANDLERS - علامة التجربة الدائمة
// ============================================
ipcMain.handle('check-trial-used', async () => {
  try {
    const trialFlagPath = path.join(app.getPath('userData'), '.trial_used');
    return fs.existsSync(trialFlagPath);
  } catch (error) {
    return false;
  }
});

ipcMain.handle('mark-trial-used', async () => {
  try {
    const trialFlagPath = path.join(app.getPath('userData'), '.trial_used');
    fs.writeFileSync(trialFlagPath, new Date().toISOString());
    return { success: true };
  } catch (error) {
    console.error('❌ Mark trial error:', error);
    return { success: false };
  }
});

// ============================================
// 🔹 حماية ضد تغيير التاريخ
// ============================================
ipcMain.handle('check-time-manipulation', async () => {
  try {
    const lastTimePath = path.join(app.getPath('userData'), '.last_time');
    const currentTime = new Date().getTime();
    
    if (fs.existsSync(lastTimePath)) {
      const lastTime = parseInt(fs.readFileSync(lastTimePath, 'utf8'), 10);
      
      if (currentTime < lastTime) {
        console.log('⚠️ TIME MANIPULATION DETECTED!');
        return { 
          success: false, 
          manipulated: true,
          message: 'تم اكتشاف تلاعب في تاريخ النظام!' 
        };
      }
    }
    
    fs.writeFileSync(lastTimePath, currentTime.toString());
    return { success: true, manipulated: false };
  } catch (error) {
    console.error('❌ Time check error:', error);
    return { success: false, error: error.message };
  }
});

// ============================================
// 🔹 Reset Everything & Quit App
// ============================================
ipcMain.handle('reset-everything', async () => {
  try {
    const userDataPath = app.getPath('userData');
    
    const activationPath = path.join(userDataPath, '.activation');
    if (fs.existsSync(activationPath)) {
      fs.unlinkSync(activationPath);
      console.log('✅ Activation deleted');
    }
    
    const trialFlagPath = path.join(userDataPath, '.trial_used');
    if (fs.existsSync(trialFlagPath)) {
      fs.unlinkSync(trialFlagPath);
      console.log('✅ Trial flag deleted');
    }
    
    return { success: true, message: 'Reset completed!' };
  } catch (error) {
    console.error('❌ Reset error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('quit-app', async () => {
  app.quit();
  return { success: true };
});

// ============================================
// 🔹 IPC HANDLERS - حفظ وتحميل التفعيل المشفر
// ============================================
ipcMain.handle('save-activation', async (event, activationData) => {
  try {
    const activationPath = path.join(app.getPath('userData'), '.activation');
    const encryptedData = encrypt(JSON.stringify(activationData));
    fs.writeFileSync(activationPath, encryptedData);
    console.log('✅ Activation saved (encrypted)');
    return { success: true };
  } catch (error) {
    console.error('❌ Save activation error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-activation', async () => {
  try {
    const activationPath = path.join(app.getPath('userData'), '.activation');
    
    if (!fs.existsSync(activationPath)) {
      return { success: false, data: null };
    }
    
    const encryptedData = fs.readFileSync(activationPath, 'utf8');
    const decryptedData = decrypt(encryptedData);
    const activationData = JSON.parse(decryptedData);
    
    console.log('✅ Activation loaded (decrypted)');
    return { success: true, data: activationData };
  } catch (error) {
    console.error('❌ Load activation error:', error);
    return { success: false, data: null };
  }
});

ipcMain.handle('delete-activation', async () => {
  try {
    const activationPath = path.join(app.getPath('userData'), '.activation');
    if (fs.existsSync(activationPath)) {
      fs.unlinkSync(activationPath);
    }
    console.log('✅ Activation deleted');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============================================
// 🔹 IPC HANDLERS - Products
// ============================================
ipcMain.handle('get-products', async () => {
  const result = db.exec('SELECT * FROM products');
  return resultToArray(result);
});

ipcMain.handle('add-product', async (event, product) => {
  try {
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
      product.ref || '', product.designation, product.category || '', product.marque || '', product.unite || '',
      product.barcode || '', product.fournisseur || '', product.prixAchat || 0, product.prixVente1 || 0,
      product.prixVente2 || 0, product.prixVente3 || 0, product.prixGros || 0, product.remise1 || 0,
      product.remise2 || 0, product.remise3 || 0, product.stock || 0, product.stockAlerte || 10,
      product.stockNecessaire || 50, product.stockMin || 5, product.emplacement || '',
      product.image || '', new Date().toISOString(), product.datePeremption || null,
      product.lotNumber || null, product.poids || 0, product.hauteur || 0,
      product.largeur || 0, product.profondeur || 0, product.notes || '',
      product.enBalanceActive ? 1 : 0, product.stockActive ? 1 : 0,
      product.permisVente ? 1 : 0, product.vetements ? 1 : 0,
      product.estActif ? 1 : 0, product.taille || '', product.nbrColier || 1, product.prixColis || 0,
      product.processeur || '', product.systeme || 'ANDROID', product.stockage || '',
      product.ram || '', product.batterie || '', product.camera || '', product.imei || ''
    ]);
    saveDatabase();
    return { success: true };
  } catch (error) {
    console.error('❌ Add error:', error);
    throw error;
  }
});

ipcMain.handle('update-product', async (event, product) => {
  try {
    db.run(`
      UPDATE products SET 
        ref=?, designation=?, category=?, marque=?, unite=?, barcode=?, fournisseur=?,
        prixAchat=?, prixVente1=?, prixVente2=?, prixVente3=?, prixGros=?, remise1=?, remise2=?, remise3=?,
        stock=?, stockAlerte=?, stockNecessaire=?, stockMin=?, emplacement=?, image=?, notes=?,
        enBalanceActive=?, stockActive=?, permisVente=?, vetements=?, estActif=?, taille=?, nbrColier=?, prixColis=?,
        processeur=?, systeme=?, stockage=?, ram=?, batterie=?, camera=?, imei=?
      WHERE id=?
    `, [
      product.ref || '', product.designation, product.category || '', product.marque || '', product.unite || '',
      product.barcode || '', product.fournisseur || '', product.prixAchat || 0, product.prixVente1 || 0,
      product.prixVente2 || 0, product.prixVente3 || 0, product.prixGros || 0, product.remise1 || 0,
      product.remise2 || 0, product.remise3 || 0, product.stock || 0, product.stockAlerte || 10,
      product.stockNecessaire || 50, product.stockMin || 5, product.emplacement || '', product.image || '',
      product.notes || '', product.enBalanceActive ? 1 : 0, product.stockActive ? 1 : 0,
      product.permisVente ? 1 : 0, product.vetements ? 1 : 0, product.estActif ? 1 : 0,
      product.taille || '', product.nbrColier || 1, product.prixColis || 0,
      product.processeur || '', product.systeme || 'ANDROID', product.stockage || '',
      product.ram || '', product.batterie || '', product.camera || '', product.imei || '',
      product.id
    ]);
    saveDatabase();
    return { success: true };
  } catch (error) {
    console.error('❌ Update error:', error);
    throw error;
  }
});

ipcMain.handle('delete-product', async (event, id) => {
  try {
    db.run('DELETE FROM products WHERE id = ?', [id]);
    saveDatabase();
    return { success: true };
  } catch (error) {
    console.error('❌ Delete error:', error);
    throw error;
  }
});

// ============================================
// 🔹 IPC HANDLERS - Categories
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
    console.error('❌ Get categories error:', error);
    return [];
  }
});

ipcMain.handle('add-category', async (event, category) => {
  try {
    db.run(`INSERT INTO categories (name, description) VALUES (?, ?)`, 
      [category.name, category.description || '']);
    saveDatabase();
    return { success: true };
  } catch (error) {
    console.error('❌ Add category error:', error);
    throw error;
  }
});

ipcMain.handle('update-category', async (event, category) => {
  try {
    db.run(`UPDATE categories SET name = ?, description = ? WHERE id = ?`, 
      [category.name, category.description || '', category.id]);
    saveDatabase();
    return { success: true };
  } catch (error) {
    console.error('❌ Update category error:', error);
    throw error;
  }
});

ipcMain.handle('delete-category', async (event, id) => {
  try {
    db.run('DELETE FROM categories WHERE id = ?', [id]);
    saveDatabase();
    return { success: true };
  } catch (error) {
    console.error('❌ Delete category error:', error);
    throw error;
  }
});

// ============================================
// 🔹 IPC HANDLERS - Marques
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
    console.error('❌ Get marques error:', error);
    return [];
  }
});

ipcMain.handle('add-marque', async (event, marque) => {
  try {
    db.run(`INSERT INTO marques (name, description) VALUES (?, ?)`, 
      [marque.name, marque.description || '']);
    saveDatabase();
    return { success: true };
  } catch (error) {
    console.error('❌ Add marque error:', error);
    throw error;
  }
});

ipcMain.handle('update-marque', async (event, marque) => {
  try {
    db.run(`UPDATE marques SET name = ?, description = ? WHERE id = ?`, 
      [marque.name, marque.description || '', marque.id]);
    saveDatabase();
    return { success: true };
  } catch (error) {
    console.error('❌ Update marque error:', error);
    throw error;
  }
});

ipcMain.handle('delete-marque', async (event, id) => {
  try {
    db.run('DELETE FROM marques WHERE id = ?', [id]);
    saveDatabase();
    return { success: true };
  } catch (error) {
    console.error('❌ Delete marque error:', error);
    throw error;
  }
});

// ============================================
// 🔹 IPC HANDLERS - Unites
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
    console.error('❌ Get unites error:', error);
    return [];
  }
});

ipcMain.handle('add-unite', async (event, unite) => {
  try {
    db.run(`INSERT INTO unites (name, abbreviation) VALUES (?, ?)`, 
      [unite.name, unite.abbreviation || '']);
    saveDatabase();
    return { success: true };
  } catch (error) {
    console.error('❌ Add unite error:', error);
    throw error;
  }
});

ipcMain.handle('update-unite', async (event, unite) => {
  try {
    db.run(`UPDATE unites SET name = ?, abbreviation = ? WHERE id = ?`, 
      [unite.name, unite.abbreviation || '', unite.id]);
    saveDatabase();
    return { success: true };
  } catch (error) {
    console.error('❌ Update unite error:', error);
    throw error;
  }
});

ipcMain.handle('delete-unite', async (event, id) => {
  try {
    db.run('DELETE FROM unites WHERE id = ?', [id]);
    saveDatabase();
    return { success: true };
  } catch (error) {
    console.error('❌ Delete unite error:', error);
    throw error;
  }
});

// ============================================
// 🔹 IPC HANDLERS - Tailles
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
    console.error('❌ Get tailles error:', error);
    return [];
  }
});

ipcMain.handle('add-taille', async (event, taille) => {
  try {
    db.run(`INSERT INTO tailles (name, abbreviation) VALUES (?, ?)`, 
      [taille.name, taille.abbreviation || '']);
    saveDatabase();
    return { success: true };
  } catch (error) {
    console.error('❌ Add taille error:', error);
    throw error;
  }
});

ipcMain.handle('update-taille', async (event, taille) => {
  try {
    db.run(`UPDATE tailles SET name = ?, abbreviation = ? WHERE id = ?`, 
      [taille.name, taille.abbreviation || '', taille.id]);
    saveDatabase();
    return { success: true };
  } catch (error) {
    console.error('❌ Update taille error:', error);
    throw error;
  }
});

ipcMain.handle('delete-taille', async (event, id) => {
  try {
    db.run('DELETE FROM tailles WHERE id = ?', [id]);
    saveDatabase();
    return { success: true };
  } catch (error) {
    console.error('❌ Delete taille error:', error);
    throw error;
  }
});

// ============================================
// 🔹 IPC HANDLERS - Lost Products
// ============================================
ipcMain.handle('get-lost-products', async () => {
  try {
    const result = db.exec('SELECT * FROM lost_products ORDER BY date DESC');
    return resultToArray(result);
  } catch (error) {
    console.error('❌ Get lost products error:', error);
    return [];
  }
});

ipcMain.handle('add-lost-product', async (event, product) => {
  try {
    db.run(`
      INSERT INTO lost_products (productName, quantity, reason, date, estimatedLoss) 
      VALUES (?, ?, ?, ?, ?)
    `, [product.productName, product.quantity, product.reason, product.date, product.estimatedLoss]);
    saveDatabase();
    return { success: true };
  } catch (error) {
    console.error('❌ Add lost product error:', error);
    throw error;
  }
});

ipcMain.handle('delete-lost-product', async (event, id) => {
  try {
    db.run('DELETE FROM lost_products WHERE id = ?', [id]);
    saveDatabase();
    return { success: true };
  } catch (error) {
    console.error('❌ Delete lost product error:', error);
    throw error;
  }
});

// ============================================
// 🔹 IPC HANDLERS - Stock Corrections
// ============================================
ipcMain.handle('get-stock-corrections', async () => {
  try {
    const result = db.exec('SELECT * FROM stock_corrections ORDER BY date DESC');
    return resultToArray(result);
  } catch (error) {
    console.error('❌ Get stock corrections error:', error);
    return [];
  }
});

ipcMain.handle('add-stock-correction', async (event, correction) => {
  try {
    db.run(`
      INSERT INTO stock_corrections (date, productId, productName, oldQuantity, newQuantity, difference, reason, user, purchaseValue, saleValue) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      correction.date, 
      correction.productId, 
      correction.productName, 
      correction.oldQuantity, 
      correction.newQuantity, 
      correction.difference, 
      correction.reason, 
      correction.user, 
      correction.purchaseValue, 
      correction.saleValue
    ]);
    saveDatabase();
    return { success: true };
  } catch (error) {
    console.error('❌ Add stock correction error:', error);
    throw error;
  }
});

ipcMain.handle('delete-stock-correction', async (event, id) => {
  try {
    db.run('DELETE FROM stock_corrections WHERE id = ?', [id]);
    saveDatabase();
    return { success: true };
  } catch (error) {
    console.error('❌ Delete stock correction error:', error);
    throw error;
  }
});

// ============================================
// 🔹 IPC HANDLERS - Settings
// ============================================
ipcMain.handle('get-settings', async () => {
  try {
    const result = db.exec('SELECT * FROM settings LIMIT 1');
    const settings = resultToArray(result);
    return settings.length > 0 ? settings[0] : null;
  } catch (error) {
    console.error('❌ Get settings error:', error);
    return null;
  }
});

ipcMain.handle('update-settings', async (event, settings) => {
  try {
    db.run(`
      UPDATE settings 
      SET storeName = ?, storeAddress = ?, storePhone = ?, storeLogo = ?, currency = ?, taxRate = ?
      WHERE id = 1
    `, [settings.storeName, settings.storeAddress, settings.storePhone, settings.storeLogo, settings.currency, settings.taxRate]);
    saveDatabase();
    return { success: true };
  } catch (error) {
    console.error('❌ Update settings error:', error);
    throw error;
  }
});

// ============================================
// 🔹 IPC HANDLER - النسخ الاحتياطي
// ============================================
ipcMain.handle('backup-database', async () => {
  try {
    const appDataPath = app.getPath('userData');
    const dbPath = path.join(appDataPath, 'products.db');
    const backupDir = path.join(app.getPath('documents'), 'HANOUTY_Backups');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupPath = path.join(backupDir, `backup_${timestamp}.db`);
    
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath);
      const stats = fs.statSync(backupPath);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      const result = db.exec('SELECT COUNT(*) as count FROM products');
      const productCount = result[0]?.values[0][0] || 0;
      
      console.log('✅ Backup created:', backupPath);
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
    console.error('❌ Backup error:', error);
    return { success: false, error: error.message };
  }
});

// ============================================
// 🔹 IPC HANDLER - التحديثات
// ============================================
ipcMain.handle('check-for-updates', async () => {
  try {
    const currentVersion = '1.0.0';
const updateUrl = 'https://raw.githubusercontent.com/ilyes27dz/hanouty-pos-/main/update.json';
    
    return new Promise((resolve) => {
      https.get(updateUrl, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const updateInfo = JSON.parse(data);
            if (updateInfo.version && updateInfo.version !== currentVersion) {
              console.log('✅ Update available:', updateInfo.version);
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
        resolve({ available: false, version: currentVersion });
      });
    });
  } catch (error) {
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
    console.error('❌ Download error:', error);
    return { success: false, error: error.message };
  }
});

// ============================================
// 🔹 Window Controls
// ============================================
// ============================================
// 🔹 Window Controls
// ============================================
ipcMain.handle('maximize-window', async () => {
  if (mainWindow) {
    mainWindow.setSize(1500, 1000);
    mainWindow.center();
    mainWindow.setResizable(true);
  }
  return { success: true };
});



ipcMain.on('minimize-window', () => {
  if (mainWindow) {
    mainWindow.setResizable(false);
    mainWindow.setSize(500, 700);
    mainWindow.center();
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
      }
    }, 150);
  }
});

// ============================================
// 🔹 App Lifecycle مع التحقق من التفعيل
// ============================================
app.on('ready', async () => {
  await initDatabase();
  
  // ✅ التحقق من التفعيل عند البدء
  const activationPath = path.join(app.getPath('userData'), '.activation');
  if (fs.existsSync(activationPath)) {
    try {
      const encryptedData = fs.readFileSync(activationPath, 'utf8');
      const decryptedData = decrypt(encryptedData);
      const activationData = JSON.parse(decryptedData);
      
      // التحقق من Machine ID
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
        console.log('⚠️ Invalid activation (wrong machine), removing...');
        fs.unlinkSync(activationPath);
      } else {
        console.log('✅ Valid activation found');
      }
    } catch (error) {
      console.error('⚠️ Activation check error:', error);
      try {
        fs.unlinkSync(activationPath);
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
    },
  });
  
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['script-src \'self\' \'unsafe-inline\' \'unsafe-eval\'']
      }
    });
  });

  mainWindow.loadURL('http://localhost:3000');
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    saveDatabase();
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
