require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

// Helper: Parse user-agent for basic device type
function getDeviceType(userAgent = '') {
  const ua = userAgent.toLowerCase();
  if (ua.includes('ipad') || ua.includes('tablet')) return 'Tablet';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'Mobile';
  return 'Desktop';
}

// Helper: Parse referer for clean source name
function getReferrerSource(referer = '') {
  if (!referer) return 'Direct';
  const url = referer.toLowerCase();
  if (url.includes('google.com')) return 'Google';
  if (url.includes('instagram.com') || url.includes('t.co') || url.includes('twitter.com') || url.includes('x.com')) return 'Social (X/IG)';
  if (url.includes('facebook.com')) return 'Facebook';
  if (url.includes('linkedin.com')) return 'LinkedIn';
  return 'Other Referrer';
}

// Redirect Route: GET /r/:shortCode
app.get('/r/:shortCode', (req, res) => {
  const shortCode = req.params.shortCode;
  const qr = db.getQrByShortCode(shortCode);
  
  if (!qr) {
    return res.status(404).send(`
      <div style="font-family: sans-serif; text-align: center; padding: 4rem 2rem;">
        <h1 style="color: #ef4444;">404 - QR Code Not Found</h1>
        <p>The short link you followed does not exist on our records.</p>
        <a href="/" style="color: #7c3aed; font-weight: bold; text-decoration: none;">Go to QRAurify Home</a>
      </div>
    `);
  }

  const merchant = db.getMerchant(qr.merchantId);
  if (!merchant) {
    return res.status(404).send('Merchant account not found.');
  }

  // Enforcement: Subscription status check
  if (merchant.subscriptionStatus === 'unpaid' || merchant.subscriptionStatus === 'suspended') {
    return res.redirect('/suspended.html?reason=subscription');
  }

  // Enforcement: Free plan limit check (Max 100 scans cumulative)
  const scans = db.getScansForMerchant(merchant.id);
  if (merchant.plan === 'free' && scans.length >= 100) {
    return res.redirect('/suspended.html?reason=quota');
  }

  // Parse analytics
  const userAgent = req.headers['user-agent'] || '';
  const referer = req.headers['referer'] || '';
  const device = getDeviceType(userAgent);
  const referrer = getReferrerSource(referer);
  
  // Geolocation Mocking (Random selection of Turkey cities for high-fidelity dashboards)
  const cities = ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana'];
  const country = cities[Math.floor(Math.random() * cities.length)];

  // Expiration Rules Check
  if (qr.expirationEnabled) {
    let isExpired = false;
    if (qr.expirationDate && new Date() > new Date(qr.expirationDate)) {
      isExpired = true;
    }
    if (qr.expirationScanLimit && qr.scanCount >= qr.expirationScanLimit) {
      isExpired = true;
    }

    if (isExpired) {
      if (qr.expirationFallbackUrl && qr.expirationFallbackUrl.trim()) {
        db.logScan(qr.id, { device, referrer, country });
        return res.redirect(302, qr.expirationFallbackUrl.trim());
      }
      return res.redirect(302, `/expired.html?code=${shortCode}`);
    }
  }

  // Password Protection Check
  if (qr.passwordEnabled && qr.qrPassword) {
    const pw = req.query.pw;
    if (pw !== qr.qrPassword) {
      return res.redirect(302, `/password.html?code=${shortCode}`);
    }
  }

  // Log scan
  db.logScan(qr.id, { device, referrer, country });

  // Resolve target URL
  let targetUrl = qr.targetUrl;

  // OS-based Redirection
  if (qr.osRedirectEnabled) {
    if (/android/i.test(userAgent) && qr.androidTargetUrl) {
      targetUrl = qr.androidTargetUrl.trim();
    } else if (/ipad|iphone|ipod/i.test(userAgent) && qr.iosTargetUrl) {
      targetUrl = qr.iosTargetUrl.trim();
    }
  }

  // Time-based redirection rules
  if (qr.timeEnabled && qr.timeTargetUrl) {
    const currentHour = new Date().getHours();
    let isTimeActive = false;
    
    const start = Number(qr.timeStartHour) || 0;
    const end = Number(qr.timeEndHour) || 0;
    
    if (start <= end) {
      isTimeActive = currentHour >= start && currentHour < end;
    } else {
      isTimeActive = currentHour >= start || currentHour < end;
    }
    
    if (isTimeActive) {
      targetUrl = qr.timeTargetUrl;
    }
  }

  // vCard Dynamic Page override
  if (qr.vcardEnabled) {
    targetUrl = `/vcard.html?code=${shortCode}`;
  }

  // Tracking Pixel Interstitial check
  const hasPixel = qr.googleAnalyticsId || qr.facebookPixelId;
  if (hasPixel) {
    let trackingScripts = '';
    if (qr.googleAnalyticsId) {
      trackingScripts += `
        <script async src="https://www.googletagmanager.com/gtag/js?id=${qr.googleAnalyticsId}"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${qr.googleAnalyticsId}');
        </script>
      `;
    }
    if (qr.facebookPixelId) {
      trackingScripts += `
        <script>
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${qr.facebookPixelId}');
          fbq('track', 'PageView');
        </script>
        <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${qr.facebookPixelId}&ev=PageView&noscript=1"/></noscript>
      `;
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Redirecting...</title>
        ${trackingScripts}
        <script>
          setTimeout(function() {
            window.location.replace("${targetUrl}");
          }, 150);
        </script>
      </head>
      <body style="margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; background:#0f172a; color:#f8fafc;">
        <div style="width:24px; height:24px; border:3px solid rgba(255,255,255,0.1); border-radius:50%; border-top-color:#8b5cf6; animation:spin 0.6s linear infinite; margin-bottom:12px;"></div>
        <div style="font-size:0.85rem; color:#94a3b8;">Redirecting...</div>
        <style>
          @keyframes spin { to { transform: rotate(360deg); } }
        </style>
      </body>
      </html>
    `);
  } else {
    res.redirect(302, targetUrl);
  }
});

// ─── Authentication APIs ─────────────────────────────────────────────────────

app.post('/api/auth/register', (req, res) => {
  const { email, password, displayName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    const merchant = db.createMerchant(email, password, displayName);
    const { password: _, ...safeMerchant } = merchant;
    res.status(201).json(safeMerchant);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const merchant = db.getMerchantByEmail(email);
  if (!merchant || merchant.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const { password: _, ...safeMerchant } = merchant;
  res.json(safeMerchant);
});

// ─── Merchant Profile APIs ────────────────────────────────────────────────────

// Get merchant details
app.get('/api/merchants/:id', (req, res) => {
  const merchant = db.getMerchant(req.params.id);
  if (!merchant) {
    return res.status(404).json({ error: 'Merchant not found.' });
  }
  const { password: _, ...safeMerchant } = merchant;
  res.json(safeMerchant);
});

// Update profile (displayName only; email update requires password verification)
app.put('/api/merchants/:id/profile', (req, res) => {
  const { displayName } = req.body;
  const merchant = db.getMerchant(req.params.id);
  if (!merchant) return res.status(404).json({ error: 'Merchant not found.' });

  const updateData = {};
  if (displayName !== undefined) updateData.displayName = displayName.trim();

  const updated = db.saveMerchant(merchant.id, updateData);
  const { password: _, ...safeMerchant } = updated;
  res.json(safeMerchant);
});

// Change password
app.post('/api/merchants/:id/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const merchant = db.getMerchant(req.params.id);
  if (!merchant) return res.status(404).json({ error: 'Merchant not found.' });

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both current and new passwords are required.' });
  }
  if (merchant.password !== currentPassword) {
    return res.status(401).json({ error: 'Current password is incorrect.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  const updated = db.saveMerchant(merchant.id, { password: newPassword });
  const { password: _, ...safeMerchant } = updated;
  res.json(safeMerchant);
});

// Delete account
app.delete('/api/merchants/:id', (req, res) => {
  const { password } = req.body;
  const merchant = db.getMerchant(req.params.id);
  if (!merchant) return res.status(404).json({ error: 'Merchant not found.' });
  if (merchant.password !== password) {
    return res.status(401).json({ error: 'Password confirmation is incorrect.' });
  }

  db.deleteMerchant(merchant.id);
  res.json({ success: true });
});

// Upgrade plan
app.post('/api/merchants/:id/upgrade', (req, res) => {
  const { plan } = req.body;
  const targetPlan = ['pro', 'agency'].includes(plan) ? plan : 'pro';
  const merchant = db.getMerchant(req.params.id);
  if (!merchant) {
    return res.status(404).json({ error: 'Merchant not found.' });
  }

  // Calculate subscription expiration (1 month from now)
  const expire = new Date();
  expire.setMonth(expire.getMonth() + 1);

  const updated = db.saveMerchant(merchant.id, {
    plan: targetPlan,
    subscriptionStatus: 'active',
    subscriptionExpireDate: expire.toISOString(),
    lastPaymentDate: new Date().toISOString()
  });
  const { password: _, ...safeMerchant } = updated;
  res.json(safeMerchant);
});

app.get('/api/payment-links', (req, res) => {
  res.json({
    proLink: process.env.SHOPIER_PRO_LINK || 'https://www.shopier.com/ShowProductHTML.php?id=placeholder_pro',
    agencyLink: process.env.SHOPIER_AGENCY_LINK || 'https://www.shopier.com/ShowProductHTML.php?id=placeholder_agency'
  });
});

app.post('/api/payment/shopier-callback', (req, res) => {
  const { platform_order_id, email, payment_status, total_charge, signature } = req.body;
  const apiSecret = process.env.SHOPIER_API_SECRET || 'shopier_secret_key_placeholder';

  if (!email || !platform_order_id || !total_charge || !signature) {
    console.warn('[Shopier Webhook] Missing required parameters in body:', req.body);
    return res.status(400).send('Missing parameters');
  }

  // Verify signature
  const crypto = require('crypto');
  const data = platform_order_id + total_charge;
  const calculatedSignature = crypto
    .createHmac('sha256', apiSecret)
    .update(data)
    .digest('base64');

  if (calculatedSignature !== signature) {
    console.warn(`[Shopier Webhook] Invalid signature from email: ${email}. Computed: ${calculatedSignature}, Received: ${signature}`);
    return res.status(400).send('Invalid signature');
  }

  if (payment_status !== 'success') {
    console.log(`[Shopier Webhook] Payment status is not success for email: ${email}`);
    return res.send('OK');
  }

  // Find merchant
  const merchant = db.getMerchantByEmail(email);
  if (!merchant) {
    console.warn(`[Shopier Webhook] Merchant not found for email: ${email}`);
    return res.status(404).send('Merchant not found');
  }

  // Determine plan based on payment total
  const chargeAmount = parseFloat(total_charge) || 0;
  let targetPlan = 'pro';
  if (chargeAmount >= 750) {
    targetPlan = 'agency';
  }

  // Set subscription expire date to 1 month from now
  const expire = new Date();
  expire.setMonth(expire.getMonth() + 1);

  db.saveMerchant(merchant.id, {
    plan: targetPlan,
    subscriptionStatus: 'active',
    subscriptionExpireDate: expire.toISOString(),
    lastPaymentDate: new Date().toISOString()
  });

  console.log(`[Shopier Webhook] Auto-upgraded merchant ${merchant.email} to plan: ${targetPlan}`);
  res.send('OK');
});



// Toggle subscription status (simulation)
app.post('/api/merchants/:id/subscription-status', (req, res) => {
  const { status } = req.body;
  if (!['active', 'unpaid', 'suspended'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }

  const merchant = db.getMerchant(req.params.id);
  if (!merchant) {
    return res.status(404).json({ error: 'Merchant not found.' });
  }

  const updated = db.saveMerchant(merchant.id, { subscriptionStatus: status });
  const { password: _, ...safeMerchant } = updated;
  res.json(safeMerchant);
});

// Configure Custom Domain
app.post('/api/merchants/:id/custom-domain', (req, res) => {
  const { customDomain } = req.body;
  const merchant = db.getMerchant(req.params.id);
  if (!merchant) return res.status(404).json({ error: 'Merchant not found.' });

  const updated = db.saveMerchant(merchant.id, {
    customDomain: customDomain ? customDomain.trim().toLowerCase() : '',
    customDomainStatus: 'pending'
  });
  const { password: _, ...safeMerchant } = updated;
  res.json(safeMerchant);
});

// Verify Custom Domain DNS (simulation)
app.post('/api/merchants/:id/verify-domain', (req, res) => {
  const merchant = db.getMerchant(req.params.id);
  if (!merchant) return res.status(404).json({ error: 'Merchant not found.' });

  const updated = db.saveMerchant(merchant.id, {
    customDomainStatus: 'active'
  });
  const { password: _, ...safeMerchant } = updated;
  res.json(safeMerchant);
});

// File Upload API (Base64) for QR center logos
app.post('/api/upload', (req, res) => {
  const { fileName, fileData } = req.body;
  if (!fileName || !fileData) {
    return res.status(400).json({ error: 'Missing file data.' });
  }

  try {
    const base64Data = fileData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    const fs = require('fs');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileExt = path.extname(fileName) || '.png';
    const safeName = 'logo_' + Math.random().toString(36).substring(2, 11) + fileExt;
    const savePath = path.join(uploadsDir, safeName);
    
    fs.writeFileSync(savePath, buffer);
    
    res.json({ url: `/uploads/${safeName}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save logo file: ' + err.message });
  }
});



app.get('/api/qr/public-vcard/:shortCode', (req, res) => {
  const shortCode = req.params.shortCode;
  const qr = db.getQrByShortCode(shortCode);
  if (!qr) return res.status(404).json({ error: 'QR Code not found.' });

  const merchant = db.getMerchant(qr.merchantId);
  if (!merchant || merchant.subscriptionStatus === 'suspended' || merchant.subscriptionStatus === 'unpaid') {
    return res.status(403).json({ error: 'Merchant account inactive.' });
  }

  if (!qr.vcardEnabled || !qr.vcardData) {
    return res.status(400).json({ error: 'vCard is not configured for this link.' });
  }

  res.json({
    title: qr.title,
    brandColor: qr.brandColor,
    logoUrl: qr.logoUrl,
    vcardData: qr.vcardData
  });
});

app.get('/api/qr', (req, res) => {
  const { merchantId } = req.query;
  if (!merchantId) {
    return res.status(400).json({ error: 'merchantId parameter is required.' });
  }
  const qrs = db.getQrsByMerchant(merchantId);
  res.json(qrs);
});

app.post('/api/qr', (req, res) => {
  const { 
    merchantId, title, shortCode, targetUrl, brandColor, logoUrl,
    passwordEnabled, qrPassword,
    expirationEnabled, expirationDate, expirationScanLimit, expirationFallbackUrl,
    googleAnalyticsId, facebookPixelId,
    vcardEnabled, vcardData,
    osRedirectEnabled, iosTargetUrl, androidTargetUrl
  } = req.body;
  if (!merchantId || !title || !shortCode || !targetUrl) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  // Validate shortCode format: only alphanumeric, dash, underscore
  if (!/^[a-z0-9_-]+$/i.test(shortCode)) {
    return res.status(400).json({ error: 'Short code can only contain letters, numbers, dashes, and underscores.' });
  }

  const merchant = db.getMerchant(merchantId);
  if (!merchant) {
    return res.status(404).json({ error: 'Merchant account not found.' });
  }

  // Enforcement: Free tier accounts cannot create more than 1 dynamic QR code
  const existingQrs = db.getQrsByMerchant(merchantId);
  if (merchant.plan === 'free' && existingQrs.length >= 1) {
    return res.status(403).json({ error: '🔒 Free tier accounts are limited to 1 dynamic QR. Upgrade to Pro or Agency for unlimited QRs!' });
  }

  const isPaidPlan = merchant.plan === 'pro' || merchant.plan === 'agency';

  // Enforcement: Block custom branding colors/logos if merchant is not Pro/Agency
  if (!isPaidPlan && (brandColor !== undefined || logoUrl !== undefined)) {
    return res.status(403).json({ error: '🔒 Custom branding colors and logos require a Pro subscription.' });
  }

  // Enforcement: Block OS-based redirects if merchant is not Agency
  if (osRedirectEnabled && merchant.plan !== 'agency') {
    return res.status(403).json({ error: '🔒 Device OS-based smart routing requires an Agency subscription.' });
  }

  // Enforcement: Block password, expiration, pixel tracking, and vCard options if not Pro/Agency
  if (!isPaidPlan && (passwordEnabled || expirationEnabled || googleAnalyticsId || facebookPixelId || vcardEnabled)) {
    return res.status(403).json({ error: '🔒 Tracking pixels, vCard profiles, password protection, and expiration rules require a Pro subscription.' });
  }

  try {
    const newQr = db.createQr(merchantId, title, shortCode, targetUrl, brandColor, logoUrl, {
      passwordEnabled,
      qrPassword,
      expirationEnabled,
      expirationDate,
      expirationScanLimit,
      expirationFallbackUrl,
      googleAnalyticsId,
      facebookPixelId,
      vcardEnabled,
      vcardData,
      osRedirectEnabled,
      iosTargetUrl,
      androidTargetUrl
    });
    res.status(201).json(newQr);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Bulk Dynamic QR Creator Endpoint
app.post('/api/qr/bulk', (req, res) => {
  const { merchantId, csvData } = req.body;
  if (!merchantId || !csvData) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  const merchant = db.getMerchant(merchantId);
  if (!merchant) {
    return res.status(404).json({ error: 'Merchant account not found.' });
  }

  // Only Pro and Agency plans can bulk create
  if (merchant.plan === 'free') {
    return res.status(403).json({ error: '🔒 Free tier accounts are limited to 1 dynamic QR code. Bulk creation is a Pro/Agency feature.' });
  }

  const existingQrs = db.getQrsByMerchant(merchantId);
  const lines = csvData.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const results = [];
  const errors = [];

  for (let line of lines) {
    const parts = line.split(',').map(p => p.trim());
    if (parts.length < 3) {
      errors.push(`Line skipped (format must be Title,ShortCode,URL): "${line}"`);
      continue;
    }
    const [title, shortCode, targetUrl] = parts;
    if (!/^[a-z0-9_-]+$/i.test(shortCode)) {
      errors.push(`Invalid short code "${shortCode}" — only letters, numbers, dashes, underscores allowed.`);
      continue;
    }
    try {
      const newQr = db.createQr(merchantId, title, shortCode, targetUrl);
      results.push(newQr);
    } catch (err) {
      errors.push(`Error creating "${title}" (${shortCode}): ${err.message}`);
    }
  }

  res.json({ success: true, created: results, errors });
});

app.put('/api/qr/:id', (req, res) => {
  const qrId = req.params.id;
  const qr = db.getQrById(qrId);
  if (!qr) {
    return res.status(404).json({ error: 'QR Code not found.' });
  }

  const { 
    title, shortCode, targetUrl, brandColor, logoUrl, 
    timeEnabled, timeTargetUrl, timeStartHour, timeEndHour,
    passwordEnabled, qrPassword,
    expirationEnabled, expirationDate, expirationScanLimit, expirationFallbackUrl,
    googleAnalyticsId, facebookPixelId,
    vcardEnabled, vcardData,
    osRedirectEnabled, iosTargetUrl, androidTargetUrl
  } = req.body;
  
  const merchant = db.getMerchant(qr.merchantId);
  const isPaidPlan = merchant.plan === 'pro' || merchant.plan === 'agency';

  // Validate shortCode if provided
  if (shortCode && !/^[a-z0-9_-]+$/i.test(shortCode)) {
    return res.status(400).json({ error: 'Short code can only contain letters, numbers, dashes, and underscores.' });
  }

  // Enforcement: Block custom branding colors/logos if merchant is not Pro/Agency
  if (!isPaidPlan && (brandColor !== undefined || logoUrl !== undefined)) {
    return res.status(403).json({ error: '🔒 Custom branding colors and logos require a Pro subscription.' });
  }

  // Enforcement: Block time-based redirect features if merchant is not Pro/Agency
  if (!isPaidPlan && (timeEnabled !== undefined || timeTargetUrl !== undefined || timeStartHour !== undefined || timeEndHour !== undefined)) {
    return res.status(403).json({ error: '🔒 Time-based redirections require a Pro subscription.' });
  }

  // Enforcement: Block OS-based redirects if merchant is not Agency
  if (osRedirectEnabled !== undefined && merchant.plan !== 'agency') {
    return res.status(403).json({ error: '🔒 Device OS-based smart routing requires an Agency subscription.' });
  }

  // Enforcement: Block password, expiration, pixel tracking, and vCard options if not Pro/Agency
  if (!isPaidPlan && (
    passwordEnabled !== undefined || expirationEnabled !== undefined || 
    googleAnalyticsId !== undefined || facebookPixelId !== undefined || 
    vcardEnabled !== undefined
  )) {
    return res.status(403).json({ error: '🔒 Tracking pixels, vCard profiles, password protection, and expiration rules require a Pro subscription.' });
  }

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (shortCode !== undefined) updateData.shortCode = shortCode;
  if (targetUrl !== undefined) updateData.targetUrl = targetUrl;
  if (brandColor !== undefined) updateData.brandColor = brandColor;
  if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
  if (timeEnabled !== undefined) updateData.timeEnabled = !!timeEnabled;
  if (timeTargetUrl !== undefined) updateData.timeTargetUrl = timeTargetUrl;
  if (timeStartHour !== undefined) updateData.timeStartHour = Number(timeStartHour) || 0;
  if (timeEndHour !== undefined) updateData.timeEndHour = Number(timeEndHour) || 0;
  if (passwordEnabled !== undefined) updateData.passwordEnabled = !!passwordEnabled;
  if (qrPassword !== undefined) updateData.qrPassword = qrPassword;
  if (expirationEnabled !== undefined) updateData.expirationEnabled = !!expirationEnabled;
  if (expirationDate !== undefined) updateData.expirationDate = expirationDate;
  if (expirationScanLimit !== undefined) updateData.expirationScanLimit = expirationScanLimit ? Number(expirationScanLimit) : null;
  if (expirationFallbackUrl !== undefined) updateData.expirationFallbackUrl = expirationFallbackUrl;
  if (googleAnalyticsId !== undefined) updateData.googleAnalyticsId = googleAnalyticsId;
  if (facebookPixelId !== undefined) updateData.facebookPixelId = facebookPixelId;
  if (vcardEnabled !== undefined) updateData.vcardEnabled = !!vcardEnabled;
  if (vcardData !== undefined) updateData.vcardData = vcardData;
  if (osRedirectEnabled !== undefined) updateData.osRedirectEnabled = !!osRedirectEnabled;
  if (iosTargetUrl !== undefined) updateData.iosTargetUrl = iosTargetUrl;
  if (androidTargetUrl !== undefined) updateData.androidTargetUrl = androidTargetUrl;

  try {
    const updated = db.updateQr(qrId, updateData);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/qr/:id', (req, res) => {
  const success = db.deleteQr(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'QR Code not found.' });
  }
  res.json({ success: true });
});

// ─── Analytics API ────────────────────────────────────────────────────────────

app.get('/api/merchants/:id/analytics', (req, res) => {
  const merchantId = req.params.id;
  const allScans = req.query.all === 'true';
  const merchant = db.getMerchant(merchantId);
  if (!merchant) {
    return res.status(404).json({ error: 'Merchant not found.' });
  }

  const qrs = db.getQrsByMerchant(merchantId);
  const scans = db.getScansForMerchant(merchantId);

  // Compile counts by device
  const deviceCounts = { Mobile: 0, Desktop: 0, Tablet: 0 };
  // Compile counts by referrer
  const referrerCounts = { Direct: 0, Google: 0, 'Social (X/IG)': 0, Facebook: 0, LinkedIn: 0, 'Other Referrer': 0 };
  
  scans.forEach(s => {
    if (deviceCounts[s.device] !== undefined) deviceCounts[s.device]++;
    if (referrerCounts[s.referrer] !== undefined) referrerCounts[s.referrer]++;
  });

  // Map scans with QR title for output
  const enrichedScans = scans.slice().reverse().map(s => {
    const parentQr = qrs.find(q => q.id === s.qrcodeId);
    return {
      ...s,
      qrTitle: parentQr ? parentQr.title : 'Deleted Code'
    };
  });

  res.json({
    totalQrs: qrs.length,
    totalScans: scans.length,
    deviceBreakdown: deviceCounts,
    referrerBreakdown: referrerCounts,
    recentScans: enrichedScans.slice(0, 10),    // last 10 for table display
    allScans: allScans ? enrichedScans : undefined  // all scans for CSV export
  });
});

// ─── Admin APIs ──────────────────────────────────────────────────────────────

let activeAdminToken = null;

function requireAdminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Yetkisiz erişim. Lütfen giriş yapın.' });
  }
  const token = authHeader.split(' ')[1];
  if (!activeAdminToken || token !== activeAdminToken) {
    return res.status(401).json({ error: 'Oturum süresi dolmuş veya geçersiz.' });
  }
  next();
}

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const envUser = process.env.ADMIN_USERNAME || 'admin';
  const envPass = process.env.ADMIN_PASSWORD || 'adminpassword123';
  
  if (username === envUser && password === envPass) {
    activeAdminToken = 'adm_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return res.json({ success: true, token: activeAdminToken });
  }
  
  res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
});

