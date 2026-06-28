const fs = require('fs');
const path = require('path');

let DB_PATH = path.join(__dirname, 'data.json');

// Vercel serverless environment compatibility
if (process.env.VERCEL) {
  const tmpPath = path.join('/tmp', 'data.json');
  if (!fs.existsSync(tmpPath)) {
    try {
      const templatePath = path.join(__dirname, 'data.json');
      if (fs.existsSync(templatePath)) {
        fs.copyFileSync(templatePath, tmpPath);
      }
    } catch (e) {
      console.error('Failed to copy pre-seeded database to /tmp:', e);
    }
  }
  DB_PATH = tmpPath;
}

// Initialize database with default structure
function initDb() {
  if (!fs.existsSync(DB_PATH)) {
    const defaultData = {
      merchants: {},
      qrcodes: {},
      scans: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf8');
  }
}

// Read raw data from local JSON file
function readData() {
  initDb();
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file, resetting:', err);
    return { merchants: {}, qrcodes: {}, scans: [] };
  }
}

// Write data to local JSON file
function writeData(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing to database file:', err);
    return false;
  }
}

// Normalize merchant fields to ensure required defaults
function normalizeMerchant(merchant) {
  if (!merchant) return null;
  if (!merchant.subscriptionStatus) merchant.subscriptionStatus = 'active';
  if (!merchant.displayName) merchant.displayName = '';
  return merchant;
}

