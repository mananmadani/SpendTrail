// ============================================================
//  PROFILE MANAGER
// ============================================================
const PROFILES_KEY   = 'SpendTrail-profiles';
const ACTIVE_KEY     = 'SpendTrail-active-profile';
const MAX_PROFILES   = 5;
const PROFILE_COLORS = ['#667EEA','#4CAF50','#F44336','#FF9800','#9C27B0'];

function initProfiles() {
  const hasProfiles = localStorage.getItem(PROFILES_KEY);
  if (!hasProfiles) {
    const id = 'profile_' + Date.now();
    const profile = { id, name: 'Personal', createdAt: new Date().toISOString() };
    localStorage.setItem(PROFILES_KEY, JSON.stringify([profile]));
    localStorage.setItem(ACTIVE_KEY, id);

    // Migrate old flat keys for existing users upgrading to multi-profile
    const oldData     = localStorage.getItem('SpendTrail-data');
    const oldCurrency = localStorage.getItem('SpendTrail-currency');
    if (oldData)     { localStorage.setItem(`SpendTrail-${id}-data`, oldData);         localStorage.removeItem('SpendTrail-data'); }
    if (oldCurrency) { localStorage.setItem(`SpendTrail-${id}-currency`, oldCurrency); localStorage.removeItem('SpendTrail-currency'); }
  }
}

function getAllProfiles()      { return JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]'); }
function getActiveProfileId() { return localStorage.getItem(ACTIVE_KEY); }
function getActiveProfile()   {
  const profiles = getAllProfiles();
  const id = getActiveProfileId();
  return profiles.find(p => p.id === id) || profiles[0];
}
function getProfileColor(index) { return PROFILE_COLORS[index % PROFILE_COLORS.length]; }

// All localStorage reads/writes go through this key helper
function pk(baseKey) { return `SpendTrail-${getActiveProfileId()}-${baseKey}`; }

function createProfile(name) {
  const profiles = getAllProfiles();
  if (profiles.length >= MAX_PROFILES) { showToast('Profile limit reached (5/5)', 'error'); return null; }
  const id = 'profile_' + Date.now();
  profiles.push({ id, name: name.trim(), createdAt: new Date().toISOString() });
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  return id;
}

function renameProfile(id, newName) {
  const profiles = getAllProfiles();
  const p = profiles.find(x => x.id === id);
  if (!p) return;
  p.name = newName.trim();
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

function deleteProfile(id) {
  const profiles = getAllProfiles();
  if (profiles.length <= 1) { showToast('At least one profile must exist', 'error'); return false; }
  // Remove all localStorage keys belonging to this profile
  const prefix = `SpendTrail-${id}-`;
  Object.keys(localStorage).forEach(key => { if (key.startsWith(prefix)) localStorage.removeItem(key); });
  const updated = profiles.filter(p => p.id !== id);
  localStorage.setItem(PROFILES_KEY, JSON.stringify(updated));
  // If deleted profile was active, switch to first remaining
  if (getActiveProfileId() === id) localStorage.setItem(ACTIVE_KEY, updated[0].id);
  return true;
}

function switchProfile(id) {
  localStorage.setItem(ACTIVE_KEY, id);
  window.location.reload();
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}


// ============================================================
//  PROFILE UI
// ============================================================
function showManageProfiles() {
  const profiles = getAllProfiles();
  const activeId = getActiveProfileId();
  const atLimit  = profiles.length >= MAX_PROFILES;

  const cardsHTML = profiles.map((p, index) => {
    const isActive  = p.id === activeId;
    const color     = getProfileColor(index);
    const canDelete = profiles.length > 1;
    return `
      <div class="profile-card ${isActive ? 'profile-card--active' : ''}">
        <div class="profile-card__left" ${!isActive ? `onclick="confirmSwitchProfile('${p.id}','${escapeHtml(p.name)}')" style="cursor:pointer;"` : ''}>
          <div class="profile-dot" style="background:${color};"></div>
          <div class="profile-info">
            <div class="profile-name">${escapeHtml(p.name)}</div>
            ${isActive
              ? '<div class="profile-active-badge">● Active</div>'
              : '<div class="profile-tap-hint">Tap to switch</div>'}
          </div>
        </div>
        <div class="profile-card__actions">
          <button class="profile-action-btn profile-action-btn--rename"
            onclick="renameProfileFlow('${p.id}','${escapeHtml(p.name)}')">Rename</button>
          <button class="profile-action-btn profile-action-btn--delete ${!canDelete ? 'profile-action-btn--disabled' : ''}"
            ${!canDelete ? 'disabled title="At least one profile must exist"' : `onclick="deleteProfileFlow('${p.id}','${escapeHtml(p.name)}')"`}>Delete</button>
        </div>
      </div>`;
  }).join('');

  const newBtnHTML = atLimit
    ? `<div class="profile-limit-note">Profile limit reached (${profiles.length}/${MAX_PROFILES})</div>`
    : `<button class="profile-new-btn" onclick="createProfileFlow()">＋ &nbsp; New Profile</button>`;

  openOverlay('Manage Profiles', `
    <div class="profile-list">${cardsHTML}</div>
    <div class="profile-new-wrap">${newBtnHTML}</div>
  `);
}

function confirmSwitchProfile(id, name) {
  if (confirm(`Switch to "${name}"?\n\nYour current data stays saved. You can switch back anytime.`)) {
    switchProfile(id);
  }
}

function createProfileFlow() {
  const profiles = getAllProfiles();
  if (profiles.length >= MAX_PROFILES) { showToast('Profile limit reached (5/5)', 'error'); return; }
  const name = prompt('Profile name:\n(e.g. Business, Travel, Family)');
  if (name === null) return;
  if (!name.trim())           { showToast('Name cannot be empty', 'error');          return; }
  if (name.trim().length > 20){ showToast('Name too long (max 20 chars)', 'error'); return; }
  const existing = getAllProfiles().map(p => p.name.toLowerCase());
  if (existing.includes(name.trim().toLowerCase())) { showToast('Profile name already exists', 'error'); return; }
  const id = createProfile(name);
  if (id) { showToast(`"${name.trim()}" created!`, 'success'); showManageProfiles(); }
}

function renameProfileFlow(id, currentName) {
  const newName = prompt(`Rename "${currentName}" to:`, currentName);
  if (newName === null) return;
  if (!newName.trim())            { showToast('Name cannot be empty', 'error');          return; }
  if (newName.trim().length > 20) { showToast('Name too long (max 20 chars)', 'error'); return; }
  const existing = getAllProfiles().filter(p => p.id !== id).map(p => p.name.toLowerCase());
  if (existing.includes(newName.trim().toLowerCase())) { showToast('Profile name already exists', 'error'); return; }
  renameProfile(id, newName);
  showToast('Renamed!', 'success');
  if (id === getActiveProfileId()) updateProfileHeader();
  showManageProfiles();
}

function deleteProfileFlow(id, name) {
  if (!confirm(`Delete "${name}"?\n\nAll its transactions and data will be permanently deleted.`)) return;
  if (!confirm('Are you absolutely sure? This cannot be undone.')) return;
  const wasActive = id === getActiveProfileId();
  const success   = deleteProfile(id);
  if (!success) return;
  showToast(`"${name}" deleted`, 'success');
  if (wasActive) { window.location.reload(); } else { showManageProfiles(); }
}

function updateProfileHeader() {
  const profile = getActiveProfile();
  const el = document.getElementById('active-profile-name');
  if (el && profile) el.textContent = profile.name;
}


// ============================================================
//  CURRENCY SYMBOL MANAGEMENT
// ============================================================
const CURRENCY_SYMBOLS = {
  'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY (¥)': '¥', 'CNY (¥)': '元',
  'AUD': 'A$', 'CAD': 'C$', 'CHF': 'Fr', 'SGD': 'S$', 'HKD': 'HK$', 'MYR': 'RM',
  'THB': '฿', 'IDR': 'Rp', 'PKR': '₨', 'BDT': '৳', 'AED': 'د.إ', 'SAR': '﷼',
  'QAR': 'ر.ق', 'BRL': 'R$', 'MXN': 'Mex$', 'ZAR': 'R', 'NZD': 'NZ$',
  'SEK (kr)': 'SEK', 'NOK (kr)': 'NOK', 'DKK (kr)': 'DKK', 'PLN': 'zł',
  'TRY': '₺', 'RUB': '₽', 'KRW': '₩'
};

function getCurrencySymbol() { return localStorage.getItem(pk('currency')) || '₹'; }
function setCurrencySymbol(symbol) { localStorage.setItem(pk('currency'), symbol); }

// Format number with commas based on currency grouping rules
function formatAmount(amount, decimals) {
  const num = Number(amount);

  // Indian/South Asian: INR(₹), PKR(₨), BDT(৳) — Lakh/Crore system
  const indianSymbols = ['₹', '₨', '৳'];

  // European: comma as decimal separator — EUR(€), CHF(Fr), SEK(kr), NOK(kr), DKK(kr), PLN(zł), TRY(₺), RUB(₽), BRL(R$)
  const europeanSymbols = ['€', 'Fr', 'kr', 'zł', '₺', '₽', 'R$'];

  // Western: standard 3-digit grouping — everything else (USD, GBP, AUD, JPY, etc.)
  // JPY, KRW, IDR have no decimal places typically
  const noDecimalSymbols = ['¥', '₩', 'Rp'];

  const currency = getCurrencySymbol();

  // Determine decimal places if not specified
  if (decimals === undefined) {
    decimals = noDecimalSymbols.includes(currency) ? 0 : 2;
  }

  if (indianSymbols.includes(currency)) {
    // Indian numbering: en-IN locale (1,00,000)
    return num.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  if (europeanSymbols.includes(currency)) {
    // European: period as thousands separator, comma as decimal (1.000,00)
    return num.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  // Western default: comma as thousands separator, period as decimal (1,000.00)
  return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}


// ============================================================
//  DATA MANAGEMENT  — profile-aware via pk()
// ============================================================
function getData()      { return JSON.parse(localStorage.getItem(pk('data')) || '{"income":[],"expenses":[]}'); }
function setData(data)  { localStorage.setItem(pk('data'), JSON.stringify(data)); }

function sortTransactions(transactions) {
  return transactions.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return (b.timestamp || 0) - (a.timestamp || 0);
  });
}


// ============================================================
//  LONG PRESS
// ============================================================
let pressTimer = null, isLongPress = false;

function handleLongPress(dataType, index, element) {
  isLongPress = false;
  pressTimer  = setTimeout(() => {
    isLongPress = true;
    if (window.navigator.vibrate) window.navigator.vibrate(50);
    showEditDeleteMenu(dataType, index, element);
  }, 500);
}
function cancelLongPress() { clearTimeout(pressTimer); }

function showEditDeleteMenu(dataType, index, element) {
  const existingMenu = document.getElementById('context-menu');
  if (existingMenu) existingMenu.remove();
  const menu = document.createElement('div');
  menu.id = 'context-menu'; menu.className = 'context-menu';
  menu.innerHTML = `
    <button class="context-menu-item edit"   onclick="editEntry('${dataType}',${index}); closeContextMenu();"><span style="font-size:18px;">✏️</span> Edit</button>
    <button class="context-menu-item delete" onclick="deleteEntry('${dataType}',${index}); closeContextMenu();"><span style="font-size:18px;">🗑️</span> Delete</button>
    <button class="context-menu-item cancel" onclick="closeContextMenu();">Cancel</button>`;
  document.body.appendChild(menu);
  const backdrop = document.createElement('div');
  backdrop.id = 'context-menu-backdrop'; backdrop.className = 'context-menu-backdrop';
  backdrop.onclick = closeContextMenu;
  document.body.appendChild(backdrop);
  setTimeout(() => { backdrop.classList.add('active'); menu.classList.add('active'); }, 10);
}

function closeContextMenu() {
  const menu     = document.getElementById('context-menu');
  const backdrop = document.getElementById('context-menu-backdrop');
  if (menu)     { menu.classList.remove('active');     setTimeout(() => menu.remove(), 300); }
  if (backdrop) { backdrop.classList.remove('active'); setTimeout(() => backdrop.remove(), 300); }
}


// ============================================================
//  GLOBALS
// ============================================================
let currentTab = 'home', currentAddType = 'expense';


// ============================================================
//  TAB SWITCHING
// ============================================================
function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  if (tab === 'home') loadHome();
  if (tab === 'add')  setTodayDate();
  if (window.navigator.vibrate) window.navigator.vibrate(10);
  history.pushState({ view: tab }, ''); // enable system back to navigate between tabs
}


