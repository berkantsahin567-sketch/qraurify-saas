const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL WARNING: SUPABASE_URL or SUPABASE_KEY environment variables are missing!');
}

const supabase = createClient(supabaseUrl, supabaseKey);

function mapMerchant(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    password: row.password,
    displayName: row.displayname,
    plan: row.plan,
    subscriptionStatus: row.subscriptionstatus,
    subscriptionExpireDate: row.subscriptionexpiredate,
    lastPaymentDate: row.lastpaymentdate,
    customDomain: row.customdomain,
    customDomainStatus: row.customdomainstatus,
    createdAt: row.createdat
  };
}

function mapQr(row) {
  if (!row) return null;
  return {
    id: row.id,
    merchantId: row.merchantid,
    title: row.title,
    shortCode: row.shortcode,
    targetUrl: row.targeturl,
    scanCount: row.scancount || 0,
    brandColor: row.brandcolor,
    logoUrl: row.logourl,
    timeEnabled: !!row.timeenabled,
    timeTargetUrl: row.timetargeturl,
    timeStartHour: row.timestarthour,
    timeEndHour: row.timeendhour,
    passwordEnabled: !!row.passwordenabled,
    qrPassword: row.qrpassword,
    expirationEnabled: !!row.expirationenabled,
    expirationDate: row.expirationdate,
    expirationScanLimit: row.expirationscanlimit,
    expirationFallbackUrl: row.expirationfallbackurl,
    googleAnalyticsId: row.googleanalyticsid,
    facebookPixelId: row.facebookpixelid,
    vcardEnabled: !!row.vcardenabled,
    vcardData: typeof row.vcarddata === 'string' ? JSON.parse(row.vcarddata) : row.vcarddata,
    osRedirectEnabled: !!row.osredirectenabled,
    iosTargetUrl: row.iostargeturl,
    androidTargetUrl: row.androidtargeturl,
    createdAt: row.createdat
  };
}

function mapScan(row) {
  if (!row) return null;
  return {
    id: row.id,
    qrcodeId: row.qrcodeid,
    timestamp: row.timestamp,
    device: row.device,
    referrer: row.referrer,
    country: row.country
  };
}