app.get('/api/admin/check-session', requireAdminAuth, (req, res) => {
  res.json({ success: true });
});

app.get('/api/admin/merchants', requireAdminAuth, (req, res) => {
  try {
    const merchants = db.getAllMerchants();
    const safeMerchants = merchants.map(m => {
      const { password, ...safe } = m;
      return safe;
    });
    res.json(safeMerchants);
  } catch (err) {
    res.status(500).json({ error: 'Merchant verileri alınamadı: ' + err.message });
  }
});

app.put('/api/admin/merchants/:id', requireAdminAuth, (req, res) => {
  const { plan, subscriptionStatus } = req.body;
  const merchantId = req.params.id;
  
  const merchant = db.getMerchant(merchantId);
  if (!merchant) {
    return res.status(404).json({ error: 'Merchant not found.' });
  }
  
  const updateData = {};
  if (plan !== undefined) {
    updateData.plan = ['free', 'pro', 'agency'].includes(plan) ? plan : 'free';
    if (updateData.plan === 'free') {
      updateData.subscriptionExpireDate = null;
    } else if (merchant.plan === 'free') {
      // Free -> Paid transition: auto set expire date to 1 month from now
      const expire = new Date();
      expire.setMonth(expire.getMonth() + 1);
      updateData.subscriptionExpireDate = expire.toISOString();
    }
  }
  if (subscriptionStatus !== undefined) {
    updateData.subscriptionStatus = ['active', 'unpaid', 'suspended'].includes(subscriptionStatus) ? subscriptionStatus : 'active';
  }
  
  try {
    const updated = db.saveMerchant(merchantId, updateData);
    const { password, ...safeMerchant } = updated;
    res.json(safeMerchant);
  } catch (err) {
    res.status(500).json({ error: 'Merchant güncellenemedi: ' + err.message });
  }
});