// ============================================================
//  HOME TAB
// ============================================================
function loadHome() {
  const data = getData(), currency = getCurrencySymbol();
  const totalIncome  = data.income.reduce((s, i) => s + Number(i.amount), 0);
  const totalExpense = data.expenses.reduce((s, e) => s + Number(e.amount), 0);
  const balance      = totalIncome - totalExpense;
  document.getElementById('balance').textContent       = currency + formatAmount(balance);
  document.getElementById('total-income').textContent  = currency + formatAmount(totalIncome);
  document.getElementById('total-expense').textContent = currency + formatAmount(totalExpense);
  document.getElementById('balance-trend').textContent = balance >= 0 ? 'Looking good!' : 'Spending more';
  loadRecentTransactions();
}

function loadRecentTransactions() {
  const data = getData(), currency = getCurrencySymbol();
  let all = [
    ...data.income.map((e, i)   => ({...e, type:'income',  dataType:'income',   index:i})),
    ...data.expenses.map((e, i) => ({...e, type:'expense', dataType:'expenses', index:i}))
  ];
  all = sortTransactions(all).slice(0, 10);
  const list = document.getElementById('recent-list'), empty = document.getElementById('empty-recent');
  if (!all.length) { list.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  list.innerHTML = all.map(item => `
    <div class="transaction-item">
      <div class="transaction-icon ${item.type}">${item.type==='income'?'↗':'↘'}</div>
      <div class="transaction-info">
        <div class="transaction-category">${escapeHtml(item.category)}</div>
        <div class="transaction-date">${formatDate(item.date)}${item.note?' • '+escapeHtml(item.note):''}</div>
      </div>
      <div class="transaction-amount ${item.type}">${item.type==='income'?'+':'-'}${currency}${formatAmount(item.amount)}</div>
    </div>`).join('');
}

function formatDate(d) {
  const [year, month, day] = d.split('-');
  const date = new Date(year, month - 1, day); // parse as local time, not UTC
  const today = new Date(), yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString())     return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month:'short', day:'numeric' });
}


