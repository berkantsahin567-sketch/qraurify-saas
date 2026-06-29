// ─── Global State ─────────────────────────────────────────────────────────────
let currentMerchant = null;
let activeQrList = [];
let currentLang = 'tr';
let creatorMode = 'single'; // 'single' or 'bulk'
let paymentLinks = null;
// Helper: Check if merchant is on a paid plan (Pro or Agency)
function isPaidPlan() {
  return currentMerchant && (currentMerchant.plan === 'pro' || currentMerchant.plan === 'agency');
}

// ─── Translation Dictionary ───────────────────────────────────────────────────
const translations = {
  en: {
    "side-overview": "Overview",
    "side-codes": "My QR Codes",
    "side-billing": "Billing & Plan",
    "side-up-title": "Upgrade to Pro",
    "side-up-desc": "Unlock unlimited scans & customizable QR colors.",
    "side-up-btn": "Subscribe - 500 TL/mo",
    "side-pro-title": "⚡ Pro Plan Active",
    "side-pro-desc": "Unlimited scans and customized QR codes.",
    "free-plan": "Free Plan",
    "btn-logout": "Log Out",
    "title-overview": "Overview",
    "desc-overview": "Track scans and manage redirects instantly.",
    "title-codes": "My QR Codes",
    "desc-codes": "Manage your dynamic redirects and download codes.",
    "title-billing": "Billing & Plan",
    "desc-billing": "Review your subscription status and limits.",
    "kpi-qrs": "Dynamic QR Codes",
    "kpi-qrs-desc": "Active dynamic links created",
    "kpi-scans": "Total Redirect Scans",
    "kpi-scans-desc": "Redirect scans across all QRs",
    "kpi-savings": "Savings vs Reprinting",
    "kpi-savings-desc": "Calculated at 850 TL average reprint cost",
    "chart-device": "Device Breakdown",
    "chart-source": "Referrer Sources",
    "tbl-title": "Recent Scan Activity",
    "th-time": "Time",
    "th-qr": "QR Code",
    "th-dev": "Device",
    "th-ref": "Referrer",
    "th-loc": "Location",
    "tbl-empty": "No scans recorded yet. Generate a QR code and scan it to see live updates!",
    "c-title": "Create a Dynamic QR Code",
    "c-desc": "The short code link remains permanent, while you can swap target URLs instantly.",
    "label-title": "QR Title (Reference)",
    "label-slug": "Short Code Slug",
    "label-target": "Destination URL",
    "btn-create-code": "Create Code",
    "active-qr-header": "Active QR Codes",
    "b-title": "Subscription Summary",
    "b-plan": "Current Plan:",
    "b-scans": "Monthly Redirect Limit:",
    "b-qrs": "Dynamic QR Codes Limit:",
    "b-sub-status": "Payment Status:",
    "b-expire-date": "Next Renewal Date:",
    "b-up-title": "Upgrade to QRAurify Pro",
    "b-up-desc": "Unlock unlimited codes, unlimited scans, and custom branding for just 500 TL/month.",
    "b-up-btn": "Upgrade Now",
    "b-up-active": "⚡ Pro Plan active. Thank you for your support!",
    "e-title": "Edit QR Code Settings",
    "e-desc": "Modify the dynamic properties of your link instantly.",
    "e-pro-title": "QR Code Styling (Pro Only)",
    "e-label-color": "Foreground Color",
    "e-label-logo": "Center Logo Image",
    "btn-upload-file": "Choose File",
    "e-pro-lock": "🔒 Colors and Logo overlays require Pro plan.",
    "btn-save-changes": "Save Changes",
    "up-title": "Upgrade to QRAurify",
    "up-desc": "Unlock unlimited scans, dynamic links, and logos.",
    "chk-header": "🔒 Secure Checkout",
    "chk-item": "QRAurify Pro Monthly Subscription",
    "chk-label-email": "Billing Email",
    "chk-label-tier": "Select Plan Tier",
    "chk-label-card": "Card Details",
    "chk-btn": "Proceed to Payment",
    "chk-footer": "Payments are securely processed via Shopier.",
    "opt-pro": "Pro Plan - 500.00 TL / month",
    "opt-agency": "Agency Plan - 1000.00 TL / month",
    "sim-title": "Billing & Subscription Simulator",
    "sim-desc": "Simulate subscription payment issues to test QR redirection lockouts.",
    "btn-sim-fail": "Simulate Payment Failure",
    "btn-sim-success": "Simulate Payment Success",
    
    // JS Alerts & Messages
    "alert-qr-created": "Dynamic QR code generated successfully!",
    "alert-upgrade-success": "⚡ Upgrade successful! QRAurify plan is now active on your account.",
    "confirm-delete-qr": "⚠️ Are you sure you want to delete \"{title}\"? \nThis will instantly break all printed copies and QR codes associated with it!",
    "alert-qr-deleted": "QR Code deleted successfully.",
    "alert-settings-saved": "QR Code settings updated.",
    "alert-link-copied": "Short link copied to clipboard!",
    "text-short-link": "Short Link:",
    "text-redirect-target": "Redirect Target:",
    "btn-edit": "Edit Settings",
    "btn-download": "Download PNG",
    "btn-delete": "Delete",
    "quota-free-banner": "Scans Count: {count} / 100 limit",
    "empty-qrs": "No dynamic QR codes found. Use the creator box above to generate your first redirect link!",
    
    // New Feature Keys (Bilingual)
    "btn-bulk-mode": "Switch to Bulk Create",
    "btn-single-mode": "Switch to Single Create",
    "c-bulk-title": "Bulk Create QR Codes",
    "c-bulk-desc": "Create multiple dynamic redirects at once by pasting CSV data.",
    "label-bulk-csv": "CSV Data (Format: Title, ShortCode, DestinationURL - One per line)",
    "btn-bulk-create": "Create Bulk QRs",
    "e-time-title": "Time-Based Smart Redirection (Pro Only)",
    "e-label-time-enable": "Enable alternate link based on time",
    "e-label-time-target": "Alternative Destination URL (Active Hours)",
    "e-label-time-start": "Start Hour (0-23)",
    "e-label-time-end": "End Hour (0-23)",
    "e-time-pro-lock": "🔒 Time-based redirect requires Pro plan.",
    "e-bulk-pro-lock": "🔒 Bulk creation requires a Pro or Agency subscription.",
    "btn-print-tent": "Print Table Tent",
    "alert-bulk-success": "Bulk creation completed! Created: {success} codes. Errors: {error}.",
    "btn-export-csv": "Export CSV",
    "btn-print-svg": "SVG Download",
    "dom-title": "Agency Custom Domain",
    "dom-desc": "Route your QR codes through your own brand domain instead of qraurify.com.",
    "dom-instructions": "DNS Setup Instructions:",
    "dom-dns-text": "Add a CNAME record in your DNS provider pointing your subdomain (e.g. <code>qr.mybrand.com</code>) to <code>cname.qraurify.com</code>.",
    "label-domain": "Custom Domain Subdomain",
    "btn-save-domain": "Configure",
    "dom-status-label": "Status:",
    "btn-verify-domain": "Verify DNS",
    "creator-style-title": "QR Code Design & Logo (Optional)",
    "dropdown-profile-label": "My Profile",
    "creator-password-title": "Password Protection (Optional)",
    "label-password-enable": "Enable Password Protection",
    "label-qr-password": "Access Password",
    "creator-expiration-title": "Expiration Rules (Optional)",
    "label-expiration-enable": "Enable Expiration Rules",
    "label-expiration-date": "Expiration Date",
    "label-expiration-scans": "Scan Limit",
    "label-expiration-fallback": "Alternative Fallback URL (Optional)",
    "warn-pro-lock": "🔒 Password protection and Expiration rules require a Pro subscription.",
    "edit-password-section-title": "Password Protection (Pro Only)",
    "edit-expiration-section-title": "Expiration Rules (Pro Only)",
    "creator-tracking-title": "Analytics Tracking (Optional)",
    "creator-vcard-title": "vCard Profile (Optional)",
    "creator-os-title": "Device OS Redirection (Optional)",
    "label-vcard-enable": "Enable vCard Profile Link",
    "label-os-enable": "Enable Device OS Redirection",
    "edit-tracking-section-title": "Piksel Takibi (Pro Only)",
    "edit-vcard-section-title": "Dijital Kartvizit (Pro Only)",
    "edit-os-section-title": "Cihaz OS Yönlendirmesi (Agency Only)",
    "warn-agency-lock": "🔒 OS-based smart routing requires Agency subscription.",
    
    // Additional Translation Keys for complete coverage
    "label-ga-id": "Google Analytics Measurement ID",
    "label-fb-id": "Facebook Pixel ID",
    "label-vcard-name": "Full Name",
    "label-vcard-title": "Job Title",
    "label-vcard-company": "Company Name",
    "label-vcard-phone": "Phone Number",
    "label-vcard-email": "Email Address",
    "label-vcard-website": "Website",
    "label-vcard-address": "Address",
    "label-vcard-instagram": "Instagram",
    "label-vcard-facebook": "Facebook",
    "label-vcard-linkedin": "LinkedIn",
    "label-vcard-twitter": "Twitter / X",
    "label-ios-url": "iOS Target URL (App Store)",
    "label-android-url": "Android Target URL (Google Play)",
    "label-social-accounts": "Social Accounts (Username or Link)"
  },
  tr: {
    "side-overview": "Genel Bakış",
    "side-codes": "QR Kodlarım",
    "side-billing": "Paket & Faturalandırma",
    "side-up-title": "Pro Plana Yükselt",
    "side-up-desc": "Sınırsız tarama ve özel QR renklerinin kilidini açın.",
    "side-up-btn": "Abone Ol - 500 TL/ay",
    "side-pro-title": "⚡ Pro Plan Aktif",
    "side-pro-desc": "Sınırsız tarama ve özelleştirilmiş QR kodları.",
    "free-plan": "Ücretsiz Paket",
    "btn-logout": "Çıkış Yap",
    "title-overview": "Genel Bakış",
    "desc-overview": "Tarama istatistiklerini takip edin ve yönlendirmeleri anında güncelleyin.",
    "title-codes": "QR Kodlarım",
    "desc-codes": "Dinamik yönlendirmelerinizi yönetin ve QR kodları indirin.",
    "title-billing": "Paket & Faturalandırma",
    "desc-billing": "Abonelik durumunuzu ve tarama limitlerinizi inceleyin.",
    "kpi-qrs": "Dinamik QR Kodları",
    "kpi-qrs-desc": "Aktif oluşturulan dinamik linkler",
    "kpi-scans": "Toplam Yönlendirme",
    "kpi-scans-desc": "Tüm QR kodların toplam taranma sayısı",
    "kpi-savings": "Baskı Tasarrufu",
    "kpi-savings-desc": "QR başına ortalama 850 TL yenileme masrafıyla hesaplanır",
    "chart-device": "Cihaz Dağılımı",
    "chart-source": "Yönlendiren Kaynaklar",
    "tbl-title": "Son Tarama Aktiviteleri",
    "th-time": "Zaman",
    "th-qr": "QR Kodu",
    "th-dev": "Cihaz",
    "th-ref": "Kaynak",
    "th-loc": "Konum",
    "tbl-empty": "Henüz tarama kaydedilmedi. Bir QR kod oluşturup telefonunuzla okutarak canlı güncellemeyi görün!",
    "c-title": "Dinamik QR Kod Oluştur",
    "c-desc": "QR kodun yönlendirildiği kısa kod kalıcıdır, yönlendirilen hedef URL'i dilediğiniz an güncelleyebilirsiniz.",
    "label-title": "QR Başlığı (Referans)",
    "label-slug": "Kısa Kod (Slug)",
    "label-target": "Hedef URL",
    "btn-create-code": "Kod Oluştur",
    "active-qr-header": "Aktif QR Kodları",
    "b-title": "Abonelik Detayları",
    "b-plan": "Mevcut Paket:",
    "b-scans": "Aylık Yönlendirme Limiti:",
    "b-qrs": "Dinamik QR Kod Limiti:",
    "b-sub-status": "Ödeme Durumu:",
    "b-expire-date": "Sonraki Yenileme Tarihi:",
    "b-up-title": "QRAurify Pro Plana Geçin",
    "b-up-desc": "Sınırsız kod, sınırsız tarama ve özel marka kimliği için aylık 500 TL'den başlayan fiyatlarla.",
    "b-up-btn": "Şimdi Yükselt",
    "b-up-active": "⚡ Pro Planınız aktif. Desteğiniz için teşekkürler!",
    "e-title": "QR Kod Ayarlarını Düzenle",
    "e-desc": "Linkinizin dinamik yönlendirme adresini anında güncelleyin.",
    "e-pro-title": "QR Kod Tasarımı (Sadece Pro)",
    "e-label-color": "QR Kod Rengi",
    "e-label-logo": "Orta Logo Görseli",
    "btn-upload-file": "Dosya Seç",
    "e-pro-lock": "🔒 Renk ve Logo yerleşimi Pro plan gerektirir.",
    "btn-save-changes": "Değişiklikleri Kaydet",
    "up-title": "QRAurify Plana Yükselt",
    "up-desc": "Sınırsız tarama, dinamik link değiştirme ve özel QR tasarımlarını aktifleştirin.",
    "chk-header": "🔒 Güvenli Ödeme Ekranı",
    "chk-item": "QRAurify Pro Aylık Abonelik",
    "chk-label-email": "Fatura E-postası",
    "chk-label-tier": "Plan Seçin",
    "chk-label-card": "Kart Bilgileri",
    "chk-btn": "Ödemeye İlerle",
    "chk-footer": "Ödemeleriniz Shopier güvencesiyle 256-bit SSL korumalı sayfa üzerinden güvenle gerçekleştirilir.",
    "opt-pro": "Pro Paket - 500.00 TL / aylık",
    "opt-agency": "Ajans Paketi - 1000.00 TL / aylık",
    "sim-title": "Fatura & Abonelik Simülatörü",
    "sim-desc": "QR yönlendirme engellerini test etmek için abonelik durumunu simüle edin.",
    "btn-sim-fail": "Ödeme Hatası Simülasyonu",
    "btn-sim-success": "Ödeme Başarılı Simülasyonu",
    
    // JS Alerts & Messages
    "alert-qr-created": "Dinamik QR kod başarıyla oluşturuldu!",
    "alert-upgrade-success": "⚡ Ödeme başarılı! QRAurify üyeliğiniz hesabınızda aktifleşti.",
    "confirm-delete-qr": "⚠️ \"{title}\" isimli QR kodunu silmek istediğinize emin misiniz? \nBu işlem basılı tüm fiziksel QR kodların çalışmasını anında durduracaktır!",
    "alert-qr-deleted": "QR Kod başarıyla silindi.",
    "alert-settings-saved": "QR Kod ayarları başarıyla güncellendi.",
    "alert-link-copied": "Kısa yönlendirme bağlantısı panoya kopyalandı!",
    "text-short-link": "Kısa Bağlantı:",
    "text-redirect-target": "Yönlendirilen Hedef:",
    "btn-edit": "Ayarları Düzenle",
    "btn-download": "PNG İndir",
    "btn-delete": "Sil",
    "quota-free-banner": "Tarama Sayısı: {count} / 100 limit",
    "empty-qrs": "Aktif dinamik QR kod bulunamadı. İlk QR kodunuzu oluşturmak için yukarıdaki formu kullanabilirsiniz!",
    
    // New Feature Keys (Bilingual)
    "btn-bulk-mode": "Toplu QR Oluşturucuya Geç",
    "btn-single-mode": "Tekil QR Oluşturucuya Geç",
    "c-bulk-title": "Toplu QR Kod Oluştur",
    "c-bulk-desc": "CSV verisi yapıştırarak tek seferde birden fazla dinamik yönlendirme linki oluşturun.",
    "label-bulk-csv": "CSV Verisi (Format: Başlık, KısaKod, HedefAdres - Satır başına bir tane)",
    "btn-bulk-create": "Toplu QR Kodları Üret",
    "e-time-title": "Zaman Ayarlı Akıllı Yönlendirme (Pro Paket)",
    "e-label-time-enable": "Zaman aralığına göre alternatif bağlantıyı aktif et",
    "e-label-time-target": "Alternatif Hedef Bağlantı (Aktif Saatler)",
    "e-label-time-start": "Başlangıç Saati (0-23)",
    "e-label-time-end": "Bitiş Saati (0-23)",
    "e-time-pro-lock": "🔒 Zaman ayarlı yönlendirme Pro paket gerektirir.",
    "e-bulk-pro-lock": "🔒 Toplu QR oluşturucu Pro veya Ajans paket gerektirir.",
    "btn-print-tent": "Masa Kartı Yazdır",
    "alert-bulk-success": "Toplu oluşturma tamamlandı! Oluşturulan: {success} kod. Hatalar: {error}.",
    "btn-export-csv": "CSV Aktar",
    "btn-print-svg": "SVG İndir",
    "dom-title": "Ajans Özel Alan Adı",
    "dom-desc": "QR kodlarınızı qraurify.com yerine kendi markanıza ait alan adınız üzerinden yönlendirin.",
    "dom-instructions": "DNS Kurulum Talimatları:",
    "dom-dns-text": "DNS sağlayıcınızda alt alan adınızı (örn. <code>qr.markaniz.com</code>) <code>cname.qraurify.com</code> adresine yönlendiren bir CNAME kaydı oluşturun.",
    "label-domain": "Özel Alt Alan Adı (Subdomain)",
    "btn-save-domain": "Yapılandır",
    "dom-status-label": "Durum:",
    "btn-verify-domain": "DNS Doğrula",
    "creator-style-title": "QR Kod Tasarımı & Logo (İsteğe Bağlı)",
    "dropdown-profile-label": "Profilim",
    "creator-password-title": "Şifre Koruması (İsteğe Bağlı)",
    "label-password-enable": "Şifre Korumasını Aktif Et",
    "label-qr-password": "Giriş Şifresi",
    "creator-expiration-title": "Geçerlilik Kuralları (İsteğe Bağlı)",
    "label-expiration-enable": "Geçerlilik Sınırlarını Aktif Et",
    "label-expiration-date": "Son Geçerlilik Tarihi",
    "label-expiration-scans": "Maksimum Tarama Sayısı",
    "label-expiration-fallback": "Alternatif Yönlendirme Bağlantısı (İsteğe Bağlı)",
    "warn-pro-lock": "🔒 Şifre koruması ve Geçerlilik sınırları Pro paket gerektirir.",
    "edit-password-section-title": "Şifre Koruması (Sadece Pro)",
    "edit-expiration-section-title": "Geçerlilik Kuralları (Sadece Pro)",
    "creator-tracking-title": "Piksel Takibi (İsteğe Bağlı)",
    "creator-vcard-title": "Dijital Kartvizit / vCard (İsteğe Bağlı)",
    "creator-os-title": "Cihaz OS Yönlendirmesi (İsteğe Bağlı)",
    "label-vcard-enable": "vCard Profil Bağlantısını Aktif Et",
    "label-os-enable": "Cihaz İşletim Sistemine Göre Yönlendirmeyi Aktif Et",
    "edit-tracking-section-title": "Piksel Takibi (Sadece Pro)",
    "edit-vcard-section-title": "Dijital Kartvizit (Sadece Pro)",
    "edit-os-section-title": "Cihaz OS Yönlendirmesi (Sadece Ajans)",
    "warn-agency-lock": "🔒 İşletim sistemine göre akıllı yönlendirme Ajans paketi gerektirir.",

    // Additional Translation Keys for complete coverage
    "label-ga-id": "Google Analytics Ölçüm Kimliği",
    "label-fb-id": "Facebook Piksel Kimliği",
    "label-vcard-name": "Adı Soyadı",
    "label-vcard-title": "Unvanı / Pozisyonu",
    "label-vcard-company": "Şirket Adı",
    "label-vcard-phone": "Telefon Numarası",
    "label-vcard-email": "E-posta Adresi",
    "label-vcard-website": "Web Sitesi",
    "label-vcard-address": "Adres",
    "label-vcard-instagram": "Instagram",
    "label-vcard-facebook": "Facebook",
    "label-vcard-linkedin": "LinkedIn",
    "label-vcard-twitter": "Twitter / X",
    "label-ios-url": "iOS Hedef Bağlantısı (App Store)",
    "label-android-url": "Android Hedef Bağlantısı (Google Play)",
    "label-social-accounts": "Sosyal Medya Hesapları (Kullanıcı Adı veya Bağlantı)"
  }
};

