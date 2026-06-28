let merchantsList = [];
let activeFilter = 'all'; // 'all', 'pro', 'agency', 'free'

// Check session validity immediately on load
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch('/api/admin/check-session', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error('Oturum geçersiz.');
    }

    // Load merchants data
    await loadMerchants();
  } catch (err) {
    console.error('Admin session validation failed:', err);
    localStorage.removeItem('admin_token');
    window.location.href = 'login.html';
  }
});

// Load merchant accounts from server
async function loadMerchants() {
  const token = localStorage.getItem('admin_token');
  try {
    const res = await fetch('/api/admin/merchants', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error('Veriler alınamadı.');

    const data = await res.json();
    merchantsList = data;
    
    // Update stats counters
    calculateStats();

    // Render list
    renderMerchants();
  } catch (err) {
    console.error('Failed to load merchants:', err);
    await showAlert('Hata: ' + err.message);
  }
}

// Calculate KPI statistics
function calculateStats() {
  const total = merchantsList.length;
  const pro = merchantsList.filter(m => m.plan === 'pro' && m.subscriptionStatus === 'active').length;
  const agency = merchantsList.filter(m => m.plan === 'agency' && m.subscriptionStatus === 'active').length;
  
  // Calculate MRR: Pro Plan (500 TL/mo) + Agency Plan (1000 TL/mo)
  const mrr = (pro * 500) + (agency * 1000);

  document.getElementById('stat-total-merchants').innerText = total;
  document.getElementById('stat-pro-merchants').innerText = pro;
  document.getElementById('stat-agency-merchants').innerText = agency;
  document.getElementById('stat-mrr').innerText = mrr.toLocaleString('tr-TR') + ' TL';
}

// Render merchants list to the DOM table
function renderMerchants() {
  const tableBody = document.getElementById('merchants-table-body');
  const searchQuery = document.getElementById('search-input').value.toLowerCase().trim();

  // Filter list by selected tab and search query
  let filtered = merchantsList.filter(m => {
    // Tab filter
    if (activeFilter === 'pro' && m.plan !== 'pro') return false;
    if (activeFilter === 'agency' && m.plan !== 'agency') return false;
    if (activeFilter === 'free' && m.plan !== 'free') return false;

    // Search query filter
    if (searchQuery) {
      const emailMatch = m.email.toLowerCase().includes(searchQuery);
      const nameMatch = m.displayName && m.displayName.toLowerCase().includes(searchQuery);
      return emailMatch || nameMatch;
    }

    return true;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          Aradığınız kriterlere uygun kayıt bulunamadı.
        </td>
      </tr>
    `;
    return;
  }

  // Sort by registration date descending (newest first)
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  tableBody.innerHTML = filtered.map(m => {
    const regDate = m.createdAt ? new Date(m.createdAt).toLocaleDateString('tr-TR', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : '—';

    let planBadge = `<span class="badge badge-free">Ücretsiz</span>`;
    if (m.plan === 'pro') {
      planBadge = `<span class="badge badge-pro">Pro</span>`;
    } else if (m.plan === 'agency') {
      planBadge = `<span class="badge badge-agency">Ajans</span>`;
    }

    let statusText = `<span class="status-active">Aktif</span>`;
    if (m.subscriptionStatus === 'unpaid') {
      statusText = `<span class="status-unpaid">Gecikmiş Ödeme</span>`;
    } else if (m.subscriptionStatus === 'suspended') {
      statusText = `<span class="status-suspended">Askıda</span>`;
    }

    let expireCol = '—';
    if (m.plan !== 'free') {
      const expVal = m.subscriptionExpireDate ? m.subscriptionExpireDate.split('T')[0] : '—';
      expireCol = `<span style="font-family: monospace; font-size: 0.85rem; color: var(--text-primary);">${expVal}</span>`;
    }

    return `
      <tr>
        <td style="font-weight: 600;">${m.displayName || '—'}</td>
        <td style="font-family: monospace; font-size: 0.85rem; color: var(--accent-primary);">${m.email}</td>
        <td>${planBadge}</td>
        <td>${statusText}</td>
        <td>${expireCol}</td>
        <td style="color: var(--text-secondary);">${regDate}</td>
        <td style="text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; flex-wrap: wrap;">
            <select
              class="admin-action-select"
              onchange="updateMerchantPlan('${m.id}', this.value)"
              style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 6px; padding: 0.3rem 0.5rem; font-family: inherit; font-size: 0.8rem; cursor: pointer;"
            >
              <option value="free" ${m.plan === 'free' ? 'selected' : ''}>Ücretsiz</option>
              <option value="pro" ${m.plan === 'pro' ? 'selected' : ''}>Pro</option>
              <option value="agency" ${m.plan === 'agency' ? 'selected' : ''}>Ajans</option>
            </select>
            <select
              class="admin-action-select"
              onchange="updateMerchantStatus('${m.id}', this.value)"
              style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 6px; padding: 0.3rem 0.5rem; font-family: inherit; font-size: 0.8rem; cursor: pointer;"
            >
              <option value="active" ${m.subscriptionStatus === 'active' ? 'selected' : ''}>Aktif</option>
              <option value="unpaid" ${m.subscriptionStatus === 'unpaid' ? 'selected' : ''}>Gecikmiş</option>
              <option value="suspended" ${m.subscriptionStatus === 'suspended' ? 'selected' : ''}>Askıya Al</option>
            </select>
            <button
              onclick="deleteMerchantAdmin('${m.id}', '${(m.email || '').replace(/'/g, '\\\'')}')" 
              style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: var(--error); border-radius: 6px; padding: 0.3rem 0.6rem; font-size: 0.8rem; cursor: pointer; font-family: inherit; font-weight: 600; transition: background 0.2s;"
              onmouseover="this.style.background='rgba(239,68,68,0.2)'"
              onmouseout="this.style.background='rgba(239,68,68,0.1)'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="vertical-align: middle; margin-right: 2px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              Sil
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Handle tab filter selection
function setFilter(filter) {
  activeFilter = filter;
  
  // Toggle active tab visual styling
  document.querySelectorAll('.filter-tab').forEach(btn => btn.classList.remove('active'));
  document.getElementById('filter-' + filter).classList.add('active');

  renderMerchants();
}

// Handle search query filtering
function filterMerchants() {
  renderMerchants();
}

// ─── Admin: Update merchant plan ─────────────────────────────────────────
async function updateMerchantPlan(merchantId, newPlan) {
  const token = localStorage.getItem('admin_token');
  try {
    const res = await fetch(`/api/admin/merchants/${merchantId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ plan: newPlan })
    });
    if (!res.ok) throw new Error('Güncellenemedi.');
    const data = await res.json();
    // Update local list
    const idx = merchantsList.findIndex(m => m.id === merchantId);
    if (idx !== -1) merchantsList[idx] = data;
    calculateStats();
    renderMerchants();
  } catch (err) {
    await showAlert('Paket güncellenirken hata: ' + err.message);
    renderMerchants(); // Revert UI
  }
}


// ─── Admin: Update merchant subscription status ───────────────────────────
async function updateMerchantStatus(merchantId, newStatus) {
  const token = localStorage.getItem('admin_token');
  try {
    const res = await fetch(`/api/admin/merchants/${merchantId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ subscriptionStatus: newStatus })
    });
    if (!res.ok) throw new Error('Güncellenemedi.');
    const data = await res.json();
    const idx = merchantsList.findIndex(m => m.id === merchantId);
    if (idx !== -1) merchantsList[idx] = data;
    calculateStats();
    renderMerchants();
  } catch (err) {
    await showAlert('Durum güncellenirken hata: ' + err.message);
    renderMerchants();
  }
}

// ─── Admin: Delete merchant ───────────────────────────────────────────────────────
async function deleteMerchantAdmin(merchantId, email) {
  if (!await showConfirm(`"${email}" hesabını silmek istediğinizden emin misiniz?\nBu işlem geri alınamaz!`)) return;
  
  const token = localStorage.getItem('admin_token');
  try {
    const res = await fetch(`/api/admin/merchants/${merchantId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Silme başarısız.');
    merchantsList = merchantsList.filter(m => m.id !== merchantId);
    calculateStats();
    renderMerchants();
  } catch (err) {
    await showAlert('Hesap silinirken hata: ' + err.message);
  }
}

// Log out admin session
function handleLogout() {
  localStorage.removeItem('admin_token');
  window.location.href = 'login.html';
}


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