const db = {
  // Merchant CRUD
  getAllMerchants() {
    const data = readData();
    return Object.values(data.merchants).map(m => normalizeMerchant(m));
  },

  getMerchant(id) {
    const data = readData();
    return normalizeMerchant(data.merchants[id] || null);
  },

  getMerchantByEmail(email) {
    const data = readData();
    const cleanEmail = email.toLowerCase().trim();
    for (const id in data.merchants) {
      if (data.merchants[id].email.toLowerCase().trim() === cleanEmail) {
        return normalizeMerchant(data.merchants[id]);
      }
    }
    return null;
  },

  createMerchant(email, password, displayName = '') {
    const data = readData();
    const cleanEmail = email.toLowerCase().trim();
    
    for (const id in data.merchants) {
      if (data.merchants[id].email.toLowerCase().trim() === cleanEmail) {
        throw new Error('An account with this email already exists.');
      }
    }

    const id = 'mch_' + Math.random().toString(36).substring(2, 11);
    const newMerchant = {
      id,
      email: cleanEmail,
      password, // Simple password string for demo
      displayName: displayName.trim() || cleanEmail.split('@')[0],
      plan: 'free',
      subscriptionStatus: 'active',
      createdAt: new Date().toISOString()
    };

    data.merchants[id] = newMerchant;
    writeData(data);
    return newMerchant;
  },

  saveMerchant(id, updateData) {
    const data = readData();
    if (!data.merchants[id]) return null;

    data.merchants[id] = {
      ...data.merchants[id],
      ...updateData,
      id
    };

    // Ensure subscriptionStatus always exists
    if (!data.merchants[id].subscriptionStatus) {
      data.merchants[id].subscriptionStatus = 'active';
    }

    writeData(data);
    return data.merchants[id];
  },

  deleteMerchant(id) {
    const data = readData();
    if (!data.merchants[id]) return false;

    // Clean all QRs and scans for this merchant
    const merchantQrIds = Object.values(data.qrcodes)
      .filter(qr => qr.merchantId === id)
      .map(qr => qr.id);

    merchantQrIds.forEach(qrId => {
      delete data.qrcodes[qrId];
    });

    data.scans = data.scans.filter(s => !merchantQrIds.includes(s.qrcodeId));
    delete data.merchants[id];
    writeData(data);
    return true;
  },

  // QR Code CRUD
  getQrsByMerchant(merchantId) {
    const data = readData();
    return Object.values(data.qrcodes).filter(qr => qr.merchantId === merchantId);
  },

  getQrByShortCode(shortCode) {
    const data = readData();
    const cleanCode = shortCode.toLowerCase().trim();
    for (const id in data.qrcodes) {
      if (data.qrcodes[id].shortCode.toLowerCase().trim() === cleanCode) {
        return data.qrcodes[id];
      }
    }
    return null;
  },

  getQrById(id) {
    const data = readData();
    return data.qrcodes[id] || null;
  },

  createQr(merchantId, title, shortCode, targetUrl, brandColor, logoUrl, extraParams = {}) {
    const data = readData();
    const cleanCode = shortCode.toLowerCase().trim();

    // Check code availability
    for (const id in data.qrcodes) {
      if (data.qrcodes[id].shortCode.toLowerCase().trim() === cleanCode) {
        throw new Error('This short code is already taken.');
      }
    }

    const id = 'qr_' + Math.random().toString(36).substring(2, 11);
    const newQr = {
      id,
      merchantId,
      title: title.trim(),
      shortCode: cleanCode,
      targetUrl: targetUrl.trim(),
      scanCount: 0,
      brandColor: brandColor || '#7c3aed',
      logoUrl: logoUrl || '',
      timeEnabled: false,
      timeTargetUrl: '',
      timeStartHour: 17,
      timeEndHour: 23,
      passwordEnabled: !!extraParams.passwordEnabled,
      qrPassword: extraParams.qrPassword || '',
      expirationEnabled: !!extraParams.expirationEnabled,
      expirationDate: extraParams.expirationDate || null,
      expirationScanLimit: extraParams.expirationScanLimit ? Number(extraParams.expirationScanLimit) : null,
      expirationFallbackUrl: extraParams.expirationFallbackUrl || '',
      // Option A: Tracking Pixel tags
      googleAnalyticsId: extraParams.googleAnalyticsId || '',
      facebookPixelId: extraParams.facebookPixelId || '',
      // Option B: vCard Landing Page
      vcardEnabled: !!extraParams.vcardEnabled,
      vcardData: extraParams.vcardData || null,
      // Option D: OS-based Redirect
      osRedirectEnabled: !!extraParams.osRedirectEnabled,
      iosTargetUrl: extraParams.iosTargetUrl || '',
      androidTargetUrl: extraParams.androidTargetUrl || '',
      createdAt: new Date().toISOString()
    };

    data.qrcodes[id] = newQr;
    writeData(data);
    return newQr;
  },

  updateQr(id, updateData) {
    const data = readData();
    if (!data.qrcodes[id]) throw new Error('QR Code not found.');

    const qr = data.qrcodes[id];
    
    // If updating shortCode, verify unique
    if (updateData.shortCode && updateData.shortCode.toLowerCase().trim() !== qr.shortCode.toLowerCase().trim()) {
      const cleanCode = updateData.shortCode.toLowerCase().trim();
      for (const qId in data.qrcodes) {
        if (qId !== id && data.qrcodes[qId].shortCode.toLowerCase().trim() === cleanCode) {
          throw new Error('This short code is already taken.');
        }
      }
    }

    data.qrcodes[id] = {
      ...qr,
      ...updateData,
      id,
      merchantId: qr.merchantId // lock merchantId
    };

    writeData(data);
    return data.qrcodes[id];
  },

  deleteQr(id) {
    const data = readData();
    if (!data.qrcodes[id]) return false;

    delete data.qrcodes[id];
    // Clean associated scans to save space
    data.scans = data.scans.filter(s => s.qrcodeId !== id);

    writeData(data);
    return true;
  },

  // Scan Logging & Analytics
  logScan(qrcodeId, scanDetail) {
    const data = readData();
    if (!data.qrcodes[qrcodeId]) return null;

    // Increment QR Code scan counter
    data.qrcodes[qrcodeId].scanCount += 1;

    const scanEntry = {
      id: 'scn_' + Math.random().toString(36).substring(2, 11),
      qrcodeId,
      timestamp: new Date().toISOString(),
      device: scanDetail.device || 'Desktop',
      referrer: scanDetail.referrer || 'Direct',
      country: scanDetail.country || 'Turkey'
    };

    data.scans.push(scanEntry);
    writeData(data);
    return scanEntry;
  },

  getScansForQr(qrcodeId) {
    const data = readData();
    return data.scans.filter(s => s.qrcodeId === qrcodeId);
  },

  getScansForMerchant(merchantId) {
    const data = readData();
    const qrIds = Object.values(data.qrcodes)
      .filter(qr => qr.merchantId === merchantId)
      .map(qr => qr.id);
    
    return data.scans.filter(s => qrIds.includes(s.qrcodeId));
  }
};

module.exports = db;