// ─── Initialization ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const localData = localStorage.getItem('qr_merchant');
  if (!localData) {
    window.location.href = '/index.html';
    return;
  }

  currentMerchant = JSON.parse(localData);

  const savedLang = localStorage.getItem('qr_lang') || 'tr';
  currentLang = savedLang;
  updateLanguageSelectorUI(currentLang);
  applyLanguage(currentLang);
  updateTierUI();

  // Set Profile UI elements
  const emailEl = document.getElementById('user-email');
  const avatarEl = document.getElementById('user-avatar');
  const displayNameEl = document.getElementById('user-display-name');
  
  if (emailEl) emailEl.innerText = currentMerchant.email;
  if (avatarEl) avatarEl.innerText = (currentMerchant.displayName || currentMerchant.email).substring(0, 1).toUpperCase();
  if (displayNameEl) displayNameEl.innerText = currentMerchant.displayName || currentMerchant.email.split('@')[0];

  // Load configuration and data
  refreshMerchantData();

  // Check for payment callback results
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('payment') === 'success') {
    window.history.replaceState({}, document.title, window.location.pathname);
    await showAlert(currentLang === 'tr' ? 'Tebrikler! Ödemeniz başarıyla gerçekleşti ve planınız yükseltildi.' : 'Congratulations! Your payment was successful and your plan has been upgraded.');
  } else if (urlParams.get('payment') === 'error') {
    window.history.replaceState({}, document.title, window.location.pathname);
    await showAlert(currentLang === 'tr' ? 'Ödeme işlemi başarısız oldu veya iptal edildi.' : 'Payment failed or was cancelled.');
  } else if (urlParams.get('upgrade') === 'true') {
    window.history.replaceState({}, document.title, window.location.pathname);
    const billingNavEl = document.getElementById('nav-item-billing');
    if (billingNavEl && typeof switchTab === 'function') {
      switchTab('billing', billingNavEl);
    }
    if (typeof openUpgradeModal === 'function') {
      openUpgradeModal();
    }
  }

  // Wire avatar dropdown toggle
  const avatarBtn = document.getElementById('avatar-menu-btn');
  const avatarDropdown = document.getElementById('avatar-dropdown');
  if (avatarBtn && avatarDropdown) {
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      avatarDropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => {
      avatarDropdown.classList.remove('open');
    });
  }
});

// ─── Refresh Profile from Backend ────────────────────────────────────────────
async function refreshMerchantData() {
  try {
    const res = await fetch(`/api/merchants/${currentMerchant.id}`);
    if (!res.ok) throw new Error('Failed to retrieve profile details.');

    const merchant = await res.json();
    currentMerchant = merchant;

    localStorage.setItem('qr_merchant', JSON.stringify(merchant));

    // Update header avatar
    const avatarEl = document.getElementById('user-avatar');
    const emailEl = document.getElementById('user-email');
    const displayNameEl = document.getElementById('user-display-name');
    if (avatarEl) avatarEl.innerText = (merchant.displayName || merchant.email).substring(0, 1).toUpperCase();
    if (emailEl) emailEl.innerText = merchant.email;
    if (displayNameEl) displayNameEl.innerText = merchant.displayName || merchant.email.split('@')[0];

    // Update Tier UI elements
    updateTierUI();

    // Trigger tab detail loads
    const activeTab = document.querySelector('.sidebar-item.active');
    const tabName = activeTab ? activeTab.getAttribute('onclick').match(/'([^']+)'/)[1] : 'overview';
    
    // Apply static localization text
    applyLanguage(currentLang);
    
    loadTabDetails(tabName);
  } catch (err) {
    console.error('Error refreshing profile:', err);
  }
}