const db = {
  // Merchant CRUD
  async createMerchant(email, password, displayName) {
    const id = 'mch_' + Math.random().toString(36).substring(2, 11);
    const { data, error } = await supabase
      .from('merchants')
      .insert([{
        id,
        email: email.toLowerCase().trim(),
        password,
        displayname: displayName ? displayName.trim() : '',
        plan: 'free',
        subscriptionstatus: 'active',
        createdat: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return mapMerchant(data);
  },

  async getMerchant(id) {
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    return mapMerchant(data);
  },

  async getMerchantByEmail(email) {
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();
    return mapMerchant(data);
  },

  async saveMerchant(id, updateData) {
    const dbUpdate = {};
    if (updateData.email !== undefined) dbUpdate.email = updateData.email;
    if (updateData.password !== undefined) dbUpdate.password = updateData.password;
    if (updateData.displayName !== undefined) dbUpdate.displayname = updateData.displayName;
    if (updateData.plan !== undefined) dbUpdate.plan = updateData.plan;
    if (updateData.subscriptionStatus !== undefined) dbUpdate.subscriptionstatus = updateData.subscriptionStatus;
    if (updateData.subscriptionExpireDate !== undefined) dbUpdate.subscriptionexpiredate = updateData.subscriptionExpireDate;
    if (updateData.lastPaymentDate !== undefined) dbUpdate.lastpaymentdate = updateData.lastPaymentDate;
    if (updateData.customDomain !== undefined) dbUpdate.customdomain = updateData.customDomain;
    if (updateData.customDomainStatus !== undefined) dbUpdate.customdomainstatus = updateData.customDomainStatus;

    const { data, error } = await supabase
      .from('merchants')
      .update(dbUpdate)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapMerchant(data);
  },

  async deleteMerchant(id) {
    const { error } = await supabase
      .from('merchants')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async getAllMerchants() {
    const { data, error } = await supabase
      .from('merchants')
      .select('*');
    if (error) throw error;
    return data.map(mapMerchant);
  },

  // QR Code CRUD
  async getQrById(id) {
    const { data, error } = await supabase
      .from('qrcodes')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    return mapQr(data);
  },

  async getQrByShortCode(shortCode) {
    const { data, error } = await supabase
      .from('qrcodes')
      .select('*')
      .eq('shortcode', shortCode.toLowerCase().trim())
      .maybeSingle();
    return mapQr(data);
  },

  async getQrsByMerchant(merchantId) {
    const { data, error } = await supabase
      .from('qrcodes')
      .select('*')
      .eq('merchantid', merchantId)
      .order('createdat', { ascending: false });
    if (error) throw error;
    return data.map(mapQr);
  },

  async createQr(merchantId, title, shortCode, targetUrl, brandColor, logoUrl, extraParams = {}) {
    const cleanCode = shortCode.toLowerCase().trim();
    const existing = await this.getQrByShortCode(cleanCode);
    if (existing) {
      throw new Error('This short code is already taken.');
    }

    const id = 'qr_' + Math.random().toString(36).substring(2, 11);
    const { data, error } = await supabase
      .from('qrcodes')
      .insert([{
        id,
        merchantid: merchantId,
        title: title.trim(),
        shortcode: cleanCode,
        targeturl: targetUrl.trim(),
        scancount: 0,
        brandcolor: brandColor || '#7c3aed',
        logourl: logoUrl || '',
        timeenabled: !!extraParams.timeEnabled,
        timetargeturl: extraParams.timeTargetUrl || '',
        timestarthour: extraParams.timeStartHour !== undefined ? Number(extraParams.timeStartHour) : 17,
        timeendhour: extraParams.timeEndHour !== undefined ? Number(extraParams.timeEndHour) : 23,
        passwordenabled: !!extraParams.passwordEnabled,
        qrpassword: extraParams.qrPassword || '',
        expirationenabled: !!extraParams.expirationEnabled,
        expirationdate: extraParams.expirationDate || null,
        expirationscanlimit: extraParams.expirationScanLimit ? Number(extraParams.expirationScanLimit) : null,
        expirationfallbackurl: extraParams.expirationFallbackUrl || '',
        googleanalyticsid: extraParams.googleAnalyticsId || '',
        facebookpixelid: extraParams.facebookPixelId || '',
        vcardenabled: !!extraParams.vcardEnabled,
        vcarddata: extraParams.vcardData || null,
        osredirectenabled: !!extraParams.osRedirectEnabled,
        iostargeturl: extraParams.iosTargetUrl || '',
        androidtargeturl: extraParams.androidTargetUrl || '',
        createdat: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return mapQr(data);
  },

  async updateQr(id, updateData) {
    const qr = await this.getQrById(id);
    if (!qr) throw new Error('QR Code not found.');

    if (updateData.shortCode && updateData.shortCode.toLowerCase().trim() !== qr.shortCode.toLowerCase().trim()) {
      const cleanCode = updateData.shortCode.toLowerCase().trim();
      const existing = await this.getQrByShortCode(cleanCode);
      if (existing) {
        throw new Error('This short code is already taken.');
      }
    }

    const dbUpdate = {};
    if (updateData.title !== undefined) dbUpdate.title = updateData.title;
    if (updateData.shortCode !== undefined) dbUpdate.shortcode = updateData.shortCode.toLowerCase().trim();
    if (updateData.targetUrl !== undefined) dbUpdate.targeturl = updateData.targetUrl;
    if (updateData.brandColor !== undefined) dbUpdate.brandcolor = updateData.brandColor;
    if (updateData.logoUrl !== undefined) dbUpdate.logourl = updateData.logoUrl;
    if (updateData.timeEnabled !== undefined) dbUpdate.timeenabled = !!updateData.timeEnabled;
    if (updateData.timeTargetUrl !== undefined) dbUpdate.timetargeturl = updateData.timeTargetUrl;
    if (updateData.timeStartHour !== undefined) dbUpdate.timestarthour = Number(updateData.timeStartHour);
    if (updateData.timeEndHour !== undefined) dbUpdate.timeendhour = Number(updateData.timeEndHour);
    if (updateData.passwordEnabled !== undefined) dbUpdate.passwordenabled = !!updateData.passwordEnabled;
    if (updateData.qrPassword !== undefined) dbUpdate.qrpassword = updateData.qrPassword;
    if (updateData.expirationEnabled !== undefined) dbUpdate.expirationenabled = !!updateData.expirationEnabled;
    if (updateData.expirationDate !== undefined) dbUpdate.expirationdate = updateData.expirationDate;
    if (updateData.expirationScanLimit !== undefined) dbUpdate.expirationscanlimit = updateData.expirationScanLimit;
    if (updateData.expirationFallbackUrl !== undefined) dbUpdate.expirationfallbackurl = updateData.expirationFallbackUrl;
    if (updateData.googleAnalyticsId !== undefined) dbUpdate.googleanalyticsid = updateData.googleAnalyticsId;
    if (updateData.facebookPixelId !== undefined) dbUpdate.facebookpixelid = updateData.facebookPixelId;
    if (updateData.vcardEnabled !== undefined) dbUpdate.vcardenabled = !!updateData.vcardEnabled;
    if (updateData.vcardData !== undefined) dbUpdate.vcarddata = updateData.vcardData;
    if (updateData.osRedirectEnabled !== undefined) dbUpdate.osredirectenabled = !!updateData.osRedirectEnabled;
    if (updateData.iosTargetUrl !== undefined) dbUpdate.iostargeturl = updateData.iosTargetUrl;
    if (updateData.androidTargetUrl !== undefined) dbUpdate.androidtargeturl = updateData.androidTargetUrl;

    const { data, error } = await supabase
      .from('qrcodes')
      .update(dbUpdate)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapQr(data);
  },

  async deleteQr(id) {
    const { error } = await supabase
      .from('qrcodes')
      .delete()
      .eq('id', id);
    if (error) return false;
    return true;
  },

  // Scan Logging & Analytics
  async logScan(qrcodeId, scanDetail) {
    const currentQr = await this.getQrById(qrcodeId);
    if (currentQr) {
      await supabase
        .from('qrcodes')
        .update({ scancount: (currentQr.scanCount || 0) + 1 })
        .eq('id', qrcodeId);
    }

    const scanId = 'scn_' + Math.random().toString(36).substring(2, 11);
    const { data, error } = await supabase
      .from('scans')
      .insert([{
        id: scanId,
        qrcodeid: qrcodeId,
        timestamp: new Date().toISOString(),
        device: scanDetail.device || 'Desktop',
        referrer: scanDetail.referrer || 'Direct',
        country: scanDetail.country || 'Turkey'
      }])
      .select()
      .single();
    if (error) throw error;
    return mapScan(data);
  },

  async getScansForQr(qrcodeId) {
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('qrcodeid', qrcodeId)
      .order('timestamp', { ascending: false });
    if (error) throw error;
    return data.map(mapScan);
  },

  async getScansForMerchant(merchantId) {
    const { data, error } = await supabase
      .from('scans')
      .select('*, qrcodes!inner(merchantid)')
      .eq('qrcodes.merchantid', merchantId)
      .order('timestamp', { ascending: false });
    if (error) throw error;
    return data.map(mapScan);
  }
};

db.supabase = supabase;
module.exports = db;