// ============================================================
//  ADD TAB
// ============================================================
function switchAddType(type) {
  currentAddType = type;
  document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-type="${type}"]`).classList.add('active');
  document.getElementById('submit-btn').textContent = type === 'income' ? 'Add Income' : 'Add Expense';
  updateCategoryList();
  if (window.navigator.vibrate) window.navigator.vibrate(10);
}

function openAddModal(type) { switchTab('add'); switchAddType(type); }

function updateCategoryList() {
  const data = getData();
  const cats = currentAddType === 'income'
    ? [...new Set(data.income.map(e => e.category).filter(Boolean))]
    : [...new Set(data.expenses.map(e => e.category).filter(Boolean))];
  document.getElementById('category-list').innerHTML = cats.map(c => `<option value="${escapeHtml(c)}">`).join('');
}

function setTodayDate() {
  const t = new Date();
  const s = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
  const el = document.getElementById('add-date');
  if (el) el.value = s;
}

document.getElementById('add-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const amount   = document.getElementById('add-amount').value;
  const category = document.getElementById('add-category').value.trim();
  const date     = document.getElementById('add-date').value;
  const note     = document.getElementById('add-note').value.trim();
  if (!amount || !category || !date) return;
  const data = getData();
  const entry = { amount, category, date, note, timestamp: Date.now() };
  currentAddType === 'income' ? data.income.push(entry) : data.expenses.push(entry);
  setData(data);
  this.reset(); setTodayDate();
  showToast(`${currentAddType==='income'?'Income':'Expense'} added!`, 'success');
  if (currentTab === 'home') loadHome();
  if (window.navigator.vibrate) window.navigator.vibrate(20);
});


// ============================================================
//  OVERLAY
// ============================================================
function openOverlay(title, content) {
  document.getElementById('overlay-title').textContent = title;
  document.getElementById('overlay-content').innerHTML = content;
  document.getElementById('overlay').classList.add('active');
  history.pushState({ view: 'overlay' }, ''); // enable system back to close overlay
}

function closeOverlay() {
  if (currentOverlayContext && currentOverlayContext.type === 'editEntry') {
    const prev = currentOverlayContext.previousContext;
    if (prev && prev.type === 'allEntries') { showAllEntries(prev.filter); return; }
    if (prev && prev.type === 'category') { showCategoryDetails(prev.category, prev.filter); return; }
    document.getElementById('overlay').classList.remove('active');
    currentOverlayContext = null; return;
  }
  if (currentOverlayContext && currentOverlayContext.type === 'category') {
    showLedger(); if (window.navigator.vibrate) window.navigator.vibrate(10); return;
  }
  document.getElementById('overlay').classList.remove('active');
  currentOverlayContext = null;
  if (window.navigator.vibrate) window.navigator.vibrate(10);
}


// ============================================================
//  EDIT & DELETE
// ============================================================
let currentOverlayContext = null;

function editEntry(dataType, index) {
  const data = getData(), entry = data[dataType][index];
  currentOverlayContext = { type:'editEntry', dataType, index, previousContext: currentOverlayContext };
  openOverlay('Edit Entry', `
    <div class="add-form">
      <div class="form-group"><label>Amount</label><input type="number" id="edit-amount" value="${escapeHtml(String(entry.amount))}" step="0.01" min="0.01" required></div>
      <div class="form-group"><label>Category</label><input type="text" id="edit-category" value="${escapeHtml(entry.category)}" required></div>
      <div class="form-group"><label>Date</label><input type="date" id="edit-date" value="${escapeHtml(entry.date)}" required></div>
      <div class="form-group"><label>Note</label><input type="text" id="edit-note" value="${escapeHtml(entry.note||'')}"></div>
      <button class="submit-btn" onclick="saveEdit('${dataType}',${index})">Save</button>
      <button class="submit-btn" onclick="cancelEdit()" style="background:#E0E0E0;color:#424242;margin-top:8px;">Cancel</button>
    </div>`);
}

function cancelEdit() {
  if (!currentOverlayContext) { closeOverlay(); return; }
  if (currentOverlayContext.type === 'allEntries') showAllEntries(currentOverlayContext.filter);
  else if (currentOverlayContext.type === 'category') showCategoryDetails(currentOverlayContext.category, currentOverlayContext.filter);
  else closeOverlay();
}

function saveEdit(dataType, index) {
  const data = getData();
  const amt  = document.getElementById('edit-amount').value;
  const cat  = document.getElementById('edit-category').value.trim();
  const dt   = document.getElementById('edit-date').value;
  const note = document.getElementById('edit-note').value.trim();
  if (!amt || !cat || !dt) { showToast('Fill all fields', 'error'); return; }
  const oldTs = data[dataType][index].timestamp || Date.now();
  data[dataType][index] = { amount:amt, category:cat, date:dt, note, timestamp:oldTs };
  setData(data);
  showToast('Updated!', 'success');
  if (currentTab === 'home') { loadHome(); closeOverlay(); }
  else if (currentOverlayContext) {
    if (currentOverlayContext.type === 'allEntries') showAllEntries(currentOverlayContext.filter);
    else if (currentOverlayContext.type === 'category') showCategoryDetails(currentOverlayContext.category, currentOverlayContext.filter);
    else closeOverlay();
  } else closeOverlay();
  if (window.navigator.vibrate) window.navigator.vibrate(20);
}

function deleteEntry(dataType, index) {
  if (!confirm('Delete this entry?')) return;
  const data = getData();
  const deletedCategory = currentOverlayContext?.type === 'category' ? currentOverlayContext.category : null;
  data[dataType].splice(index, 1);
  setData(data);
  showToast('Deleted', 'success');
  if (currentTab === 'home') { loadHome(); closeOverlay(); }
  else if (currentOverlayContext) {
    if (currentOverlayContext.type === 'allEntries') showAllEntries(currentOverlayContext.filter);
    else if (currentOverlayContext.type === 'category') {
      const remaining = [...data.income.filter(e => e.category===deletedCategory), ...data.expenses.filter(e => e.category===deletedCategory)];
      if (remaining.length > 0) showCategoryDetails(currentOverlayContext.category, currentOverlayContext.filter);
      else showLedger();
    } else closeOverlay();
  } else closeOverlay();
  if (window.navigator.vibrate) window.navigator.vibrate(50);
}


// ============================================================
//  ALL ENTRIES
// ============================================================
function showAllEntries(filter = 'all') {
  currentOverlayContext = { type:'allEntries', filter };
  const data = getData(), currency = getCurrencySymbol();
  let all = [
    ...data.income.map((e,i)   => ({...e, type:'income',  dataType:'income',   index:i})),
    ...data.expenses.map((e,i) => ({...e, type:'expense', dataType:'expenses', index:i}))
  ];
  const totalIncome  = data.income.reduce((s,i) => s+Number(i.amount), 0);
  const totalExpense = data.expenses.reduce((s,e) => s+Number(e.amount), 0);
  const balance      = totalIncome - totalExpense;
  if (filter==='income')  all = all.filter(e => e.type==='income');
  if (filter==='expense') all = all.filter(e => e.type==='expense');
  all = sortTransactions(all);
  openOverlay('All Entries', `
    <div style="background:#FFF;border-radius:16px;padding:16px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;align-items:center;gap:12px;"><div style="width:44px;height:44px;border-radius:12px;background:#E8F5E9;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">↗</div><div style="flex:1;min-width:0;"><div style="font-size:13px;color:#757575;margin-bottom:2px;">Income</div><div style="font-size:16px;font-weight:700;color:#4CAF50;">${currency}${formatAmount(totalIncome)}</div></div></div>
        <div style="display:flex;align-items:center;gap:12px;"><div style="width:44px;height:44px;border-radius:12px;background:#FFEBEE;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">↘</div><div style="flex:1;min-width:0;"><div style="font-size:13px;color:#757575;margin-bottom:2px;">Expense</div><div style="font-size:16px;font-weight:700;color:#F44336;">${currency}${formatAmount(totalExpense)}</div></div></div>
        <div style="display:flex;align-items:center;gap:12px;"><div style="width:44px;height:44px;border-radius:12px;background:#E3F2FD;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">💰</div><div style="flex:1;min-width:0;"><div style="font-size:13px;color:#757575;margin-bottom:2px;">Balance</div><div style="font-size:16px;font-weight:700;color:#667EEA;">${currency}${formatAmount(balance)}</div></div></div>
      </div>
    </div>
    <div class="form-group" style="margin-bottom:20px;">
      <input type="text" id="entries-search" placeholder="Search by category or note..." style="background:#FFF;border:2px solid #E0E0E0;border-radius:12px;padding:14px 16px;font-size:16px;width:100%;box-sizing:border-box;" oninput="filterAllEntries(this.value)">
    </div>
    <div style="display:flex;background:#F5F5F5;border-radius:12px;padding:4px;margin-bottom:20px;">
      <button onclick="showAllEntries('all')"     style="flex:1;background:${filter==='all'?'#FFF':'transparent'};border:none;padding:10px;border-radius:10px;font-weight:600;color:${filter==='all'?'#1A1A1A':'#757575'};cursor:pointer;">All</button>
      <button onclick="showAllEntries('income')"  style="flex:1;background:${filter==='income'?'#FFF':'transparent'};border:none;padding:10px;border-radius:10px;font-weight:600;color:${filter==='income'?'#1A1A1A':'#757575'};cursor:pointer;">Income</button>
      <button onclick="showAllEntries('expense')" style="flex:1;background:${filter==='expense'?'#FFF':'transparent'};border:none;padding:10px;border-radius:10px;font-weight:600;color:${filter==='expense'?'#1A1A1A':'#757575'};cursor:pointer;">Expense</button>
    </div>
    ${!all.length
      ? '<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-text">No entries</div></div>'
      : `<div id="all-entries-list" class="transaction-list">
          ${all.map(item => `
            <div class="entry-item" data-category="${escapeHtml(item.category.toLowerCase())}" data-note="${escapeHtml((item.note||'').toLowerCase())}"
              style="background:#FFF;border-radius:14px;padding:16px;box-shadow:0 2px 6px rgba(0,0,0,0.05);margin-bottom:10px;cursor:pointer;"
              ontouchstart="handleLongPress('${item.dataType}',${item.index},this)" ontouchend="cancelLongPress()" ontouchmove="cancelLongPress()"
              onmousedown="handleLongPress('${item.dataType}',${item.index},this)"  onmouseup="cancelLongPress()"  onmouseleave="cancelLongPress()">
              <div style="display:flex;align-items:center;gap:14px;">
                <div style="width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;background:${item.type==='income'?'#E8F5E9':'#FFEBEE'};">${item.type==='income'?'↗':'↘'}</div>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:15px;font-weight:600;color:#1A1A1A;margin-bottom:3px;">${escapeHtml(item.category)}</div>
                  <div style="font-size:13px;color:#757575;">${item.date}${item.note?' • '+escapeHtml(item.note):''}</div>
                </div>
                <div style="font-size:18px;font-weight:700;color:${item.type==='income'?'#4CAF50':'#F44336'};white-space:nowrap;">${item.type==='income'?'+':'-'}${currency}${formatAmount(item.amount)}</div>
              </div>
            </div>`).join('')}
        </div>`}`);
}

function filterAllEntries(query) {
  const q = query.toLowerCase();
  document.querySelectorAll('#all-entries-list .entry-item').forEach(entry => {
    const match = entry.getAttribute('data-category').includes(q) || entry.getAttribute('data-note').includes(q);
    entry.style.display = match ? 'block' : 'none';
  });
}


// ============================================================
//  LEDGER
// ============================================================
function showLedger() {
  currentOverlayContext = { type:'ledger' };
  const data = getData(), currency = getCurrencySymbol();
  const cats = Array.from(new Set([...data.income.map(x=>x.category),...data.expenses.map(x=>x.category)])).filter(Boolean);
  if (!cats.length) { openOverlay('Ledger','<div class="empty-state"><div class="empty-icon">📁</div><div class="empty-text">No categories</div></div>'); return; }
  openOverlay('Ledger', `
    <div class="form-group" style="margin-bottom:20px;">
      <input type="text" id="ledger-search" placeholder="Search categories..." style="background:#FFF;border:2px solid #E0E0E0;border-radius:12px;padding:14px 16px;font-size:16px;width:100%;box-sizing:border-box;" oninput="filterLedgerCategories(this.value)">
    </div>
    <div id="ledger-categories" class="insights-menu">
      ${cats.map(cat => {
        const catIncome  = data.income.filter(e=>e.category===cat).reduce((s,e)=>s+Number(e.amount),0);
        const catExpense = data.expenses.filter(e=>e.category===cat).reduce((s,e)=>s+Number(e.amount),0);
        const catCount   = data.income.filter(e=>e.category===cat).length + data.expenses.filter(e=>e.category===cat).length;
        return `<button class="insight-option" data-category="${escapeHtml(cat.toLowerCase())}" onclick="showCategoryDetails('${escapeHtml(cat)}','all')">
          <span class="option-icon">📁</span>
          <div style="flex:1;"><div class="option-text">${escapeHtml(cat)}</div><div style="font-size:13px;color:#757575;margin-top:2px;">Income: ${currency}${formatAmount(catIncome)} | Expense: ${currency}${formatAmount(catExpense)} | ${catCount} entries</div></div>
          <span class="option-arrow">→</span>
        </button>`;
      }).join('')}
    </div>`);
}

function filterLedgerCategories(query) {
  const q = query.toLowerCase();
  document.querySelectorAll('#ledger-categories .insight-option').forEach(btn => {
    btn.style.display = btn.getAttribute('data-category').includes(q) ? 'flex' : 'none';
  });
}

function showCategoryDetails(category, filter = 'all') {
  currentOverlayContext = { type:'category', category, filter };
  const data = getData(), currency = getCurrencySymbol();
  let entries = [
    ...data.income.filter(e=>e.category===category).map(e=>({...e,type:'income', dataType:'income', index:data.income.indexOf(e)})),
    ...data.expenses.filter(e=>e.category===category).map(e=>({...e,type:'expense',dataType:'expenses',index:data.expenses.indexOf(e)}))
  ];
  const catIncome  = entries.filter(e=>e.type==='income').reduce((s,e)=>s+Number(e.amount),0);
  const catExpense = entries.filter(e=>e.type==='expense').reduce((s,e)=>s+Number(e.amount),0);
  const catCount   = entries.length;
  if (filter==='income')  entries = entries.filter(e=>e.type==='income');
  if (filter==='expense') entries = entries.filter(e=>e.type==='expense');
  entries = sortTransactions(entries);
  openOverlay(category, `
    <div style="background:#FFF;border-radius:16px;padding:16px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;align-items:center;gap:12px;"><div style="width:44px;height:44px;border-radius:12px;background:#E8F5E9;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">↗</div><div style="flex:1;min-width:0;"><div style="font-size:13px;color:#757575;margin-bottom:2px;">Income</div><div style="font-size:16px;font-weight:700;color:#4CAF50;">${currency}${formatAmount(catIncome)}</div></div></div>
        <div style="display:flex;align-items:center;gap:12px;"><div style="width:44px;height:44px;border-radius:12px;background:#FFEBEE;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">↘</div><div style="flex:1;min-width:0;"><div style="font-size:13px;color:#757575;margin-bottom:2px;">Expense</div><div style="font-size:16px;font-weight:700;color:#F44336;">${currency}${formatAmount(catExpense)}</div></div></div>
        <div style="display:flex;align-items:center;gap:12px;"><div style="width:44px;height:44px;border-radius:12px;background:#E3F2FD;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">📊</div><div style="flex:1;min-width:0;"><div style="font-size:13px;color:#757575;margin-bottom:2px;">Total Transactions</div><div style="font-size:16px;font-weight:700;color:#667EEA;">${catCount}</div></div></div>
      </div>
    </div>
    <div style="display:flex;background:#F5F5F5;border-radius:12px;padding:4px;margin-bottom:20px;">
      <button onclick="showCategoryDetails('${category}','all')"     style="flex:1;background:${filter==='all'?'#FFF':'transparent'};border:none;padding:10px;border-radius:10px;font-weight:600;color:${filter==='all'?'#1A1A1A':'#757575'};cursor:pointer;">All</button>
      <button onclick="showCategoryDetails('${category}','income')"  style="flex:1;background:${filter==='income'?'#FFF':'transparent'};border:none;padding:10px;border-radius:10px;font-weight:600;color:${filter==='income'?'#1A1A1A':'#757575'};cursor:pointer;">Income</button>
      <button onclick="showCategoryDetails('${category}','expense')" style="flex:1;background:${filter==='expense'?'#FFF':'transparent'};border:none;padding:10px;border-radius:10px;font-weight:600;color:${filter==='expense'?'#1A1A1A':'#757575'};cursor:pointer;">Expense</button>
    </div>
    ${!entries.length
      ? `<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-text">No ${filter==='all'?'':filter+' '}entries</div></div>`
      : `<div class="transaction-list">${entries.map(item=>`
          <div style="background:#FFF;border-radius:14px;padding:16px;box-shadow:0 2px 6px rgba(0,0,0,0.05);margin-bottom:10px;cursor:pointer;"
            ontouchstart="handleLongPress('${item.dataType}',${item.index},this)" ontouchend="cancelLongPress()" ontouchmove="cancelLongPress()"
            onmousedown="handleLongPress('${item.dataType}',${item.index},this)"  onmouseup="cancelLongPress()"  onmouseleave="cancelLongPress()">
            <div style="display:flex;align-items:center;gap:14px;">
              <div style="width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;background:${item.type==='income'?'#E8F5E9':'#FFEBEE'};">${item.type==='income'?'↗':'↘'}</div>
              <div style="flex:1;min-width:0;">
                <div style="font-size:15px;font-weight:600;color:#1A1A1A;margin-bottom:3px;">${escapeHtml(item.category)}</div>
                <div style="font-size:13px;color:#757575;">${item.date}${item.note?' • '+escapeHtml(item.note):''}</div>
              </div>
              <div style="font-size:18px;font-weight:700;color:${item.type==='income'?'#4CAF50':'#F44336'};white-space:nowrap;">${item.type==='income'?'+':'-'}${currency}${formatAmount(item.amount)}</div>
            </div>
          </div>`).join('')}</div>`}`);
}


// ============================================================
//  STATEMENTS
// ============================================================
function showStatements() {
  openOverlay('Custom Statement', `
    <div class="add-form">
      <div class="form-group"><label>Start Date</label><input type="date" id="stmt-start"></div>
      <div class="form-group"><label>End Date</label><input type="date" id="stmt-end"></div>
      <button class="submit-btn" onclick="generateStatement()">Generate</button>
      <button class="submit-btn" onclick="exportStatementPDF()" style="margin-top:8px;">Export PDF</button>
    </div>
    <div id="statement-result" style="margin-top:24px;"></div>`);
}

function generateStatement() {
  const start = document.getElementById('stmt-start').value;
  const end   = document.getElementById('stmt-end').value;
  if (!start || !end) { showToast('Select dates', 'error'); return; }
  const data = getData(), currency = getCurrencySymbol();
  let all = [
    ...data.income.map((e,i)   => ({...e,type:'income', dataType:'income',   index:i})),
    ...data.expenses.map((e,i) => ({...e,type:'expense',dataType:'expenses', index:i}))
  ].filter(i => i.date >= start && i.date <= end);
  all = sortTransactions(all);
  document.getElementById('statement-result').innerHTML = !all.length
    ? '<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-text">No entries for this period</div></div>'
    : `<div class="transaction-list">${all.map(item=>`
        <div style="background:#FFF;border-radius:14px;padding:16px;box-shadow:0 2px 6px rgba(0,0,0,0.05);margin-bottom:10px;">
          <div style="display:flex;align-items:center;gap:14px;">
            <div style="width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;background:${item.type==='income'?'#E8F5E9':'#FFEBEE'};">${item.type==='income'?'↗':'↘'}</div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:15px;font-weight:600;color:#1A1A1A;margin-bottom:3px;">${escapeHtml(item.category)}</div>
              <div style="font-size:13px;color:#757575;">${formatDate(item.date)}${item.note?' • '+escapeHtml(item.note):''}</div>
            </div>
            <div style="font-size:18px;font-weight:700;color:${item.type==='income'?'#4CAF50':'#F44336'};white-space:nowrap;">${item.type==='income'?'+':'-'}${currency}${formatAmount(item.amount)}</div>
          </div>
        </div>`).join('')}</div>`;
}

function exportStatementPDF() {
  const start = document.getElementById('stmt-start').value;
  const end   = document.getElementById('stmt-end').value;
  if (!start || !end) { showToast('Select dates', 'error'); return; }
  const data = getData(), currency = getCurrencySymbol();
  let all = [...data.income.map(e=>({...e,type:'income'})),...data.expenses.map(e=>({...e,type:'expense'}))].filter(i=>i.date>=start&&i.date<=end);
  all = sortTransactions(all);
  if (!all.length) { showToast('No entries in this period', 'error'); return; }
  const periodIncome  = all.filter(e=>e.type==='income').reduce((s,e)=>s+Number(e.amount),0);
  const periodExpense = all.filter(e=>e.type==='expense').reduce((s,e)=>s+Number(e.amount),0);
  const periodBalance = periodIncome - periodExpense;
  const pdfCurrency   = toPdfCurrency(currency);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 20, pageNumber = 1;
  doc.setFillColor(102,126,234); doc.rect(0,0,210,50,'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(28); doc.setFont(undefined,'bold');   doc.text('SpendTrail',105,20,{align:'center'});
  doc.setFontSize(14); doc.setFont(undefined,'normal'); doc.text('Custom Statement',105,30,{align:'center'});
  doc.setFontSize(10);
  doc.text(`Period: ${new Date(start).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})} to ${new Date(end).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}`,105,38,{align:'center'});
  doc.text(`Generated on ${new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}`,105,44,{align:'center'});
  y = 60;
  doc.setFillColor(245,245,245); doc.roundedRect(15,y,180,35,3,3,'F');
  renderSummaryBoxes(doc,y,pdfCurrency,periodIncome,periodExpense,periodBalance);
  y = 105;
  doc.setTextColor(26,26,26); doc.setFontSize(16); doc.setFont(undefined,'bold'); doc.text('Transactions',15,y);
  doc.setTextColor(117,117,117); doc.setFontSize(9); doc.text(`Total: ${all.length} entries`,15,y+6);
  y += 15; y = renderTableHeader(doc,y);
  doc.setFont(undefined,'normal'); doc.setFontSize(9);
  all.forEach((item,index) => {
    if (y > 270) { y = addNewPage(doc,pageNumber); pageNumber++; }
    if (index%2===0) { doc.setFillColor(250,250,250); doc.rect(15,y-4,180,7,'F'); }
    renderTableRow(doc,item,y,pdfCurrency); y += 7;
  });
  doc.setTextColor(150,150,150); doc.setFontSize(8); doc.text(`Page ${pageNumber}`,105,290,{align:'center'});
  doc.save(`SpendTrail-Statement-${start}-to-${end}.pdf`);
  showToast('Exported!', 'success');
}


// ============================================================
//  ANALYTICS
// ============================================================
let currentTimePeriod = 30, currentAnalyticsType = 'expense';
let pieChart = null, trendChart = null;

function showAnalytics(days = 30, type = 'expense') {
  currentTimePeriod = days; currentAnalyticsType = type;
  const data = getData();
  const cutoffDate = new Date(); cutoffDate.setDate(cutoffDate.getDate()-(days-1));
  const cutoffStr  = `${cutoffDate.getFullYear()}-${String(cutoffDate.getMonth()+1).padStart(2,'0')}-${String(cutoffDate.getDate()).padStart(2,'0')}`; // local time, not UTC
  const dataToAnalyze = type==='income' ? data.income.filter(e=>e.date>=cutoffStr) : data.expenses.filter(e=>e.date>=cutoffStr);
  const categoryTotals = {};
  dataToAnalyze.forEach(e => { categoryTotals[e.category] = (categoryTotals[e.category]||0)+Number(e.amount); });
  const sortedCategories = Object.entries(categoryTotals).sort((a,b)=>b[1]-a[1]);
  const totalAmount  = sortedCategories.reduce((sum,[_,amt])=>sum+amt,0);
  const top5         = sortedCategories.slice(0,5);
  const others       = sortedCategories.slice(5);
  const othersTotal  = others.reduce((sum,[_,amt])=>sum+amt,0);
  const pieData      = [...top5]; if (othersTotal>0) pieData.push(['Others',othersTotal]);
  const content = `
    <div class="time-filter" style="margin-bottom:12px;">
      <button class="time-filter-btn ${days===7?'active':''}"  onclick="showAnalytics(7,'${type}')">Week</button>
      <button class="time-filter-btn ${days===30?'active':''}" onclick="showAnalytics(30,'${type}')">Month</button>
      <button class="time-filter-btn ${days===90?'active':''}" onclick="showAnalytics(90,'${type}')">3 Months</button>
    </div>
    <div class="time-filter">
      <button class="time-filter-btn ${type==='expense'?'active':''}" onclick="showAnalytics(${days},'expense')">Expense</button>
      <button class="time-filter-btn ${type==='income'?'active':''}"  onclick="showAnalytics(${days},'income')">Income</button>
    </div>
    ${pieData.length===0
      ? `<div class="empty-state"><div class="empty-icon">📊</div><div class="empty-text">No ${type} data</div><div class="empty-subtext">Add some ${type}s to see analytics</div></div>`
      : `<div class="chart-container"><div class="chart-title">${type==='income'?'Income':'Expense'} Breakdown</div><canvas id="pieChart" class="chart-canvas"></canvas>${othersTotal>0?`<div style="text-align:center;margin-top:12px;"><button onclick="showOthersBreakdown()" style="background:#F5F5F5;border:none;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;color:#667EEA;cursor:pointer;">View "Others" Breakdown</button></div>`:''}</div>
         <div class="chart-container"><div class="chart-title">All Categories</div><div id="category-bars"></div></div>
         <div class="chart-container"><div class="chart-title">${days===7?'7-Day':days===30?'30-Day':'90-Day'} Trend</div><canvas id="trendChart" class="chart-canvas"></canvas></div>`}`;
  openOverlay('Analytics', content);
  if (pieData.length>0) { setTimeout(()=>{ renderPieChart(pieData,totalAmount,type); renderCategoryBars(sortedCategories,totalAmount,type); renderTrendChart(data,days); },100); }
  window.othersData = others; window.currentAnalyticsType = type;
}

function renderPieChart(pieData, total, type='expense') {
  const canvas = document.getElementById('pieChart'); if (!canvas) return;
  const colors = ['#667EEA','#F44336','#4CAF50','#FF9800','#9C27B0','#BDBDBD'];
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(canvas, {
    type:'doughnut',
    data:{ labels:pieData.map(([cat])=>cat), datasets:[{data:pieData.map(([_,amt])=>amt),backgroundColor:colors,borderWidth:0}] },
    options:{ responsive:true, maintainAspectRatio:true,
      plugins:{ legend:{ position:'bottom', labels:{ padding:15, font:{size:13,weight:'600'},
        generateLabels: chart => chart.data.labels.map((label,i)=>({ text:`${label} (${((chart.data.datasets[0].data[i]/total)*100).toFixed(1)}%)`, fillStyle:chart.data.datasets[0].backgroundColor[i], hidden:false, index:i }))
      }},
      tooltip:{ callbacks:{ label: ctx => { const c=getCurrencySymbol(); return `${c}${formatAmount(ctx.parsed)} (${((ctx.parsed/total)*100).toFixed(1)}%)`; } } } }
    }
  });
}

function renderCategoryBars(categories, total, type='expense') {
  const container = document.getElementById('category-bars'); if (!container) return;
  const currency = getCurrencySymbol();
  container.innerHTML = categories.map(([cat,amt]) => {
    const percent = ((amt/total)*100).toFixed(1);
    return `<div class="category-bar">
      <div class="category-bar-label">${escapeHtml(cat)}</div>
      <div class="category-bar-fill"><div class="category-bar-progress" style="width:${percent}%;background:linear-gradient(135deg,#667EEA 0%,#764BA2 100%)"></div></div>
      <div class="category-bar-amount" style="color:#667EEA">${currency}${formatAmount(amt,0)}</div>
    </div>`;
  }).join('');
}

function renderTrendChart(data, days) {
  const canvas = document.getElementById('trendChart'); if (!canvas) return;
  const currency = getCurrencySymbol();
  const dates = [], incomeByDate = {}, expenseByDate = {};
  for (let i=days-1; i>=0; i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    const s = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; // local time, not UTC
    dates.push(s); incomeByDate[s]=0; expenseByDate[s]=0;
  }
  data.income.forEach(e => { if (incomeByDate.hasOwnProperty(e.date)) incomeByDate[e.date]+=Number(e.amount); });
  data.expenses.forEach(e => { if (expenseByDate.hasOwnProperty(e.date)) expenseByDate[e.date]+=Number(e.amount); });
  const labels = dates.map(d => { const [y,m,day] = d.split('-'); return new Date(y, m-1, day).toLocaleDateString('en-US',{month:'short',day:'numeric'}); }); // parse as local time, not UTC
  if (trendChart) trendChart.destroy();
  trendChart = new Chart(canvas, {
    type:'line',
    data:{ labels, datasets:[
      {label:'Income', data:dates.map(d=>incomeByDate[d]),  borderColor:'#4CAF50',backgroundColor:'rgba(76,175,80,0.1)', fill:true,tension:0.4},
      {label:'Expense',data:dates.map(d=>expenseByDate[d]),borderColor:'#F44336',backgroundColor:'rgba(244,67,54,0.1)',fill:true,tension:0.4}
    ]},
    options:{ responsive:true, maintainAspectRatio:true, interaction:{intersect:false,mode:'index'},
      plugins:{ legend:{position:'bottom',labels:{padding:15,font:{size:13,weight:'600'}}}, tooltip:{callbacks:{label:ctx=>`${ctx.dataset.label}: ${currency}${formatAmount(ctx.parsed.y)}`}} },
      scales:{ y:{beginAtZero:true,ticks:{callback:v=>currency+formatAmount(v,0)}}, x:{ticks:{maxRotation:45,minRotation:45}} }
    }
  });
}

function showOthersBreakdown() {
  if (!window.othersData||!window.othersData.length) return;
  const type=window.currentAnalyticsType||'expense', currency=getCurrencySymbol();
  openOverlay('"Others" Categories', `
    <div class="chart-container">
      <div class="chart-title">"Others" Breakdown</div>
      ${window.othersData.map(([cat,amt])=>`
        <div class="category-bar">
          <div class="category-bar-label">${escapeHtml(cat)}</div>
          <div class="category-bar-amount" style="color:#667EEA">${currency}${formatAmount(amt)}</div>
        </div>`).join('')}
    </div>
    <button class="submit-btn" onclick="showAnalytics(${currentTimePeriod},'${type}')" style="margin-top:16px;">Back to Analytics</button>`);
}


// ============================================================
//  BACKUP & RESTORE
// ============================================================
function backupData() {
  const data = getData(), profile = getActiveProfile();
  const backup = { ...data, backupDate: new Date().toISOString(), version:'4.0.7', profileName: profile?.name||'Personal' };
  const blob = new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = `SpendTrail-${profile?.name||'backup'}-${new Date().toISOString().split('T')[0]}.json`;
  link.click(); URL.revokeObjectURL(url);
  showToast('Backup created!', 'success');
}

function encryptedBackup() {
  if (typeof CryptoJS==='undefined') { showToast('Encryption unavailable','error'); return; }
  const password = prompt('Set password (min 8 chars):');
  if (!password) return;
  if (password.length<8) { showToast('Too short','error'); return; }
  const confirm = prompt('Confirm password:');
  if (password!==confirm) { showToast('No match','error'); return; }
  const data = getData(), profile = getActiveProfile();
  const backup = { ...data, backupDate:new Date().toISOString(), version:'4.0.7', encrypted:true, profileName:profile?.name||'Personal' };
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(backup),password).toString();
  const blob = new Blob([encrypted],{type:'text/plain'});
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = `SpendTrail-${profile?.name||'backup'}-${new Date().toISOString().split('T')[0]}.encrypted`;
  link.click(); URL.revokeObjectURL(url);
  showToast('Encrypted backup created!', 'success');
}

function restoreData() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json,.encrypted,.txt';
  input.onchange = function(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        let backup;
        if (file.name.includes('.encrypted')) {
          if (typeof CryptoJS==='undefined') { showToast('Encryption unavailable','error'); return; }
          const password  = prompt('Enter password:'); if (!password) return;
          const decrypted = CryptoJS.AES.decrypt(event.target.result,password).toString(CryptoJS.enc.Utf8);
          if (!decrypted) { showToast('Wrong password','error'); return; }
          backup = JSON.parse(decrypted);
        } else { backup = JSON.parse(event.target.result); }
        if (!backup.income||!backup.expenses) { showToast('Invalid backup','error'); return; }
        if (confirm(`Restore ${backup.income.length} income and ${backup.expenses.length} expense entries?`)) {
          setData({ income:backup.income, expenses:backup.expenses });
          loadHome(); showToast('Restored!','success');
        }
      } catch(error) { showToast('Error reading backup','error'); }
    };
    reader.readAsText(file);
  };
  input.click();
}


// ============================================================
//  PDF EXPORT
// ============================================================
function exportPDF() {
  const data = getData(), currency = getCurrencySymbol(), profile = getActiveProfile();
  const pdfCurrency = toPdfCurrency(currency);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const totalIncome  = data.income.reduce((s,i)=>s+Number(i.amount),0);
  const totalExpense = data.expenses.reduce((s,e)=>s+Number(e.amount),0);
  const balance      = totalIncome-totalExpense;
  let all = [...data.income.map(e=>({...e,type:'Income'})),...data.expenses.map(e=>({...e,type:'Expense'}))];
  all = sortTransactions(all);
  let y = 20, pageNumber = 1;
  doc.setFillColor(102,126,234); doc.rect(0,0,210,45,'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(28); doc.setFont(undefined,'bold'); doc.text('SpendTrail',105,20,{align:'center'});
  doc.setFontSize(12); doc.setFont(undefined,'normal'); doc.text(`Financial Report — ${profile?.name||''}`,105,28,{align:'center'});
  doc.setFontSize(10); doc.text(`Generated on ${new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}`,105,35,{align:'center'});
  y=55; doc.setFillColor(245,245,245); doc.roundedRect(15,y,180,35,3,3,'F');
  renderSummaryBoxes(doc,y,pdfCurrency,totalIncome,totalExpense,balance);
  y=100; doc.setTextColor(26,26,26); doc.setFontSize(16); doc.setFont(undefined,'bold'); doc.text('All Transactions',15,y);
  doc.setTextColor(117,117,117); doc.setFontSize(9); doc.text(`Total: ${all.length} entries`,15,y+6);
  y+=15; y=renderTableHeader(doc,y);
  doc.setFont(undefined,'normal'); doc.setFontSize(9);
  all.forEach((item,index) => {
    if (y>270) { y=addNewPage(doc,pageNumber); pageNumber++; }
    if (index%2===0) { doc.setFillColor(250,250,250); doc.rect(15,y-4,180,7,'F'); }
    renderTableRow(doc,item,y,pdfCurrency); y+=7;
  });
  doc.setTextColor(150,150,150); doc.setFontSize(8); doc.text(`Page ${pageNumber}`,105,290,{align:'center'});
  doc.save(`SpendTrail-${profile?.name||'Report'}.pdf`);
  showToast('PDF exported!','success');
}

// PDF helpers shared between exportPDF and exportStatementPDF
function toPdfCurrency(currency) {
  const map = {'₹':'Rs.','¥':'Y','元':'Y','£':'GBP','€':'EUR','฿':'THB','₨':'PKR','৳':'BDT','د.إ':'AED','﷼':'SAR','ر.ق':'QAR','zł':'PLN','₺':'TRY','₽':'RUB','₩':'KRW'};
  return map[currency] || currency;
}
function renderSummaryBoxes(doc,y,pdfCurrency,inc,exp,bal) {
  doc.setFillColor(232,245,233); doc.roundedRect(20,y+5,55,25,2,2,'F');
  doc.setTextColor(76,175,80); doc.setFontSize(10); doc.setFont(undefined,'bold');
  doc.text('Income',47.5,y+12,{align:'center'}); doc.setFontSize(12); doc.text(`${pdfCurrency} ${formatAmount(inc)}`,47.5,y+22,{align:'center'});
  doc.setFillColor(255,235,238); doc.roundedRect(80,y+5,55,25,2,2,'F');
  doc.setTextColor(244,67,54); doc.setFontSize(10); doc.setFont(undefined,'bold');
  doc.text('Expense',107.5,y+12,{align:'center'}); doc.setFontSize(12); doc.text(`${pdfCurrency} ${formatAmount(exp)}`,107.5,y+22,{align:'center'});
  doc.setFillColor(227,242,253); doc.roundedRect(140,y+5,50,25,2,2,'F');
  doc.setTextColor(102,126,234); doc.setFontSize(10); doc.setFont(undefined,'bold');
  doc.text('Balance',165,y+12,{align:'center'}); doc.setFontSize(12);
  const balText = bal>=0 ? `${pdfCurrency} ${formatAmount(bal)}` : `-${pdfCurrency} ${formatAmount(Math.abs(bal))}`;
  doc.text(balText,165,y+22,{align:'center'});
}
function renderTableHeader(doc,y) {
  doc.setFillColor(102,126,234); doc.rect(15,y,180,8,'F');
  doc.setTextColor(255,255,255); doc.setFontSize(9); doc.setFont(undefined,'bold');
  doc.text('Date',18,y+5); doc.text('Category',45,y+5); doc.text('Note',95,y+5); doc.text('Amount',175,y+5,{align:'right'});
  return y+10;
}
function addNewPage(doc,pageNumber) {
  doc.setTextColor(150,150,150); doc.setFontSize(8); doc.text(`Page ${pageNumber}`,105,290,{align:'center'});
  doc.addPage(); let y=20;
  doc.setFillColor(102,126,234); doc.rect(15,y,180,8,'F');
  doc.setTextColor(255,255,255); doc.setFontSize(9); doc.setFont(undefined,'bold');
  doc.text('Date',18,y+5); doc.text('Category',45,y+5); doc.text('Note',95,y+5); doc.text('Amount',175,y+5,{align:'right'});
  return y+10;
}
function renderTableRow(doc,item,y,pdfCurrency) {
  const date     = new Date(item.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'});
  const category = item.category.length>15 ? item.category.substring(0,13)+'..' : item.category;
  const note     = item.note ? (item.note.length>20 ? item.note.substring(0,18)+'..' : item.note) : '-';
  const type     = (item.type==='Income'||item.type==='income') ? 'Income' : 'Expense';
  const amount   = `${type==='Income'?'+':'-'}${pdfCurrency} ${formatAmount(Number(item.amount))}`;
  doc.setTextColor(50,50,50); doc.setFont(undefined,'normal');
  doc.text(date,18,y); doc.text(category,45,y); doc.text(note,95,y);
  doc.setTextColor(type==='Income'?76:244, type==='Income'?175:67, type==='Income'?80:54);
  doc.setFont(undefined,'bold'); doc.text(amount,190,y,{align:'right'});
}


// ============================================================
//  DELETE ALL DATA  (profile-scoped)
// ============================================================
function deleteAllData() {
  if (confirm('Delete ALL data in this profile? Cannot be undone!')) {
    if (confirm('Absolutely sure?')) {
      localStorage.removeItem(pk('data'));
      loadHome();
      showToast('All deleted','success');
    }
  }
}


// ============================================================
//  CURRENCY SETTINGS
// ============================================================
function showCurrencySettings() {
  const current = getCurrencySymbol();
  openOverlay('Currency Symbol', `
    <div class="add-form">
      <div class="form-group">
        <label>Select Currency Symbol</label>
        <select id="currency-select" style="background:#FFF;border:2px solid #E0E0E0;border-radius:12px;padding:14px 16px;font-size:16px;width:100%;">
          ${Object.entries(CURRENCY_SYMBOLS).map(([code,symbol])=>`<option value="${symbol}" ${symbol===current?'selected':''}>${code} - ${symbol}</option>`).join('')}
        </select>
      </div>
      <button class="submit-btn" onclick="saveCurrencySymbol()">Save Currency</button>
    </div>`);
}

function saveCurrencySymbol() {
  const selected = document.getElementById('currency-select').value;
  setCurrencySymbol(selected);
  showToast('Currency updated!','success');
  loadHome(); closeOverlay();
}
// ============================================================
//  PRIVACY POLICY
// ============================================================
function showPrivacy() {
  const content = `
    <div style="line-height:1.7;color:#424242;">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#667EEA 0%,#764BA2 100%);border-radius:16px;padding:20px;margin-bottom:28px;text-align:center;">
        <div style="font-size:36px;margin-bottom:8px;">🔐</div>
        <h2 style="color:#FFF;font-size:22px;font-weight:700;margin:0 0 6px;">Privacy Policy</h2>
        <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:0;">SpendTrail is built on one principle:<br>your data stays on your device, always.</p>
      </div>

      <!-- 1 -->
      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">📱 Data Storage & Privacy</h3>
        <p style="margin-bottom:12px;">SpendTrail is designed with your privacy as the absolute top priority. All your financial data — including income entries, expense records, categories, notes, dates, and your entire transaction history — is stored exclusively on your device using your browser's local storage mechanism. At no point is any of this data transmitted to, processed by, or stored on any external server, cloud service, or third-party system.</p>
        <p style="margin-bottom:12px;"><strong>We do not:</strong></p>
        <ul style="margin-left:20px;margin-bottom:12px;">
          <li style="margin-bottom:8px;">Collect any personal or financial information</li>
          <li style="margin-bottom:8px;">Send your data to external servers or cloud storage</li>
          <li style="margin-bottom:8px;">Track your usage patterns or in-app behaviour</li>
          <li style="margin-bottom:8px;">Share your information with third parties under any circumstances</li>
          <li style="margin-bottom:8px;">Store cookies for tracking or identification purposes</li>
          <li style="margin-bottom:8px;">Require account registration, email, or any form of login</li>
          <li style="margin-bottom:8px;">Display advertisements or share data with advertisers</li>
        </ul>
        <p>Your financial data never leaves your device unless you explicitly choose to export or back it up yourself. Even then, the export is performed entirely on your device and saved directly to your local storage — nothing passes through our systems.</p>
      </div>

      <!-- 2 -->
      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">📶 Offline Functionality & Service Worker</h3>
        <p style="margin-bottom:12px;">SpendTrail is a Progressive Web App (PWA) designed to work fully offline after your very first visit. During your first load, a service worker automatically caches all essential app files directly onto your device — including the HTML, CSS, JavaScript, and all third-party libraries needed to run the app.</p>
        <p style="margin-bottom:12px;">After this one-time setup:</p>
        <ul style="margin-left:20px;margin-bottom:12px;">
          <li style="margin-bottom:8px;">The entire app loads from your device's local cache</li>
          <li style="margin-bottom:8px;">No internet connection is required for any core functionality</li>
          <li style="margin-bottom:8px;">Adding transactions, viewing analytics, generating PDFs — all work offline</li>
          <li style="margin-bottom:8px;">No network requests are made to any server during offline use</li>
        </ul>
        <p>The service worker operates silently in the background and does not collect, log, monitor, or transmit any personal data, usage data, or financial information whatsoever.</p>
      </div>

      <!-- 3 -->
      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">👤 Multiple Profiles</h3>
        <p style="margin-bottom:12px;">SpendTrail allows you to create and manage up to 5 completely separate profiles to organise your finances across different areas of your life — such as personal, business, travel, or family. Each profile is a fully independent, isolated environment:</p>
        <ul style="margin-left:20px;margin-bottom:12px;">
          <li style="margin-bottom:8px;">No transaction data, categories, notes, or settings are ever shared between profiles</li>
          <li style="margin-bottom:8px;">Each profile is identified by a unique locally-generated ID — no account, email, or login is required</li>
          <li style="margin-bottom:8px;">Each profile maintains its own separate currency setting and transaction history</li>
          <li style="margin-bottom:8px;">Switching between profiles involves zero network requests — it is purely a local operation</li>
          <li style="margin-bottom:8px;">Deleting a profile permanently and irreversibly removes every piece of data associated with it from your device</li>
          <li style="margin-bottom:8px;">Up to 5 profiles can coexist simultaneously, all stored locally and independently</li>
        </ul>
        <p>Profile data is namespaced under a unique key in local storage, ensuring complete separation at the storage level itself.</p>
      </div>

      <!-- 4 -->
      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">🔒 Security Measures</h3>
        <p style="margin-bottom:12px;">The security of your financial data is paramount. SpendTrail employs multiple layers of protection:</p>
        <ul style="margin-left:20px;margin-bottom:12px;">
          <li style="margin-bottom:8px;"><strong>Local Storage Isolation:</strong> Browser local storage is sandboxed by the browser itself. No other website, app, or browser tab can access your SpendTrail data.</li>
          <li style="margin-bottom:8px;"><strong>No Server Transmission:</strong> Since your data is never sent over a network, it is completely immune to server-side breaches, man-in-the-middle attacks, or data interception.</li>
          <li style="margin-bottom:8px;"><strong>AES-256 Encryption:</strong> When you create an encrypted backup, your data is protected using industry-standard AES-256 encryption with a password only you know.</li>
          <li style="margin-bottom:8px;"><strong>Zero Knowledge:</strong> We have absolutely no knowledge of your financial data — no amounts, no categories, no transaction history. This is by design.</li>
          <li style="margin-bottom:8px;"><strong>Device-Level Protection:</strong> Your data inherits the full security of your device — screen lock, PIN, password, fingerprint, or Face ID.</li>
          <li style="margin-bottom:8px;"><strong>Open Source Code:</strong> The entire app codebase is publicly available on GitHub for independent security review by anyone.</li>
        </ul>
      </div>

      <!-- 5 -->
      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">💾 Backup & Export</h3>
        <p style="margin-bottom:12px;">SpendTrail provides three methods to export and preserve your data, all of which operate entirely on your device with no server involvement:</p>
        <ul style="margin-left:20px;margin-bottom:12px;">
          <li style="margin-bottom:8px;"><strong>Simple Backup (JSON):</strong> Creates a human-readable JSON file of your active profile's data, saved directly to your device. This file is not encrypted. Keep it in a secure location as anyone with access to the file can read your data.</li>
          <li style="margin-bottom:8px;"><strong>Encrypted Backup:</strong> Creates a password-protected file encrypted using AES-256. Only you know the password. If your password is ever lost or forgotten, the backup cannot be decrypted or recovered under any circumstances — there is no recovery mechanism.</li>
          <li style="margin-bottom:8px;"><strong>PDF Export & Custom Statements:</strong> Generates a professionally formatted financial report or custom date-range statement as a PDF file. The entire PDF is generated on your device using jsPDF. No data is uploaded or transmitted during this process.</li>
        </ul>
        <p>You are solely and entirely responsible for the security of any backup files you create and store outside the app.</p>
      </div>

      <!-- 6 -->
      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">📊 Analytics & Charts</h3>
        <p style="margin-bottom:12px;">All analytics, charts, pie graphs, trend lines, and category breakdowns displayed in SpendTrail are generated entirely on your device using only your locally stored data. This includes:</p>
        <ul style="margin-left:20px;margin-bottom:12px;">
          <li style="margin-bottom:8px;">Expense and income breakdowns by category</li>
          <li style="margin-bottom:8px;">Daily, weekly, monthly, and 3-month trend charts</li>
          <li style="margin-bottom:8px;">Balance summaries and financial overviews</li>
          <li style="margin-bottom:8px;">Category-level ledger views and transaction counts</li>
        </ul>
        <p>No analytics data, usage patterns, or spending behaviour is collected, measured, or reported to us or any third party. Every insight you see is generated for your eyes only, purely on your device.</p>
      </div>

      <!-- 7 -->
      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">🌐 Third-Party Libraries</h3>
        <p style="margin-bottom:12px;">SpendTrail uses three open-source libraries to power specific features. These are loaded from public CDNs on your very first visit and then cached locally by the service worker, so all subsequent use is offline:</p>
        <ul style="margin-left:20px;margin-bottom:12px;">
          <li style="margin-bottom:8px;"><strong>jsPDF</strong> (cdnjs.cloudflare.com) — used solely to generate PDF reports and statements on your device</li>
          <li style="margin-bottom:8px;"><strong>CryptoJS</strong> (cdnjs.cloudflare.com) — used solely to perform AES-256 encryption and decryption of backup files on your device</li>
          <li style="margin-bottom:8px;"><strong>Chart.js</strong> (cdn.jsdelivr.net) — used solely to render analytics charts and graphs on your device</li>
        </ul>
        <p style="margin-bottom:12px;">These libraries are integrated exclusively to deliver app functionality. They do not have access to your financial data, do not track your usage, and do not communicate with external servers during normal app operation.</p>
        <p>On your first visit only, your browser makes standard HTTPS requests to these CDN domains to download the library files. After caching, no further requests to these domains are made.</p>
      </div>

      <!-- 8 -->
      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">🍪 Cookies & Tracking</h3>
        <p style="margin-bottom:12px;">SpendTrail does not use any form of tracking technology. Specifically, we do not use:</p>
        <ul style="margin-left:20px;">
          <li style="margin-bottom:8px;">Session cookies or persistent cookies of any kind</li>
          <li style="margin-bottom:8px;">Analytics platforms (e.g. Google Analytics, Mixpanel, Amplitude)</li>
          <li style="margin-bottom:8px;">Advertising or retargeting trackers</li>
          <li style="margin-bottom:8px;">Browser fingerprinting or device identification techniques</li>
          <li style="margin-bottom:8px;">Heatmaps, session recordings, or screen tracking tools</li>
          <li style="margin-bottom:8px;">Crash reporting or error monitoring services that transmit data externally</li>
        </ul>
      </div>

      <!-- 9 -->
      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">📵 Device Permissions</h3>
        <p style="margin-bottom:12px;">SpendTrail does not request, require, or access any sensitive device capabilities. The app has no access to:</p>
        <ul style="margin-left:20px;margin-bottom:12px;">
          <li style="margin-bottom:8px;">Camera or photo library</li>
          <li style="margin-bottom:8px;">Microphone or audio recording</li>
          <li style="margin-bottom:8px;">Location services or GPS</li>
          <li style="margin-bottom:8px;">Contacts, address book, or calendar</li>
          <li style="margin-bottom:8px;">Phone calls, SMS, or messaging</li>
          <li style="margin-bottom:8px;">Background app refresh or push notifications</li>
          <li style="margin-bottom:8px;">Biometric data or device sensors</li>
        </ul>
        <p>The only browser API SpendTrail uses is <strong>localStorage</strong> to save and retrieve your data on-device, and the <strong>Service Worker API</strong> to enable offline functionality.</p>
      </div>

      <!-- 10 -->
      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">🤝 Data Sharing & Disclosure</h3>
        <p style="margin-bottom:12px;">We do not sell, rent, license, trade, or share your data with any third party — because we have never had access to it in the first place. Your data exists only on your device.</p>
        <p style="margin-bottom:12px;">There are no circumstances — including legal requests, government orders, business transactions, or partnerships — under which SpendTrail could disclose your financial data to any external party, because no such data is ever in our possession.</p>
        <p>If SpendTrail were ever acquired, merged, or shut down, your data would remain entirely unaffected as it exists solely on your own device.</p>
      </div>

      <!-- 11 -->
      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">👶 Children's Privacy</h3>
        <p>SpendTrail does not knowingly collect any personal information from anyone, including children under the age of 13. Because all data is stored locally on the user's device and nothing is ever transmitted to us, the app presents no special data privacy risk to minors. However, parental or guardian supervision is recommended for younger users to ensure appropriate use of financial tracking features.</p>
      </div>

      <!-- 12 -->
      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">✅ Your Rights</h3>
        <p style="margin-bottom:12px;">Because all data is stored locally on your own device, you hold complete, immediate, and unconditional control over your information at all times. Your rights include:</p>
        <ul style="margin-left:20px;margin-bottom:12px;">
          <li style="margin-bottom:8px;"><strong>Right to Access:</strong> View every piece of your data at any time — transaction history, category breakdowns, analytics, and full exports — all within the app.</li>
          <li style="margin-bottom:8px;"><strong>Right to Rectification:</strong> Correct or update any entry at any time using the long-press Edit function on any transaction.</li>
          <li style="margin-bottom:8px;"><strong>Right to Erasure:</strong> Delete individual transactions, entire categories, whole profiles, or all data at once — immediately and permanently.</li>
          <li style="margin-bottom:8px;"><strong>Right to Data Portability:</strong> Export your complete dataset as JSON or generate a PDF report at any time, in a standard format you can use elsewhere.</li>
          <li style="margin-bottom:8px;"><strong>Right to Restriction:</strong> Stop using the app at any time. Your data remains safely on your device until you choose to remove it.</li>
          <li style="margin-bottom:8px;"><strong>Right to Object:</strong> Since no profiling or automated processing of your data occurs, there is nothing to object to — but you retain full freedom to use or not use any feature of the app.</li>
        </ul>
        <p>Because we hold no data about you on any server or system, all of these rights are exercised directly within the app itself without needing to contact us.</p>
      </div>

      <!-- 13 -->
      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">🗂️ Data Retention</h3>
        <p style="margin-bottom:12px;">SpendTrail retains your data on your device for as long as you use the app and choose to keep it. There is no automatic expiry, time limit, or scheduled deletion of your data.</p>
        <p style="margin-bottom:12px;">Data is permanently removed from your device when you:</p>
        <ul style="margin-left:20px;margin-bottom:12px;">
          <li style="margin-bottom:8px;">Manually delete individual entries or categories within the app</li>
          <li style="margin-bottom:8px;">Delete an entire profile and all its associated data</li>
          <li style="margin-bottom:8px;">Use the "Delete All Data" option in the More tab</li>
          <li style="margin-bottom:8px;">Clear your browser's local storage or site data through browser settings</li>
          <li style="margin-bottom:8px;">Uninstall the PWA from your device</li>
        </ul>
        <p>We do not hold any copies of your data anywhere. Once deleted from your device, your data is gone permanently and cannot be recovered unless you have previously created and saved a backup file.</p>
      </div>

      <!-- 14 -->
      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">🔄 Changes to This Policy</h3>
        <p style="margin-bottom:12px;">We may update this Privacy Policy from time to time to reflect changes in the app's features, functionality, legal requirements, or industry best practices. When changes are made:</p>
        <ul style="margin-left:20px;margin-bottom:12px;">
          <li style="margin-bottom:8px;">The "Last Updated" date shown at the bottom of this policy will be revised</li>
          <li style="margin-bottom:8px;">The latest version of this policy is always accessible within the app under More → Privacy Policy</li>
          <li style="margin-bottom:8px;">Significant changes to data handling practices will be reflected in the app version number</li>
          <li style="margin-bottom:8px;">We will never introduce data collection, tracking, or server-side storage without clear, prominent notice</li>
        </ul>
        <p>We encourage you to review this policy periodically. Continued use of SpendTrail after any updates constitutes your acceptance of the revised policy.</p>
      </div>

      <!-- 15 -->
      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">⚠️ Important Disclaimers</h3>
        <ul style="margin-left:20px;">
          <li style="margin-bottom:8px;">SpendTrail is provided "as is" without warranties of any kind, express or implied</li>
          <li style="margin-bottom:8px;">We are not liable for any data loss resulting from device failure, browser updates, storage limits, accidental deletion, or user error</li>
          <li style="margin-bottom:8px;">Regular backups are strongly recommended as your sole protection against accidental data loss</li>
          <li style="margin-bottom:8px;">SpendTrail is a personal record-keeping tool — it is not a financial advisory, accounting, or tax service</li>
          <li style="margin-bottom:8px;">If you lose your encrypted backup password, your data is unrecoverable — there is no password reset or recovery option</li>
          <li style="margin-bottom:8px;">You are fully responsible for the security and safekeeping of any backup files stored outside the app</li>
          <li style="margin-bottom:8px;">Clearing browser data or uninstalling the app will permanently erase all SpendTrail data with no possibility of recovery without a prior backup</li>
        </ul>
      </div>

      <!-- 16 -->
      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">📧 Contact & Support</h3>
        <p style="margin-bottom:12px;">SpendTrail is an open-source project developed and maintained by Manan Madani. If you have any questions about this Privacy Policy, concerns about how the app handles your data, or would like to report a bug or suggest a feature, please reach out through GitHub:</p>
        <div style="background:#F5F5F5;padding:12px;border-radius:8px;margin-bottom:12px;">
          <a href="https://github.com/mananmadani/SpendTrail" target="_blank" style="color:#667EEA;font-weight:600;text-decoration:none;">🔗 github.com/mananmadani/SpendTrail</a>
        </div>
        <p style="margin-top:12px;">Since SpendTrail operates entirely without any backend infrastructure, servers, or databases, we are unable to access, view, modify, or recover your data remotely under any circumstances. Any support for data-related issues must be resolved on your own device, ideally using a backup file you have previously created.</p>
      </div>

      <!-- Privacy Guarantee -->
      <div style="background:#E8F5E9;padding:16px;border-radius:12px;border-left:4px solid #4CAF50;margin-bottom:24px;">
        <p style="margin:0;font-weight:600;color:#2E7D32;">✓ Privacy Guarantee</p>
        <p style="margin:8px 0 0;color:#424242;">Your financial data is yours and yours alone. SpendTrail will never collect, transmit, sell, or share your personal information with anyone, ever. This is not just a policy — it is the fundamental architecture of how the app is built.</p>
      </div>

      <!-- Footer -->
      <div style="text-align:center;padding-top:8px;padding-bottom:4px;">
        <p style="font-size:12px;color:#BDBDBD;margin:0;">Last Updated: March 2026 &nbsp;|&nbsp; Version 4.0.7</p>
      </div>

    </div>`;
  openOverlay('Privacy Policy', content);
}
    
// ============================================================
//  TOAST
// ============================================================
function showToast(message, type='success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className   = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}


// ============================================================
//  SYSTEM NAVIGATION — back button / swipe gesture (Android, iOS, Desktop)
// ============================================================
window.addEventListener('popstate', function(event) {
  const overlay = document.getElementById('overlay');
  if (overlay.classList.contains('active')) {
    // Overlay is open — close it (handles category → ledger transition too)
    closeOverlay();
  } else {
    // Navigate to the tab that matches the history state we popped to,
    // so each step (Insights → Home → Exit) requires its own back press
    const state = event.state;
    const targetTab = (state && state.view && state.view !== 'overlay') ? state.view : 'home';
    if (targetTab !== currentTab) {
      currentTab = targetTab;
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      document.getElementById(`tab-${currentTab}`).classList.add('active');
      document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelector(`[data-tab="${currentTab}"]`).classList.add('active');
      if (currentTab === 'home') loadHome();
      if (window.navigator.vibrate) window.navigator.vibrate(10);
    }
    // else: already on the correct tab — browser handles exit naturally at base state
  }
});


// ============================================================
//  INITIALISE
// ============================================================
history.replaceState({ view: 'home' }, ''); // set base history state on app load
initProfiles();
updateProfileHeader();
loadHome();
setTodayDate();
updateCategoryList();

window.addEventListener('focus', setTodayDate);
document.addEventListener('visibilitychange', function() { if (!document.hidden) setTodayDate(); });