// ─── Language Switchers ───────────────────────────────────────────────────────
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('qr_lang', lang);
  applyLanguage(lang);
  updateLanguageSelectorUI(lang);
  
  // Re-load tab content to update dynamic descriptions
  const activeTab = document.querySelector('.sidebar-item.active');
  const tabName = activeTab ? activeTab.getAttribute('onclick').match(/'([^']+)'/)[1] : 'overview';
  loadTabDetails(tabName);
}

function updateLanguageSelectorUI(lang) {
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById('lang-btn-' + lang);
  if (activeBtn) activeBtn.classList.add('active');
}

function applyLanguage(lang) {

  // Static translations
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.innerHTML = translations[lang][key];
    }
  });

  // Dynamic user tier display
  const tierEl = document.getElementById('user-tier');
  if (tierEl && currentMerchant) {
    if (currentMerchant.plan === 'agency') {
      tierEl.innerText = lang === 'tr' ? 'Ajans Planı' : 'Agency Plan';
      tierEl.style.color = 'var(--accent-secondary)';
    } else if (currentMerchant.plan === 'pro') {
      tierEl.innerText = lang === 'tr' ? 'Pro Planı' : 'Pro Plan';
      tierEl.style.color = 'var(--accent-primary)';
    } else {
      tierEl.innerText = lang === 'tr' ? 'Ücretsiz Plan' : 'Free Plan';
      tierEl.style.color = 'var(--text-secondary)';
    }
  }

  // Dynamic billing summary translation updates
  const billTierName = document.getElementById('billing-tier-name');
  const billScansLimit = document.getElementById('billing-scans-limit');
  const billQrsLimit = document.getElementById('billing-qrs-limit');
  const billSubStatus = document.getElementById('billing-sub-status');
  const billExpireDate = document.getElementById('billing-expire-date');
  const billExpireRow = document.getElementById('billing-expire-row');

  if (currentMerchant) {
    const isTR = lang === 'tr';
    
    // 1. Current Plan Name
    if (billTierName) {
      if (currentMerchant.plan === 'agency') {
        billTierName.innerText = isTR ? 'Ajans Planı' : 'Agency Plan';
        billTierName.style.color = 'var(--accent-secondary)';
      } else if (currentMerchant.plan === 'pro') {
        billTierName.innerText = isTR ? 'Pro Paket' : 'Pro Plan';
        billTierName.style.color = 'var(--accent-primary)';
      } else {
        billTierName.innerText = isTR ? 'Ücretsiz Paket' : 'Free Plan';
        billTierName.style.color = 'var(--text-secondary)';
      }
    }

    // 2. Monthly Scans Limit
    if (billScansLimit) {
      if (currentMerchant.plan === 'free') {
        billScansLimit.innerText = isTR ? 'Aylık 100 yönlendirme' : '100 scans / month';
      } else {
        billScansLimit.innerText = isTR ? 'Sınırsız' : 'Unlimited';
      }
    }

    // 3. Dynamic QR Codes Limit
    if (billQrsLimit) {
      if (currentMerchant.plan === 'free') {
        billQrsLimit.innerText = isTR ? '1 dinamik kod' : '1 dynamic code';
      } else {
        billQrsLimit.innerText = isTR ? 'Sınırsız' : 'Unlimited';
      }
    }

    // 4. Payment Status
    if (billSubStatus) {
      if (currentMerchant.subscriptionStatus === 'unpaid') {
        billSubStatus.innerText = isTR ? 'Ödenmemiş / Gecikmiş' : 'Unpaid / Past Due';
        billSubStatus.style.color = 'var(--error)';
      } else if (currentMerchant.subscriptionStatus === 'suspended') {
        billSubStatus.innerText = isTR ? 'Askıya Alındı' : 'Suspended';
        billSubStatus.style.color = 'var(--error)';
      } else {
        billSubStatus.innerText = isTR ? 'Aktif' : 'Active';
        billSubStatus.style.color = 'var(--success)';
      }
    }

    // 5. Expiration Date
    if (billExpireDate && billExpireRow) {
      if (currentMerchant.plan === 'free') {
        billExpireRow.style.display = 'none';
      } else {
        billExpireRow.style.display = 'flex';
        if (currentMerchant.subscriptionExpireDate) {
          const dateOpts = { year: 'numeric', month: 'long', day: 'numeric' };
          const dateText = new Date(currentMerchant.subscriptionExpireDate).toLocaleDateString(isTR ? 'tr-TR' : 'en-US', dateOpts);
          billExpireDate.innerText = dateText;
        } else {
          billExpireDate.innerText = '—';
        }
      }
    }
  }

  // Update placeholders
  const qrTitle = document.getElementById('qr-title');
  if (qrTitle) qrTitle.placeholder = lang === 'tr' ? 'örn. Masa 1 Menüsü' : 'e.g. Table 1 Menu';

  const qrCode = document.getElementById('qr-code');
  if (qrCode) qrCode.placeholder = lang === 'tr' ? 'örn. masa1menu' : 'e.g. table1menu';

  const bulkCsv = document.getElementById('bulk-csv-data');
  if (bulkCsv) bulkCsv.placeholder = lang === 'tr' 
    ? 'Masa 1,masa1,https://my.com/menu.pdf\nMasa 2,masa2,https://my.com/menu.pdf' 
    : 'Table 1,table1,https://example.com/menu.pdf\nTable 2,table2,https://example.com/menu.pdf';

  const cardNum = document.getElementById('checkout-card-number');
  if (cardNum) cardNum.placeholder = lang === 'tr' ? 'Kart Numarası' : 'Card Number';

  const cardExpiry = document.getElementById('checkout-card-expiry');
  if (cardExpiry) cardExpiry.placeholder = lang === 'tr' ? 'AA / YY' : 'MM / YY';

  // Translate file upload label previews if empty
  const qrLogoUrl = document.getElementById('qr-logo-url');
  const qrLogoPreview = document.getElementById('qr-logo-preview');
  if (qrLogoPreview && (!qrLogoUrl || !qrLogoUrl.value)) {
    qrLogoPreview.innerText = lang === 'tr' ? 'Dosya seçilmedi' : 'No file selected';
  }

  const editLogoUrl = document.getElementById('edit-logo-url');
  const editLogoPreview = document.getElementById('edit-logo-preview');
  if (editLogoPreview && (!editLogoUrl || !editLogoUrl.value)) {
    editLogoPreview.innerText = lang === 'tr' ? 'Dosya seçilmedi' : 'No file selected';
  }

  // Trigger Tier UI Updates to translate plans, limits, and statuses
  if (typeof updateTierUI === 'function') {
    updateTierUI();
  }

  // Re-translate upgrade modal items if visible
  if (typeof updateCheckoutPrice === 'function') {
    const upgradeModal = document.getElementById('upgrade-modal');
    if (upgradeModal && upgradeModal.classList.contains('active')) {
      updateCheckoutPrice();
    }
  }
}

// ─── Tier UI Updates ──────────────────────────────────────────────────────────
function updateTierUI() {
  const paid = isPaidPlan();
  const isAgency = currentMerchant && currentMerchant.plan === 'agency';

  // Set creator styling elements states
  const qrColorInput = document.getElementById('qr-brand-color');
  const qrLogoFileInput = document.getElementById('qr-logo-file');
  const qrLogoUploadBtn = document.getElementById('btn-upload-qr-logo');
  const creatorProBadge = document.getElementById('creator-pro-badge');

  if (paid) {
    if (qrColorInput) qrColorInput.removeAttribute('disabled');
    if (qrLogoFileInput) qrLogoFileInput.removeAttribute('disabled');
    if (qrLogoUploadBtn) qrLogoUploadBtn.removeAttribute('disabled');
    if (creatorProBadge) creatorProBadge.style.display = 'none';
  } else {
    if (qrColorInput) qrColorInput.setAttribute('disabled', 'true');
    if (qrLogoFileInput) qrLogoFileInput.setAttribute('disabled', 'true');
    if (qrLogoUploadBtn) qrLogoUploadBtn.setAttribute('disabled', 'true');
    if (creatorProBadge) creatorProBadge.style.display = 'block';
  }

  // Set creator password & expiration states
  const qrPasswordEnabledInput = document.getElementById('qr-password-enabled');
  const qrExpirationEnabledInput = document.getElementById('qr-expiration-enabled');
  const creatorPasswordProBadge = document.getElementById('creator-password-pro-badge');
  const creatorExpirationProBadge = document.getElementById('creator-expiration-pro-badge');
  
  const qrPasswordInput = document.getElementById('qr-password');
  const qrExpirationDateInput = document.getElementById('qr-expiration-date');
  const qrExpirationScansInput = document.getElementById('qr-expiration-scans');
  const qrExpirationFallbackInput = document.getElementById('qr-expiration-fallback');

  if (paid) {
    if (qrPasswordEnabledInput) qrPasswordEnabledInput.removeAttribute('disabled');
    if (qrExpirationEnabledInput) qrExpirationEnabledInput.removeAttribute('disabled');
    if (creatorPasswordProBadge) creatorPasswordProBadge.style.display = 'none';
    if (creatorExpirationProBadge) creatorExpirationProBadge.style.display = 'none';
    
    if (qrPasswordInput) qrPasswordInput.removeAttribute('disabled');
    if (qrExpirationDateInput) qrExpirationDateInput.removeAttribute('disabled');
    if (qrExpirationScansInput) qrExpirationScansInput.removeAttribute('disabled');
    if (qrExpirationFallbackInput) qrExpirationFallbackInput.removeAttribute('disabled');
  } else {
    if (qrPasswordEnabledInput) {
      qrPasswordEnabledInput.setAttribute('disabled', 'true');
      qrPasswordEnabledInput.checked = false;
    }
    if (qrExpirationEnabledInput) {
      qrExpirationEnabledInput.setAttribute('disabled', 'true');
      qrExpirationEnabledInput.checked = false;
    }
    if (creatorPasswordProBadge) creatorPasswordProBadge.style.display = 'block';
    if (creatorExpirationProBadge) creatorExpirationProBadge.style.display = 'block';
    
    if (qrPasswordInput) qrPasswordInput.setAttribute('disabled', 'true');
    if (qrExpirationDateInput) qrExpirationDateInput.setAttribute('disabled', 'true');
    if (qrExpirationScansInput) qrExpirationScansInput.setAttribute('disabled', 'true');
    if (qrExpirationFallbackInput) qrExpirationFallbackInput.setAttribute('disabled', 'true');
    
    setTimeout(() => {
      toggleCreatorPasswordFields();
      toggleCreatorExpirationFields();
    }, 0);
  }

  // Set creator tracking & vcard states (Pro & Agency)
  const qrGaInput = document.getElementById('qr-ga-id');
  const qrFbInput = document.getElementById('qr-fb-id');
  const qrVcardEnabledInput = document.getElementById('qr-vcard-enabled');
  const creatorTrackingProBadge = document.getElementById('creator-tracking-pro-badge');
  const creatorVcardProBadge = document.getElementById('creator-vcard-pro-badge');
  
  const vcardFields = [
    'vcard-name', 'vcard-title', 'vcard-company', 'vcard-phone', 'vcard-email',
    'vcard-website', 'vcard-address', 'vcard-instagram', 'vcard-facebook',
    'vcard-linkedin', 'vcard-twitter'
  ];

  if (paid) {
    if (qrGaInput) qrGaInput.removeAttribute('disabled');
    if (qrFbInput) qrFbInput.removeAttribute('disabled');
    if (qrVcardEnabledInput) qrVcardEnabledInput.removeAttribute('disabled');
    if (creatorTrackingProBadge) creatorTrackingProBadge.style.display = 'none';
    if (creatorVcardProBadge) creatorVcardProBadge.style.display = 'none';
    
    vcardFields.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.removeAttribute('disabled');
    });
  } else {
    if (qrGaInput) {
      qrGaInput.setAttribute('disabled', 'true');
      qrGaInput.value = '';
    }
    if (qrFbInput) {
      qrFbInput.setAttribute('disabled', 'true');
      qrFbInput.value = '';
    }
    if (qrVcardEnabledInput) {
      qrVcardEnabledInput.setAttribute('disabled', 'true');
      qrVcardEnabledInput.checked = false;
    }
    if (creatorTrackingProBadge) creatorTrackingProBadge.style.display = 'block';
    if (creatorVcardProBadge) creatorVcardProBadge.style.display = 'block';
    
    vcardFields.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.setAttribute('disabled', 'true');
    });
    
    setTimeout(() => {
      toggleCreatorVcardFields();
    }, 0);
  }

  // Set creator OS redirection states (Agency Only)
  const qrOsEnabledInput = document.getElementById('qr-os-enabled');
  const creatorOsProBadge = document.getElementById('creator-os-pro-badge');
  const osFields = ['qr-ios-url', 'qr-android-url'];

  if (isAgency) {
    if (qrOsEnabledInput) qrOsEnabledInput.removeAttribute('disabled');
    if (creatorOsProBadge) creatorOsProBadge.style.display = 'none';
    osFields.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.removeAttribute('disabled');
    });
  } else {
    if (qrOsEnabledInput) {
      qrOsEnabledInput.setAttribute('disabled', 'true');
      qrOsEnabledInput.checked = false;
    }
    if (creatorOsProBadge) creatorOsProBadge.style.display = 'block';
    osFields.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.setAttribute('disabled', 'true');
    });
    
    setTimeout(() => {
      toggleCreatorOsFields();
    }, 0);
  }
  
  // Update Billing & Upgrade prompts
  const upgradeFreeEl = document.getElementById('upgrade-box-free');
  const upgradeProEl = document.getElementById('upgrade-box-pro');
  if (upgradeFreeEl) upgradeFreeEl.style.display = paid ? 'none' : 'block';
  if (upgradeProEl) upgradeProEl.style.display = paid ? 'block' : 'none';

  const billingUpgradeEl = document.getElementById('billing-upgrade-box');
  const billingActiveEl = document.getElementById('billing-active-box');
  if (billingUpgradeEl) billingUpgradeEl.style.display = paid ? 'none' : 'block';
  if (billingActiveEl) billingActiveEl.style.display = paid ? 'block' : 'none';
}