app.delete('/api/admin/merchants/:id', requireAdminAuth, (req, res) => {
  const merchantId = req.params.id;
  const merchant = db.getMerchant(merchantId);
  if (!merchant) {
    return res.status(404).json({ error: 'Merchant not found.' });
  }
  
  try {
    db.deleteMerchant(merchantId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Merchant silinemedi: ' + err.message });
  }
});

// ─── Fallback routing ─────────────────────────────────────────────────────────

app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/r/') || req.url.includes('.')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Automated Subscription Expiry Downgrader
function checkSubscribers() {
  try {
    const merchants = db.getAllMerchants();
    const now = new Date();
    merchants.forEach(m => {
      if (m.plan !== 'free') {
        if (m.subscriptionExpireDate) {
          const expire = new Date(m.subscriptionExpireDate);
          if (now > expire) {
            console.log(`[Subscription Manager] Expiry hit for ${m.email}. Downgrading ${m.plan} to free.`);
            db.saveMerchant(m.id, {
              plan: 'free',
              subscriptionStatus: 'active',
              subscriptionExpireDate: null
            });
          }
        } else {
          // Fallback: If on a paid plan but no expire date exists, initialize it to 1 month from registration
          const regDate = m.createdAt ? new Date(m.createdAt) : new Date();
          const expire = new Date(regDate);
          expire.setMonth(expire.getMonth() + 1);
          db.saveMerchant(m.id, {
            subscriptionExpireDate: expire.toISOString()
          });
        }
      }
    });
  } catch (err) {
    console.error('Error running checkSubscribers:', err);
  }
}

// Launch server
app.listen(PORT, () => {
  console.log(`QRAurify server running at http://localhost:${PORT}`);
  // Run on startup
  checkSubscribers();
  // Run every hour
  setInterval(checkSubscribers, 60 * 60 * 1000);
});

module.exports = app;