// ─── Sidebar Tab Routing ──────────────────────────────────────────────────────
function switchTab(tabId, element) {
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.classList.remove('active');
  });
  element.classList.add('active');

  document.querySelectorAll('.tab-content').forEach(view => {
    view.classList.remove('active');
  });

  const targetView = document.getElementById('tab-' + tabId);
  if (targetView) targetView.classList.add('active');

  // Dynamic Tab Title translations
  const dict = translations[currentLang];
  
  if (tabId === 'codes') {
    document.getElementById('tab-title').innerText = creatorMode === 'single' ? dict["title-codes"] : dict["c-bulk-title"];
    document.getElementById('tab-desc').innerText = creatorMode === 'single' ? dict["desc-codes"] : dict["c-bulk-desc"];
  } else {
    document.getElementById('tab-title').innerText = dict[`title-${tabId}`] || tabId;
    document.getElementById('tab-desc').innerText = dict[`desc-${tabId}`] || '';
  }

  loadTabDetails(tabId);
}

function loadTabDetails(activeTab = 'overview') {
  if (!currentMerchant) return;

  if (activeTab === 'overview') {
    fetchOverviewAnalytics();
  } else if (activeTab === 'codes') {
    fetchQrsList();
  }
}

// ─── Overview Analytics ───────────────────────────────────────────────────────
async function fetchOverviewAnalytics() {
  try {
    const res = await fetch(`/api/merchants/${currentMerchant.id}/analytics`);
    if (!res.ok) throw new Error('Failed to retrieve analytics.');

    const data = await res.json();
    const dict = translations[currentLang];

    // Toggle free quota header display
    const quotaBanner = document.getElementById('free-quota-banner');
    if (currentMerchant.plan === 'free') {
      quotaBanner.style.display = 'block';
      document.getElementById('quota-text').innerText = dict["quota-free-banner"].replace('{count}', data.totalScans);
    } else {
      quotaBanner.style.display = 'none';
    }

    // Set KPIs
    document.getElementById('stat-qrs').innerText = data.totalQrs;
    document.getElementById('stat-scans').innerText = data.totalScans;
    
    // Savings calculation
    const savings = data.totalQrs * 850;
    document.getElementById('stat-savings').innerText = savings.toFixed(0) + ' TL';

    // Render Device Breakdown
    const deviceBox = document.getElementById('chart-devices');
    const totalDevices = Object.values(data.deviceBreakdown).reduce((a, b) => a + b, 0);
    deviceBox.innerHTML = Object.entries(data.deviceBreakdown).map(([device, count]) => {
      const percentage = totalDevices > 0 ? Math.round((count / totalDevices) * 100) : 0;
      let deviceLabel = device;
      if (currentLang === 'tr') {
        if (device === 'Mobile') deviceLabel = 'Mobil';
        else if (device === 'Desktop') deviceLabel = 'Masaüstü';
        else if (device === 'Tablet') deviceLabel = 'Tablet';
      }
      return `
        <div class="bar-row">
          <div class="bar-label">
            <span>${deviceLabel}</span>
            <span>${count} ${currentLang === 'tr' ? 'tarama' : 'scans'} (${percentage}%)</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    }).join('');

    // Render Referrer Breakdown
    const referrerBox = document.getElementById('chart-referrers');
    const totalReferrers = Object.values(data.referrerBreakdown).reduce((a, b) => a + b, 0);
    referrerBox.innerHTML = Object.entries(data.referrerBreakdown).map(([source, count]) => {
      const percentage = totalReferrers > 0 ? Math.round((count / totalReferrers) * 100) : 0;
      let sourceLabel = source;
      if (currentLang === 'tr') {
        if (source === 'Direct') sourceLabel = 'Doğrudan';
        else if (source === 'Social (X/IG)') sourceLabel = 'Sosyal Medya (X/IG)';
        else if (source === 'Other Referrer') sourceLabel = 'Diğer Yönlendiren';
      }
      return `
        <div class="bar-row">
          <div class="bar-label">
            <span>${sourceLabel}</span>
            <span>${count} ${currentLang === 'tr' ? 'tarama' : 'scans'} (${percentage}%)</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    }).join('');

    // Render Scan Log rows
    const tableBody = document.getElementById('recent-scans-rows');
    if (data.recentScans.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">${dict["tbl-empty"]}</td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = data.recentScans.map(s => {
      const date = new Date(s.timestamp).toLocaleDateString(currentLang === 'tr' ? 'tr-TR' : undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      let deviceLabel = s.device;
      if (currentLang === 'tr') {
        if (s.device === 'Mobile') deviceLabel = 'Mobil';
        else if (s.device === 'Desktop') deviceLabel = 'Masaüstü';
        else if (s.device === 'Tablet') deviceLabel = 'Tablet';
      }
      let referrerLabel = s.referrer;
      if (currentLang === 'tr') {
        if (s.referrer === 'Direct') referrerLabel = 'Doğrudan';
        else if (s.referrer === 'Social (X/IG)') referrerLabel = 'Sosyal Medya (X/IG)';
        else if (s.referrer === 'Other Referrer') referrerLabel = 'Diğer Yönlendiren';
      }
      return `
        <tr>
          <td>${date}</td>
          <td style="font-weight: 600;">${s.qrTitle}</td>
          <td>${deviceLabel}</td>
          <td>${referrerLabel}</td>
          <td style="color: var(--accent-secondary); font-weight: 500;">${s.country}</td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    console.error('Error fetching analytics:', err);
  }
}

// ─── QR List Fetch & Render ───────────────────────────────────────────────────
async function fetchQrsList() {
  try {
    const res = await fetch(`/api/qr?merchantId=${currentMerchant.id}`);
    if (!res.ok) throw new Error('Failed to retrieve QR codes.');

    activeQrList = await res.json();
    renderQrGrid();
  } catch (err) {
    console.error('Error loading QRs:', err);
  }
}

function renderQrGrid() {
  const container = document.getElementById('qrs-container');
  const dict = translations[currentLang];

  if (activeQrList.length === 0) {
    container.innerHTML = `
      <div class="glass-panel" style="grid-column: 1 / -1; padding: 3rem; text-align: center; color: var(--text-secondary);">
        <h4>${dict["empty-qrs"]}</h4>
      </div>
    `;
    return;
  }

  container.innerHTML = activeQrList.map(qr => {
    const isCustomActive = currentMerchant.plan === 'agency' && currentMerchant.customDomainStatus === 'active' && currentMerchant.customDomain;
    const redirectUrl = isCustomActive ? `http://${currentMerchant.customDomain}/r/${qr.shortCode}` : `${window.location.origin}/r/${qr.shortCode}`;
    const timeIndicator = qr.timeEnabled ? ` <span title="${currentLang === 'tr' ? 'Zaman ayarlı aktif' : 'Time-based active'}" style="color: var(--accent-secondary); font-size: 0.95rem;">⏰</span>` : '';
    
    return `
      <div class="glass-panel qr-card">
        <div class="qr-card-header">
          <div>
            <span class="qr-card-title">${qr.title}${timeIndicator}</span>
            <div class="qr-card-meta">${currentLang === 'tr' ? 'Tarama sayısı' : 'Scans count'}: <strong style="color: var(--accent-primary);">${qr.scanCount}</strong></div>
          </div>
        </div>
        <div class="qr-card-body">
          <div class="qr-card-img-box" id="qr-preview-${qr.id}"></div>
          <div class="qr-card-links">
            <span style="font-weight: 600; color: #fff;">${dict["text-short-link"]}</span>
            <span style="font-family: monospace; font-size: 0.75rem; color: var(--accent-secondary); cursor: pointer;" onclick="copyShortLink('${redirectUrl}')">${redirectUrl}</span>
            <span style="font-weight: 600; color: #fff; margin-top: 0.25rem;">${dict["text-redirect-target"]}</span>
            <span style="font-size: 0.75rem;" title="${qr.targetUrl}">${qr.targetUrl.length > 45 ? qr.targetUrl.substring(0,45)+'…' : qr.targetUrl}</span>
            ${qr.timeEnabled ? `<span style="font-size: 0.7rem; color: var(--text-secondary);">⏰ (${qr.timeStartHour}:00–${qr.timeEndHour}:00) → ${qr.timeTargetUrl}</span>` : ''}
          </div>
        </div>
        <div class="qr-card-actions" style="flex-wrap: wrap;">
          <button onclick="openEditModal('${qr.id}')" class="btn btn-secondary" style="flex: 1; padding: 0.5rem; font-size: 0.8rem; min-width: 100px;">${dict["btn-edit"]}</button>
          <button onclick="downloadQr('${qr.id}')" class="btn btn-secondary" style="flex: 1; padding: 0.5rem; font-size: 0.8rem; border-color: rgba(16, 185, 129, 0.3); min-width: 80px;">${dict["btn-download"]}</button>
          <button onclick="printTableTent('${qr.id}')" class="btn btn-secondary" style="flex: 1; padding: 0.5rem; font-size: 0.8rem; border-color: rgba(139, 92, 246, 0.3); min-width: 110px;">${dict["btn-print-tent"]}</button>
          <button onclick="downloadQrSvg('${qr.id}')" class="btn btn-secondary" style="flex: 1; padding: 0.5rem; font-size: 0.8rem; border-color: rgba(16, 185, 129, 0.3); min-width: 90px;">${dict["btn-print-svg"]}</button>
          <button onclick="deleteQr('${qr.id}')" class="btn btn-danger" style="padding: 0.5rem 0.75rem; font-size: 0.8rem; min-width: 50px;">${dict["btn-delete"]}</button>
        </div>
      </div>
    `;
  }).join('');

  // Generate QR using qrcodejs
  activeQrList.forEach(qr => {
    const isCustomActive = currentMerchant.plan === 'agency' && currentMerchant.customDomainStatus === 'active' && currentMerchant.customDomain;
    const redirectUrl = isCustomActive ? `http://${currentMerchant.customDomain}/r/${qr.shortCode}` : `${window.location.origin}/r/${qr.shortCode}`;
    const box = document.getElementById('qr-preview-' + qr.id);
    if (box) {
      new QRCode(box, {
        text: redirectUrl,
        width: 80,
        height: 80,
        colorDark: qr.brandColor || '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });

      // Render custom center logo on paid plans
      if (isPaidPlan() && qr.logoUrl) {
        const canvas = box.querySelector('canvas');
        const previewImg = box.querySelector('img');
        if (canvas) {
          const ctx = canvas.getContext('2d');
          const logoImg = new Image();
          logoImg.crossOrigin = "anonymous";
          logoImg.src = qr.logoUrl;
          logoImg.onload = () => {
            try {
              const logoSize = canvas.width * 0.22;
              const x = (canvas.width - logoSize) / 2;
              const y = (canvas.height - logoSize) / 2;

              // Draw white background card/circle under logo
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(x - 2, y - 2, logoSize + 4, logoSize + 4);

              // Draw logo
              ctx.drawImage(logoImg, x, y, logoSize, logoSize);

              // Sync fallback image src
              if (previewImg) {
                previewImg.src = canvas.toDataURL('image/png');
              }
            } catch (e) {
              console.error("Failed to render custom logo onto QR canvas:", e);
            }
          };
        }
      }
    }
  });
}

// ─── Creator Mode Toggle ──────────────────────────────────────────────────────
function toggleCreatorMode() {
  const dict = translations[currentLang];
  const header = document.getElementById('creator-header');
  const desc = document.getElementById('creator-desc');
  const toggleBtn = document.getElementById('btn-toggle-creator');
  const singleForm = document.getElementById('create-qr-form');
  const bulkForm = document.getElementById('bulk-qr-form');

  if (creatorMode === 'single') {
    creatorMode = 'bulk';
    header.innerText = dict["c-bulk-title"];
    desc.innerText = dict["c-bulk-desc"];
    toggleBtn.innerText = dict["btn-single-mode"];
    singleForm.style.display = 'none';
    bulkForm.style.display = 'flex';
  } else {
    creatorMode = 'single';
    header.innerText = dict["c-title"];
    desc.innerText = dict["c-desc"];
    toggleBtn.innerText = dict["btn-bulk-mode"];
    singleForm.style.display = 'flex';
    bulkForm.style.display = 'none';
  }

  const activeTab = document.querySelector('.sidebar-item.active');
  const tabName = activeTab ? activeTab.getAttribute('onclick').match(/'([^']+)'/)[1] : 'codes';
  if (tabName === 'codes') {
    document.getElementById('tab-title').innerText = creatorMode === 'single' ? dict["title-codes"] : dict["c-bulk-title"];
    document.getElementById('tab-desc').innerText = creatorMode === 'single' ? dict["desc-codes"] : dict["c-bulk-desc"];
  }
}

function toggleCreatorStylingAccordion() {
  const content = document.getElementById('creator-style-content');
  const arrow = document.getElementById('creator-style-arrow');
  if (content && arrow) {
    if (content.style.display === 'none') {
      content.style.display = 'grid';
      arrow.style.transform = 'rotate(180deg)';
    } else {
      content.style.display = 'none';
      arrow.style.transform = 'rotate(0deg)';
    }
  }
}

async function handleFileChange(fileInputId, previewSpanId, hiddenInputId) {
  const fileInput = document.getElementById(fileInputId);
  const previewSpan = document.getElementById(previewSpanId);
  const hiddenInput = document.getElementById(hiddenInputId);
  
  if (!fileInput || fileInput.files.length === 0) {
    if (previewSpan) previewSpan.innerText = currentLang === 'tr' ? 'Dosya seçilmedi' : 'No file selected';
    if (hiddenInput) hiddenInput.value = '';
    return;
  }
  
  const file = fileInput.files[0];
  if (previewSpan) previewSpan.innerText = file.name;
  
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = async () => {
    try {
      if (previewSpan) previewSpan.innerText = (currentLang === 'tr' ? 'Yükleniyor... ' : 'Uploading... ') + file.name;
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileData: reader.result
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      if (hiddenInput) hiddenInput.value = data.url;
      if (previewSpan) previewSpan.innerText = (currentLang === 'tr' ? 'Yüklendi ✓ ' : 'Uploaded ✓ ') + file.name;
    } catch (err) {
      await showAlert((currentLang === 'tr' ? 'Görsel yüklenemedi: ' : 'Failed to upload image: ') + err.message);
      if (previewSpan) previewSpan.innerText = currentLang === 'tr' ? 'Hata oluştu' : 'Error occurred';
      if (hiddenInput) hiddenInput.value = '';
    }
  };
}

function toggleTimeInputs() {
  const checkbox = document.getElementById('edit-time-enabled');
  const container = document.getElementById('time-inputs-container');
  if (checkbox && checkbox.checked) {
    container.style.display = 'flex';
  } else {
    container.style.display = 'none';
  }
}

async function copyShortLink(link) {
  const dict = translations[currentLang];
  try {
    await navigator.clipboard.writeText(link);
    await showAlert(dict["alert-link-copied"]);
  } catch (err) {
    // Fallback for older browsers
    const el = document.createElement('textarea');
    el.value = link;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    await showAlert(dict["alert-link-copied"]);
  }
}

// ─── QR Create / Bulk Create ──────────────────────────────────────────────────
async function handleCreateQr(event) {
  event.preventDefault();
  
  const errDiv = document.getElementById('create-error');
  errDiv.style.display = 'none';

  const title = document.getElementById('qr-title').value.trim();
  const shortCode = document.getElementById('qr-code').value.trim();
  const targetUrl = document.getElementById('qr-target').value.trim();
  const dict = translations[currentLang];

  // Client-side slug validation
  if (!/^[a-z0-9_-]+$/i.test(shortCode)) {
    errDiv.innerText = currentLang === 'tr' 
      ? 'Kısa kod sadece harf, rakam, tire ve alt çizgi içerebilir.' 
      : 'Short code can only contain letters, numbers, dashes, and underscores.';
    errDiv.style.display = 'block';
    return;
  }

  const payload = { merchantId: currentMerchant.id, title, shortCode, targetUrl };
  
  if (isPaidPlan()) {
    const colorEl = document.getElementById('qr-brand-color');
    const logoEl = document.getElementById('qr-logo-url');
    if (colorEl) payload.brandColor = colorEl.value;
    if (logoEl && logoEl.value.trim()) payload.logoUrl = logoEl.value.trim();

    // Password Protection fields
    const pwEnabledInput = document.getElementById('qr-password-enabled');
    const pwEnabled = pwEnabledInput ? pwEnabledInput.checked : false;
    const qrPasswordInput = document.getElementById('qr-password');
    const qrPassword = qrPasswordInput ? qrPasswordInput.value.trim() : '';
    payload.passwordEnabled = pwEnabled;
    payload.qrPassword = qrPassword;

    // Expiration Rules fields
    const expEnabledInput = document.getElementById('qr-expiration-enabled');
    const expEnabled = expEnabledInput ? expEnabledInput.checked : false;
    const expDateInput = document.getElementById('qr-expiration-date');
    const expDate = expDateInput ? expDateInput.value : '';
    const expScansInput = document.getElementById('qr-expiration-scans');
    const expScans = expScansInput ? expScansInput.value.trim() : '';
    const expFallbackInput = document.getElementById('qr-expiration-fallback');
    const expFallback = expFallbackInput ? expFallbackInput.value.trim() : '';

    payload.expirationEnabled = expEnabled;
    payload.expirationDate = expDate ? new Date(expDate).toISOString() : null;
    payload.expirationScanLimit = expScans ? parseInt(expScans) : null;
    payload.expirationFallbackUrl = expFallback;

    // Tracking Pixels
    const gaInput = document.getElementById('qr-ga-id');
    const fbInput = document.getElementById('qr-fb-id');
    payload.googleAnalyticsId = gaInput ? gaInput.value.trim() : '';
    payload.facebookPixelId = fbInput ? fbInput.value.trim() : '';

    // vCard dynamic profiles
    const vcardEnabledInput = document.getElementById('qr-vcard-enabled');
    const vcardEnabled = vcardEnabledInput ? vcardEnabledInput.checked : false;
    payload.vcardEnabled = vcardEnabled;
    payload.vcardData = {
      name: document.getElementById('vcard-name') ? document.getElementById('vcard-name').value.trim() : '',
      title: document.getElementById('vcard-title') ? document.getElementById('vcard-title').value.trim() : '',
      company: document.getElementById('vcard-company') ? document.getElementById('vcard-company').value.trim() : '',
      phone: document.getElementById('vcard-phone') ? document.getElementById('vcard-phone').value.trim() : '',
      email: document.getElementById('vcard-email') ? document.getElementById('vcard-email').value.trim() : '',
      website: document.getElementById('vcard-website') ? document.getElementById('vcard-website').value.trim() : '',
      address: document.getElementById('vcard-address') ? document.getElementById('vcard-address').value.trim() : '',
      instagram: document.getElementById('vcard-instagram') ? document.getElementById('vcard-instagram').value.trim() : '',
      facebook: document.getElementById('vcard-facebook') ? document.getElementById('vcard-facebook').value.trim() : '',
      linkedin: document.getElementById('vcard-linkedin') ? document.getElementById('vcard-linkedin').value.trim() : '',
      twitter: document.getElementById('vcard-twitter') ? document.getElementById('vcard-twitter').value.trim() : ''
    };

    // Mobile OS redirects
    if (currentMerchant.plan === 'agency') {
      const osEnabledInput = document.getElementById('qr-os-enabled');
      const osEnabled = osEnabledInput ? osEnabledInput.checked : false;
      payload.osRedirectEnabled = osEnabled;
      payload.iosTargetUrl = document.getElementById('qr-ios-url') ? document.getElementById('qr-ios-url').value.trim() : '';
      payload.androidTargetUrl = document.getElementById('qr-android-url') ? document.getElementById('qr-android-url').value.trim() : '';
    }
  }

  try {
    const res = await fetch('/api/qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create QR code.');

    document.getElementById('create-qr-form').reset();
    
    // Reset password & expiration accordions
    const pwContent = document.getElementById('creator-password-content');
    const pwArrow = document.getElementById('creator-password-arrow');
    const expContent = document.getElementById('creator-expiration-content');
    const expArrow = document.getElementById('creator-expiration-arrow');
    const trackingContent = document.getElementById('creator-tracking-content');
    const trackingArrow = document.getElementById('creator-tracking-arrow');
    const vcardContent = document.getElementById('creator-vcard-content');
    const vcardArrow = document.getElementById('creator-vcard-arrow');
    const osContent = document.getElementById('creator-os-content');
    const osArrow = document.getElementById('creator-os-arrow');

    if (pwContent) pwContent.style.display = 'none';
    if (pwArrow) pwArrow.style.transform = 'rotate(0deg)';
    if (expContent) expContent.style.display = 'none';
    if (expArrow) expArrow.style.transform = 'rotate(0deg)';
    if (trackingContent) trackingContent.style.display = 'none';
    if (trackingArrow) trackingArrow.style.transform = 'rotate(0deg)';
    if (vcardContent) vcardContent.style.display = 'none';
    if (vcardArrow) vcardArrow.style.transform = 'rotate(0deg)';
    if (osContent) osContent.style.display = 'none';
    if (osArrow) osArrow.style.transform = 'rotate(0deg)';
    
    setTimeout(() => {
      toggleCreatorPasswordFields();
      toggleCreatorExpirationFields();
      toggleCreatorVcardFields();
      toggleCreatorOsFields();
    }, 0);

    // Reset styling controls
    const colorTextEl = document.getElementById('qr-brand-color-text');
    if (colorTextEl) colorTextEl.innerText = '#000000';
    const logoPreview = document.getElementById('qr-logo-preview');
    if (logoPreview) logoPreview.innerText = currentLang === 'tr' ? 'Dosya seçilmedi' : 'No file selected';
    const logoUrlInput = document.getElementById('qr-logo-url');
    if (logoUrlInput) logoUrlInput.value = '';
    const stylingContent = document.getElementById('creator-style-content');
    const stylingArrow = document.getElementById('creator-style-arrow');
    if (stylingContent) stylingContent.style.display = 'none';
    if (stylingArrow) stylingArrow.style.transform = 'rotate(0deg)';

    await showAlert(dict["alert-qr-created"]);
    fetchQrsList();
  } catch (err) {
    await showAlert(err.message);
  }
}

async function handleBulkCreate(event) {
  event.preventDefault();

  const errDiv = document.getElementById('create-error');
  errDiv.style.display = 'none';
  const dict = translations[currentLang];
  const csvData = document.getElementById('bulk-csv-data').value.trim();

  if (!csvData) {
    await showAlert(currentLang === 'tr' ? 'Lütfen CSV verisi girin.' : 'Please enter CSV data.');
    return;
  }

  try {
    const res = await fetch('/api/qr/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchantId: currentMerchant.id, csvData })
    });

    const response = await res.json();
    if (!res.ok) throw new Error(response.error || 'Bulk creation failed.');

    document.getElementById('bulk-csv-data').value = '';
    const msg = dict["alert-bulk-success"]
      .replace('{success}', response.created.length)
      .replace('{error}', response.errors.length);
    
    if (response.errors.length > 0) {
      await showAlert(msg + '\n\n' + response.errors.join('\n'));
    } else {
      await showAlert(msg);
    }
    fetchQrsList();
  } catch (err) {
    await showAlert(err.message);
  }
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function openEditModal(qrId) {
  const qr = activeQrList.find(q => q.id === qrId);
  if (!qr) return;

  document.getElementById('edit-id').value = qr.id;
  document.getElementById('edit-title').value = qr.title;
  document.getElementById('edit-code').value = qr.shortCode;
  document.getElementById('edit-target').value = qr.targetUrl;

  const paid = isPaidPlan();
  const isAgency = currentMerchant.plan === 'agency';

  const passwordBadge = document.getElementById('edit-features-pro-badge');
  const passwordEnableInput = document.getElementById('edit-password-enabled');
  const expirationEnableInput = document.getElementById('edit-expiration-enabled');
  const vcardEnableInput = document.getElementById('edit-vcard-enabled');
  const osEnableInput = document.getElementById('edit-os-enabled');

  if (paid) {
    if (passwordBadge) passwordBadge.style.display = 'none';
    if (passwordEnableInput) {
      passwordEnableInput.removeAttribute('disabled');
      passwordEnableInput.checked = !!qr.passwordEnabled;
    }
    if (expirationEnableInput) {
      expirationEnableInput.removeAttribute('disabled');
      expirationEnableInput.checked = !!qr.expirationEnabled;
    }
    if (vcardEnableInput) {
      vcardEnableInput.removeAttribute('disabled');
      vcardEnableInput.checked = !!qr.vcardEnabled;
    }

    const passwordInput = document.getElementById('edit-password');
    if (passwordInput) passwordInput.value = qr.qrPassword || '';

    const expirationDateInput = document.getElementById('edit-expiration-date');
    const expirationScansInput = document.getElementById('edit-expiration-scans');
    const expirationFallbackInput = document.getElementById('edit-expiration-fallback');

    if (expirationDateInput) {
      if (qr.expirationDate) {
        const localDate = new Date(qr.expirationDate);
        const offset = localDate.getTimezoneOffset();
        const adjustedDate = new Date(localDate.getTime() - (offset * 60 * 1000));
        expirationDateInput.value = adjustedDate.toISOString().slice(0, 16);
      } else {
        expirationDateInput.value = '';
      }
    }
    if (expirationScansInput) expirationScansInput.value = qr.expirationScanLimit || '';
    if (expirationFallbackInput) expirationFallbackInput.value = qr.expirationFallbackUrl || '';

    // Set GA / FB pixels
    const gaInput = document.getElementById('edit-ga-id');
    const fbInput = document.getElementById('edit-fb-id');
    if (gaInput) gaInput.value = qr.googleAnalyticsId || '';
    if (fbInput) fbInput.value = qr.facebookPixelId || '';

    // Set vCard details
    const vc = qr.vcardData || {};
    const ids = ['name', 'title', 'company', 'phone', 'email', 'website', 'address', 'instagram', 'facebook', 'linkedin', 'twitter'];
    ids.forEach(key => {
      const el = document.getElementById('edit-vcard-' + key);
      if (el) el.value = vc[key] || '';
    });

  } else {
    if (passwordBadge) passwordBadge.style.display = 'block';
    if (passwordEnableInput) {
      passwordEnableInput.setAttribute('disabled', 'true');
      passwordEnableInput.checked = false;
    }
    if (expirationEnableInput) {
      expirationEnableInput.setAttribute('disabled', 'true');
      expirationEnableInput.checked = false;
    }
    if (vcardEnableInput) {
      vcardEnableInput.setAttribute('disabled', 'true');
      vcardEnableInput.checked = false;
    }
    const gaInput = document.getElementById('edit-ga-id');
    const fbInput = document.getElementById('edit-fb-id');
    if (gaInput) gaInput.value = '';
    if (fbInput) fbInput.value = '';
  }

  // Set OS redirect fields
  if (isAgency) {
    if (osEnableInput) {
      osEnableInput.removeAttribute('disabled');
      osEnableInput.checked = !!qr.osRedirectEnabled;
    }
    const iosInput = document.getElementById('edit-ios-url');
    const androidInput = document.getElementById('edit-android-url');
    if (iosInput) iosInput.value = qr.iosTargetUrl || '';
    if (androidInput) androidInput.value = qr.androidTargetUrl || '';
  } else {
    if (osEnableInput) {
      osEnableInput.setAttribute('disabled', 'true');
      osEnableInput.checked = false;
    }
    const iosInput = document.getElementById('edit-ios-url');
    const androidInput = document.getElementById('edit-android-url');
    if (iosInput) iosInput.value = '';
    if (androidInput) androidInput.value = '';
  }

  setTimeout(() => {
    toggleEditPasswordFields();
    toggleEditExpirationFields();
    toggleEditVcardFields();
    toggleEditOsFields();
  }, 0);
  
  // Custom styling controls unlocking (Pro AND Agency)
  const proBadge = document.getElementById('edit-pro-badge');
  const proInputs = ['edit-brand-color', 'edit-logo-file', 'btn-upload-edit-logo'];
  
  if (paid) {
    if (proBadge) proBadge.style.display = 'none';
    proInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.removeAttribute('disabled');
    });
    const colorEl = document.getElementById('edit-brand-color');
    const colorTextEl = document.getElementById('edit-brand-color-text');
    const logoEl = document.getElementById('edit-logo-url');
    const logoPreviewEl = document.getElementById('edit-logo-preview');
    if (colorEl) colorEl.value = qr.brandColor || '#000000';
    if (colorTextEl) colorTextEl.innerText = (qr.brandColor || '#000000').toUpperCase();
    if (logoEl) logoEl.value = qr.logoUrl || '';
    if (logoPreviewEl) {
      if (qr.logoUrl) {
        if (qr.logoUrl.startsWith('data:')) {
          logoPreviewEl.innerText = currentLang === 'tr' ? 'Yüklenen Görsel' : 'Uploaded Image';
        } else {
          const parts = qr.logoUrl.split('/');
          logoPreviewEl.innerText = parts[parts.length - 1];
        }
      } else {
        logoPreviewEl.innerText = currentLang === 'tr' ? 'Dosya seçilmedi' : 'No file selected';
      }
    }
  } else {
    if (proBadge) proBadge.style.display = 'block';
    proInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.setAttribute('disabled', 'true');
    });
    const logoPreviewEl = document.getElementById('edit-logo-preview');
    if (logoPreviewEl) {
      logoPreviewEl.innerText = currentLang === 'tr' ? 'Dosya seçilmedi' : 'No file selected';
    }
    const logoEl = document.getElementById('edit-logo-url');
    if (logoEl) logoEl.value = '';
  }

  // Time Redirection configs
  const timeBadge = document.getElementById('edit-time-pro-badge');
  const timeEnableInput = document.getElementById('edit-time-enabled');
  
  if (paid) {
    if (timeBadge) timeBadge.style.display = 'none';
    if (timeEnableInput) {
      timeEnableInput.removeAttribute('disabled');
      timeEnableInput.checked = !!qr.timeEnabled;
    }
    const timeTargetEl = document.getElementById('edit-time-target');
    const timeStartEl = document.getElementById('edit-time-start');
    const timeEndEl = document.getElementById('edit-time-end');
    if (timeTargetEl) timeTargetEl.value = qr.timeTargetUrl || '';
    if (timeStartEl) timeStartEl.value = qr.timeStartHour !== undefined ? qr.timeStartHour : 17;
    if (timeEndEl) timeEndEl.value = qr.timeEndHour !== undefined ? qr.timeEndHour : 23;
  } else {
    if (timeBadge) timeBadge.style.display = 'block';
    if (timeEnableInput) {
      timeEnableInput.setAttribute('disabled', 'true');
      timeEnableInput.checked = false;
    }
  }

  toggleTimeInputs();
  document.getElementById('edit-modal').classList.add('active');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

function closeEditModal() { closeModal('edit-modal'); }

async function handleSaveEdit(event) {
  event.preventDefault();

  const errDiv = document.getElementById('edit-error');
  errDiv.style.display = 'none';

  const qrId = document.getElementById('edit-id').value;
  const title = document.getElementById('edit-title').value.trim();
  const shortCode = document.getElementById('edit-code').value.trim();
  const targetUrl = document.getElementById('edit-target').value.trim();
  const dict = translations[currentLang];

  // Client-side slug validation
  if (!/^[a-z0-9_-]+$/i.test(shortCode)) {
    errDiv.innerText = currentLang === 'tr'
      ? 'Kısa kod sadece harf, rakam, tire ve alt çizgi içerebilir.'
      : 'Short code can only contain letters, numbers, dashes, and underscores.';
    errDiv.style.display = 'block';
    return;
  }

  const payload = { title, shortCode, targetUrl };
  
  // Include Pro/Agency-only fields
  if (isPaidPlan()) {
    const colorEl = document.getElementById('edit-brand-color');
    const logoEl = document.getElementById('edit-logo-url');
    const timeEl = document.getElementById('edit-time-enabled');
    const timeTargetEl = document.getElementById('edit-time-target');
    const timeStartEl = document.getElementById('edit-time-start');
    const timeEndEl = document.getElementById('edit-time-end');
    
    if (colorEl) payload.brandColor = colorEl.value;
    if (logoEl) payload.logoUrl = logoEl.value;
    if (timeEl) payload.timeEnabled = timeEl.checked;
    if (timeTargetEl) payload.timeTargetUrl = timeTargetEl.value.trim();
    if (timeStartEl) payload.timeStartHour = parseInt(timeStartEl.value) || 0;
    if (timeEndEl) payload.timeEndHour = parseInt(timeEndEl.value) || 0;

    // Password Protection fields
    const passwordEnabled = document.getElementById('edit-password-enabled').checked;
    const qrPassword = document.getElementById('edit-password').value.trim();
    payload.passwordEnabled = passwordEnabled;
    payload.qrPassword = qrPassword;

    // Expiration Rules fields
    const expirationEnabled = document.getElementById('edit-expiration-enabled').checked;
    const expirationDateInput = document.getElementById('edit-expiration-date').value;
    const expirationScansLimit = document.getElementById('edit-expiration-scans').value.trim();
    const expirationFallbackUrl = document.getElementById('edit-expiration-fallback').value.trim();

    payload.expirationEnabled = expirationEnabled;
    payload.expirationDate = expirationDateInput ? new Date(expirationDateInput).toISOString() : null;
    payload.expirationScanLimit = expirationScanLimit ? parseInt(expirationScanLimit) : null;
    payload.expirationFallbackUrl = expirationFallbackUrl;

    // Tracking Pixels
    payload.googleAnalyticsId = document.getElementById('edit-ga-id').value.trim();
    payload.facebookPixelId = document.getElementById('edit-fb-id').value.trim();

    // vCard dynamic profiles
    const vcardEnabled = document.getElementById('edit-vcard-enabled').checked;
    payload.vcardEnabled = vcardEnabled;
    payload.vcardData = {
      name: document.getElementById('edit-vcard-name').value.trim(),
      title: document.getElementById('edit-vcard-title').value.trim(),
      company: document.getElementById('edit-vcard-company').value.trim(),
      phone: document.getElementById('edit-vcard-phone').value.trim(),
      email: document.getElementById('edit-vcard-email').value.trim(),
      website: document.getElementById('edit-vcard-website').value.trim(),
      address: document.getElementById('edit-vcard-address').value.trim(),
      instagram: document.getElementById('edit-vcard-instagram').value.trim(),
      facebook: document.getElementById('edit-vcard-facebook').value.trim(),
      linkedin: document.getElementById('edit-vcard-linkedin').value.trim(),
      twitter: document.getElementById('edit-vcard-twitter').value.trim()
    };

    // Mobile OS redirects (Agency Only)
    if (currentMerchant.plan === 'agency') {
      const osEnabled = document.getElementById('edit-os-enabled').checked;
      payload.osRedirectEnabled = osEnabled;
      payload.iosTargetUrl = document.getElementById('edit-ios-url').value.trim();
      payload.androidTargetUrl = document.getElementById('edit-android-url').value.trim();
    }
  }

  try {
    const res = await fetch(`/api/qr/${qrId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update QR Code.');

    await showAlert(dict["alert-settings-saved"]);
    closeEditModal();
    fetchQrsList();
  } catch (err) {
    await showAlert(err.message);
  }
}

// ─── Color Picker Real-time Preview ──────────────────────────────────────────
function updateColorText(inputId, textId) {
  const input = document.getElementById(inputId);
  const text = document.getElementById(textId);
  if (input && text) text.innerText = input.value.toUpperCase();
}

// ─── Print Table Tent ─────────────────────────────────────────────────────────
function printTableTent(qrId) {
  const qr = activeQrList.find(q => q.id === qrId);
  if (!qr) return;

  const isCustomActive = currentMerchant.plan === 'agency' && currentMerchant.customDomainStatus === 'active' && currentMerchant.customDomain;
  const redirectUrl = isCustomActive ? `http://${currentMerchant.customDomain}/r/${qr.shortCode}` : `${window.location.origin}/r/${qr.shortCode}`;
  const printWindow = window.open('', '_blank');

  const titleText = currentLang === 'tr' ? 'Masa Kartı Şablonu' : 'Printable Table Tent';
  const instruction = currentLang === 'tr' ? 'Menü için kameranızla taratın' : 'Scan with your camera to view menu';

  printWindow.document.write(`
    <html>
    <head>
      <title>${titleText} - ${qr.title}</title>
      <style>
        body { font-family: sans-serif; text-align: center; margin: 0; padding: 20px; background: white; color: black; }
        .tent-card { width: 140mm; height: 200mm; margin: 0 auto; border: 1px dashed #777; display: flex; flex-direction: column; justify-content: space-between; padding: 30px; box-sizing: border-box; position: relative; }
        .fold-line { border-top: 2px dashed #bbb; position: absolute; left: 0; right: 0; top: 50%; }
        .card-half { height: 50%; display: flex; flex-direction: column; justify-content: center; align-items: center; box-sizing: border-box; }
        .card-half.top { transform: rotate(180deg); border-bottom: 1px dashed #eee; }
        .qr-container { padding: 10px; background: white; display: inline-block; border: 1px solid #ccc; border-radius: 6px; }
        h2 { margin: 8px 0; font-size: 20px; color: ${qr.brandColor || '#000000'}; }
        p { font-size: 11px; color: #555; margin: 4px 0; }
        .link-text { font-family: monospace; font-size: 10px; color: #777; margin-top: 8px; }
      </style>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
    </head>
    <body>
      <div class="tent-card">
        <div class="card-half top">
          <h2>${qr.title}</h2>
          <p>${instruction}</p>
          <div id="qr-top" class="qr-container"></div>
          <div class="link-text">${redirectUrl}</div>
        </div>
        <div class="card-half">
          <h2>${qr.title}</h2>
          <p>${instruction}</p>
          <div id="qr-bottom" class="qr-container"></div>
          <div class="link-text">${redirectUrl}</div>
        </div>
        <div class="fold-line"></div>
      </div>
      <script>
        function drawLogo(boxId) {
          const box = document.getElementById(boxId);
          if (!box) return;
          const canvas = box.querySelector('canvas');
          const previewImg = box.querySelector('img');
          if (canvas) {
            const ctx = canvas.getContext('2d');
            const logoImg = new Image();
            logoImg.crossOrigin = "anonymous";
            logoImg.src = "${qr.logoUrl}";
            logoImg.onload = () => {
              try {
                const logoSize = canvas.width * 0.22;
                const x = (canvas.width - logoSize) / 2;
                const y = (canvas.height - logoSize) / 2;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x - 2, y - 2, logoSize + 4, logoSize + 4);
                ctx.drawImage(logoImg, x, y, logoSize, logoSize);
                if (previewImg) previewImg.src = canvas.toDataURL('image/png');
              } catch (e) {
                console.error(e);
              }
            };
          }
        }

        new QRCode(document.getElementById('qr-top'), { text: "${redirectUrl}", width: 140, height: 140, colorDark: "${qr.brandColor || '#000000'}", colorLight: "#ffffff" });
        new QRCode(document.getElementById('qr-bottom'), { text: "${redirectUrl}", width: 140, height: 140, colorDark: "${qr.brandColor || '#000000'}", colorLight: "#ffffff" });

        ${isPaidPlan() && qr.logoUrl ? `
          setTimeout(() => {
            drawLogo('qr-top');
            drawLogo('qr-bottom');
          }, 100);
        ` : ''}

        setTimeout(() => { window.print(); }, 800);
      <\/script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// ─── Download QR as PNG ───────────────────────────────────────────────────────
function downloadQr(qrId) {
  const box = document.getElementById(`qr-preview-${qrId}`);
  if (!box) return;

  const qr = activeQrList.find(q => q.id === qrId);
  const titleSlug = qr ? qr.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'qrcode';

  // qrcodejs renders a canvas element (preferred) or img
  const canvas = box.querySelector('canvas');
  if (canvas) {
    const link = document.createElement('a');
    link.download = `${titleSlug}_qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    return;
  }

  // Fallback to img
  const img = box.querySelector('img');
  if (img) {
    const link = document.createElement('a');
    link.download = `${titleSlug}_qr.png`;
    link.href = img.src;
    link.click();
  }
}

// ─── Download QR as SVG Vector ────────────────────────────────────────────────
function downloadQrSvg(qrId) {
  const qr = activeQrList.find(q => q.id === qrId);
  if (!qr) return;

  const isCustomActive = currentMerchant.plan === 'agency' && currentMerchant.customDomainStatus === 'active' && currentMerchant.customDomain;
  const redirectUrl = isCustomActive ? `http://${currentMerchant.customDomain}/r/${qr.shortCode}` : `${window.location.origin}/r/${qr.shortCode}`;
  const brandColor = qr.brandColor || '#000000';

  const tempDiv = document.createElement('div');
  const tempQr = new QRCode(tempDiv, {
    text: redirectUrl,
    width: 256,
    height: 256,
    correctLevel: QRCode.CorrectLevel.M
  });

  const qrModel = tempQr._oQRCode;
  const count = qrModel.moduleCount;

  let pathData = '';
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qrModel.isDark(r, c)) {
        pathData += `M${c},${r}h1v1h-1z `;
      }
    }
  }

  // Embed center logo inside downloaded SVG if paid plan
  const hasLogo = isPaidPlan() && qr.logoUrl;
  let logoSvg = '';
  if (hasLogo) {
    const logoModules = Math.round(count * 0.22);
    const logoPos = (count - logoModules) / 2;
    logoSvg = `\n  <rect x="${logoPos - 0.5}" y="${logoPos - 0.5}" width="${logoModules + 1}" height="${logoModules + 1}" fill="white"/>\n  <image x="${logoPos}" y="${logoPos}" width="${logoModules}" height="${logoModules}" href="${qr.logoUrl}"/>`;
  }

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${count} ${count}" width="512" height="512">
  <rect width="${count}" height="${count}" fill="white"/>
  <path fill="${brandColor}" d="${pathData.trim()}"/>${logoSvg}
</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const titleSlug = qr.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  link.href = url;
  link.download = `${titleSlug}_qr.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Delete QR ────────────────────────────────────────────────────────────────
async function deleteQr(qrId) {
  const qr = activeQrList.find(q => q.id === qrId);
  if (!qr) return;

  const dict = translations[currentLang];
  const confirmMsg = dict["confirm-delete-qr"].replace('{title}', qr.title);

  if (!await showConfirm(confirmMsg)) return;

  try {
    const res = await fetch(`/api/qr/${qrId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(currentLang === 'tr' ? 'Silme işlemi başarısız oldu.' : 'Deletion failed.');
    await showAlert(dict["alert-qr-deleted"]);
    fetchQrsList();
  } catch (err) {
    await showAlert((currentLang === 'tr' ? 'QR Kod silinirken hata oluştu: ' : 'Error deleting QR Code: ') + err.message);
  }
}

// ─── Upgrade Modal ────────────────────────────────────────────────────────────
async function openUpgradeModal() {
  document.getElementById('upgrade-modal').classList.add('active');
  document.getElementById('checkout-tier').value = 'pro';

  // Load payment links configuration from backend
  try {
    const res = await fetch('/api/payment-links');
    paymentLinks = await res.json();
  } catch (err) {
    console.error('Failed to load payment links:', err);
  }

  const submitBtn = document.getElementById('checkout-submit-btn');
  if (submitBtn) {
    submitBtn.removeAttribute('disabled');
    submitBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg> Ödemeyi Kontrol Et / Yenile`;
  }

  updateCheckoutPrice();
}

function closeUpgradeModal() {
  closeModal('upgrade-modal');
}

function updateCheckoutPrice() {
  const tier = document.getElementById('checkout-tier').value;
  const priceEl = document.getElementById('checkout-price-display');
  const itemEl = document.getElementById('checkout-item-name');
  const linkEl = document.getElementById('checkout-shopier-btn');
  const submitBtn = document.getElementById('checkout-submit-btn');
  const isTR = currentLang === 'tr';

  const isPro = tier === 'pro';

  if (tier === 'agency') {
    priceEl.innerText = isTR ? '1000.00 TL / ay' : '1000.00 TL / month';
    itemEl.innerText = isTR ? 'QRAurify Ajans Aylık Abonelik' : 'QRAurify Agency Monthly Subscription';
  } else {
    priceEl.innerText = isTR ? '500.00 TL / ay' : '500.00 TL / month';
    itemEl.innerText = isTR ? 'QRAurify Pro Aylık Abonelik' : 'QRAurify Pro Monthly Subscription';
  }

  if (submitBtn) {
    submitBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg> ${isTR ? 'Ödemeyi Kontrol Et / Yenile' : 'Check Payment / Refresh'}`;
  }

  // Update redirect URL for Shopier checkout page
  if (linkEl && paymentLinks) {
    linkEl.href = isPro ? paymentLinks.proLink : paymentLinks.agencyLink;
    linkEl.innerText = isTR ? 'Shopier ile Öde (Yeni Sekmede)' : 'Pay with Shopier (New Tab)';
  }
}

// ─── Automated Webhook Payment Check ─────────────────────────────────────────
async function checkPaymentStatus() {
  const submitBtn = document.getElementById('checkout-submit-btn');
  if (submitBtn) {
    submitBtn.setAttribute('disabled', 'true');
    submitBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Kontrol Ediliyor...`;
  }

  try {
    // Pull latest profile from server
    await refreshMerchantData();
    
    const isTR = currentLang === 'tr';
    if (isPaidPlan()) {
      closeUpgradeModal();
      await showAlert(isTR 
        ? `🎉 Tebrikler! Ödemeniz doğrulandı ve hesabınız başarıyla ${currentMerchant.plan === 'agency' ? 'Ajans' : 'Pro'} paketine yükseltildi!`
        : `🎉 Congratulations! Your payment has been verified and your account has been upgraded to ${currentMerchant.plan} plan!`);
    } else {
      await showAlert(isTR 
        ? `Ödemeniz henüz doğrulanmadı. Shopier üzerinden ödeme yaptığınızdan emin olun. Ödemeyi tamamladıysanız birkaç saniye bekleyip tekrar deneyin.`
        : `Payment not verified yet. Make sure you completed payment on Shopier. If you paid, wait a few seconds and try again.`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    if (submitBtn) {
      submitBtn.removeAttribute('disabled');
      submitBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg> ${currentLang === 'tr' ? 'Ödemeyi Kontrol Et / Yenile' : 'Check Payment / Refresh'}`;
    }
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────
function handleLogout() {
  localStorage.removeItem('qr_merchant');
  window.location.href = '/index.html';
}

// ─── Billing Simulation ───────────────────────────────────────────────────────
async function simulateBillingStatus(status) {
  try {
    const res = await fetch(`/api/merchants/${currentMerchant.id}/subscription-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || (currentLang === 'tr' ? 'Abonelik simülasyon durumu güncellenemedi.' : 'Failed to update billing simulation state.'));

    await showAlert(currentLang === 'tr' ? 'Abonelik ödeme durumu simülasyonu güncellendi!' : 'Simulated subscription status updated!');
    refreshMerchantData();
  } catch (err) {
    await showAlert((currentLang === 'tr' ? 'Durum güncellenirken hata oluştu: ' : 'Error updating status: ') + err.message);
  }
}

// ─── Export Scans to CSV ──────────────────────────────────────────────────────
async function exportScansToCsv() {
  try {
    const res = await fetch(`/api/merchants/${currentMerchant.id}/analytics?all=true`);
    if (!res.ok) throw new Error(currentLang === 'tr' ? 'Analiz verileri alınamadı.' : 'Failed to retrieve analytics.');
    const data = await res.json();
    
    const scans = data.allScans || data.recentScans || [];
    if (scans.length === 0) {
      await showAlert(currentLang === 'tr' ? 'Aktarılacak tarama verisi bulunamadı.' : 'No scan data available to export.');
      return;
    }
    
    let csvRows = ['Time,QR Code,Device,Referrer,Location'];
    scans.forEach(s => {
      const time = new Date(s.timestamp).toISOString();
      const qrTitle = s.qrTitle.replace(/"/g, '""');
      csvRows.push(`"${time}","${qrTitle}","${s.device}","${s.referrer}","${s.country}"`);
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `qraurify_scans_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    await showAlert((currentLang === 'tr' ? 'CSV Aktarımı başarısız oldu: ' : 'CSV Export failed: ') + err.message);
  }
}

// ─── Custom Domain (Agency Plan) ──────────────────────────────────────────────
async function handleSaveDomain(event) {
  event.preventDefault();
  const domain = document.getElementById('agency-custom-domain').value.trim();
  if (!domain) return;

  try {
    const res = await fetch(`/api/merchants/${currentMerchant.id}/custom-domain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customDomain: domain })
    });

    if (!res.ok) throw new Error(currentLang === 'tr' ? 'Alan adı kaydedilemedi.' : 'Failed to save domain.');
    await showAlert(currentLang === 'tr' ? 'Özel alan adı kaydedildi! DNS doğrulaması bekliyor.' : 'Custom domain saved! DNS verification pending.');
    refreshMerchantData();
  } catch (err) {
    await showAlert((currentLang === 'tr' ? 'Alan adı kaydedilirken hata oluştu: ' : 'Error saving domain: ') + err.message);
  }
}

async function simulateVerifyDomain() {
  try {
    const res = await fetch(`/api/merchants/${currentMerchant.id}/verify-domain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) throw new Error(currentLang === 'tr' ? 'Alan adı doğrulanamadı.' : 'Failed to verify domain.');
    await showAlert(currentLang === 'tr' ? 'DNS doğrulaması başarılı! Özel alan adınız aktif.' : 'DNS verification successful! Your custom domain is active.');
    refreshMerchantData();
  } catch (err) {
    await showAlert((currentLang === 'tr' ? 'Alan adı doğrulanırken hata oluştu: ' : 'Error verifying domain: ') + err.message);
  }
}

// Creator & Edit Form Accordions
function toggleCreatorPasswordAccordion() {
  const content = document.getElementById('creator-password-content');
  const arrow = document.getElementById('creator-password-arrow');
  if (content && arrow) {
    if (content.style.display === 'none') {
      content.style.display = 'flex';
      arrow.style.transform = 'rotate(180deg)';
    } else {
      content.style.display = 'none';
      arrow.style.transform = 'rotate(0deg)';
    }
  }
}

function toggleCreatorExpirationAccordion() {
  const content = document.getElementById('creator-expiration-content');
  const arrow = document.getElementById('creator-expiration-arrow');
  if (content && arrow) {
    if (content.style.display === 'none') {
      content.style.display = 'flex';
      arrow.style.transform = 'rotate(180deg)';
    } else {
      content.style.display = 'none';
      arrow.style.transform = 'rotate(0deg)';
    }
  }
}

function toggleCreatorTrackingAccordion() {
  const content = document.getElementById('creator-tracking-content');
  const arrow = document.getElementById('creator-tracking-arrow');
  if (content && arrow) {
    if (content.style.display === 'none') {
      content.style.display = 'flex';
      arrow.style.transform = 'rotate(180deg)';
    } else {
      content.style.display = 'none';
      arrow.style.transform = 'rotate(0deg)';
    }
  }
}

function toggleCreatorVcardAccordion() {
  const content = document.getElementById('creator-vcard-content');
  const arrow = document.getElementById('creator-vcard-arrow');
  if (content && arrow) {
    if (content.style.display === 'none') {
      content.style.display = 'flex';
      arrow.style.transform = 'rotate(180deg)';
    } else {
      content.style.display = 'none';
      arrow.style.transform = 'rotate(0deg)';
    }
  }
}

function toggleCreatorOsAccordion() {
  const content = document.getElementById('creator-os-content');
  const arrow = document.getElementById('creator-os-arrow');
  if (content && arrow) {
    if (content.style.display === 'none') {
      content.style.display = 'flex';
      arrow.style.transform = 'rotate(180deg)';
    } else {
      content.style.display = 'none';
      arrow.style.transform = 'rotate(0deg)';
    }
  }
}

function toggleCreatorPasswordFields() {
  const enabled = document.getElementById('qr-password-enabled').checked;
  const fields = document.getElementById('creator-password-fields');
  const input = document.getElementById('qr-password');
  if (fields) fields.style.display = enabled ? 'flex' : 'none';
  if (input && !enabled) input.value = '';
}

function toggleCreatorExpirationFields() {
  const enabled = document.getElementById('qr-expiration-enabled').checked;
  const fields = document.getElementById('creator-expiration-fields');
  if (fields) fields.style.display = enabled ? 'flex' : 'none';
  if (!enabled) {
    const d = document.getElementById('qr-expiration-date');
    const s = document.getElementById('qr-expiration-scans');
    const f = document.getElementById('qr-expiration-fallback');
    if (d) d.value = '';
    if (s) s.value = '';
    if (f) f.value = '';
  }
}

function toggleCreatorVcardFields() {
  const enabled = document.getElementById('qr-vcard-enabled').checked;
  const fields = document.getElementById('creator-vcard-fields');
  if (fields) fields.style.display = enabled ? 'flex' : 'none';
  if (!enabled) {
    const ids = ['vcard-name', 'vcard-title', 'vcard-company', 'vcard-phone', 'vcard-email', 'vcard-website', 'vcard-address', 'vcard-instagram', 'vcard-facebook', 'vcard-linkedin', 'vcard-twitter'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }
}

function toggleCreatorOsFields() {
  const enabled = document.getElementById('qr-os-enabled').checked;
  const fields = document.getElementById('creator-os-fields');
  if (fields) fields.style.display = enabled ? 'flex' : 'none';
  if (!enabled) {
    const ios = document.getElementById('qr-ios-url');
    const android = document.getElementById('qr-android-url');
    if (ios) ios.value = '';
    if (android) android.value = '';
  }
}

function toggleEditPasswordFields() {
  const enabled = document.getElementById('edit-password-enabled').checked;
  const container = document.getElementById('edit-password-fields-container');
  const input = document.getElementById('edit-password');
  if (container) container.style.display = enabled ? 'flex' : 'none';
  if (input && !enabled) input.value = '';
}

function toggleEditExpirationFields() {
  const enabled = document.getElementById('edit-expiration-enabled').checked;
  const container = document.getElementById('edit-expiration-fields-container');
  if (container) container.style.display = enabled ? 'flex' : 'none';
  if (!enabled) {
    const d = document.getElementById('edit-expiration-date');
    const s = document.getElementById('edit-expiration-scans');
    const f = document.getElementById('edit-expiration-fallback');
    if (d) d.value = '';
    if (s) s.value = '';
    if (f) f.value = '';
  }
}

function toggleEditVcardFields() {
  const enabled = document.getElementById('edit-vcard-enabled').checked;
  const container = document.getElementById('edit-vcard-fields-container');
  if (container) container.style.display = enabled ? 'flex' : 'none';
  if (!enabled) {
    const ids = ['edit-vcard-name', 'edit-vcard-title', 'edit-vcard-company', 'edit-vcard-phone', 'edit-vcard-email', 'edit-vcard-website', 'edit-vcard-address', 'edit-vcard-instagram', 'edit-vcard-facebook', 'edit-vcard-linkedin', 'edit-vcard-twitter'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }
}

function toggleEditOsFields() {
  const enabled = document.getElementById('edit-os-enabled').checked;
  const container = document.getElementById('edit-os-fields-container');
  if (container) container.style.display = enabled ? 'flex' : 'none';
  if (!enabled) {
    const ios = document.getElementById('edit-ios-url');
    const android = document.getElementById('edit-android-url');
    if (ios) ios.value = '';
    if (android) android.value = '';
  }
}

// ─── Modal Backdrop Close ─────────────────────────────────────────────────────
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});


// ─── Custom Modal Dialog Helper Functions ────────────────────────────────────
function showAlert(message, title = '') {
  return new Promise((resolve) => {
    const overlay = document.getElementById('custom-modal-overlay');
    const titleEl = document.getElementById('custom-modal-title');
    const msgEl = document.getElementById('custom-modal-message');
    const confirmBtn = document.getElementById('custom-modal-btn-confirm');
    const cancelBtn = document.getElementById('custom-modal-btn-cancel');
    const iconEl = document.querySelector('.custom-modal-icon');

    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'tr';

    iconEl.innerText = 'ℹ️';
    titleEl.innerText = title || (lang === 'tr' ? 'Bilgi' : 'Information');
    msgEl.innerText = message;
    
    cancelBtn.style.display = 'none';
    confirmBtn.innerText = lang === 'tr' ? 'Tamam' : 'OK';
    confirmBtn.className = 'btn btn-primary';

    overlay.style.display = 'flex';

    function onConfirm() {
      overlay.style.display = 'none';
      confirmBtn.removeEventListener('click', onConfirm);
      resolve(true);
    }
    confirmBtn.addEventListener('click', onConfirm);
  });
}

function showConfirm(message, title = '') {
  return new Promise((resolve) => {
    const overlay = document.getElementById('custom-modal-overlay');
    const titleEl = document.getElementById('custom-modal-title');
    const msgEl = document.getElementById('custom-modal-message');
    const confirmBtn = document.getElementById('custom-modal-btn-confirm');
    const cancelBtn = document.getElementById('custom-modal-btn-cancel');
    const iconEl = document.querySelector('.custom-modal-icon');

    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'tr';

    iconEl.innerText = '⚠️';
    titleEl.innerText = title || (lang === 'tr' ? 'Onay' : 'Confirmation');
    msgEl.innerText = message;
    
    cancelBtn.style.display = 'inline-block';
    cancelBtn.innerText = lang === 'tr' ? 'İptal' : 'Cancel';
    confirmBtn.innerText = lang === 'tr' ? 'Tamam' : 'Confirm';
    confirmBtn.className = 'btn btn-danger';

    overlay.style.display = 'flex';

    function onConfirm() {
      cleanup();
      resolve(true);
    }
    function onCancel() {
      cleanup();
      resolve(false);
    }
    function cleanup() {
      overlay.style.display = 'none';
      confirmBtn.removeEventListener('click', onConfirm);
      cancelBtn.removeEventListener('click', onCancel);
    }

    confirmBtn.addEventListener('click', onConfirm);
    cancelBtn.addEventListener('click', onCancel);
  });
}
