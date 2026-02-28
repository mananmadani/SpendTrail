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
}


// ============================================================
//  HOME TAB
// ============================================================
function loadHome() {
  const data = getData(), currency = getCurrencySymbol();
  const totalIncome  = data.income.reduce((s, i) => s + Number(i.amount), 0);
  const totalExpense = data.expenses.reduce((s, e) => s + Number(e.amount), 0);
  const balance      = totalIncome - totalExpense;
  document.getElementById('balance').textContent       = currency + balance.toFixed(2);
  document.getElementById('total-income').textContent  = currency + totalIncome.toFixed(2);
  document.getElementById('total-expense').textContent = currency + totalExpense.toFixed(2);
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
        <div class="transaction-category">${item.category}</div>
        <div class="transaction-date">${formatDate(item.date)}${item.note?' • '+item.note:''}</div>
      </div>
      <div class="transaction-amount ${item.type}">${item.type==='income'?'+':'-'}${currency}${item.amount}</div>
    </div>`).join('');
}

function formatDate(d) {
  const date = new Date(d), today = new Date(), yesterday = new Date(today);
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
  document.getElementById('category-list').innerHTML = cats.map(c => `<option value="${c}">`).join('');
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
}

function closeOverlay() {
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
  openOverlay('Edit Entry', `
    <div class="add-form">
      <div class="form-group"><label>Amount</label><input type="number" id="edit-amount" value="${entry.amount}" step="0.01" min="0.01" required></div>
      <div class="form-group"><label>Category</label><input type="text" id="edit-category" value="${entry.category}" required></div>
      <div class="form-group"><label>Date</label><input type="date" id="edit-date" value="${entry.date}" required></div>
      <div class="form-group"><label>Note</label><input type="text" id="edit-note" value="${entry.note||''}"></div>
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
        <div style="display:flex;align-items:center;gap:12px;"><div style="width:44px;height:44px;border-radius:12px;background:#E8F5E9;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">↗</div><div style="flex:1;min-width:0;"><div style="font-size:13px;color:#757575;margin-bottom:2px;">Income</div><div style="font-size:16px;font-weight:700;color:#4CAF50;">${currency}${totalIncome.toFixed(2)}</div></div></div>
        <div style="display:flex;align-items:center;gap:12px;"><div style="width:44px;height:44px;border-radius:12px;background:#FFEBEE;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">↘</div><div style="flex:1;min-width:0;"><div style="font-size:13px;color:#757575;margin-bottom:2px;">Expense</div><div style="font-size:16px;font-weight:700;color:#F44336;">${currency}${totalExpense.toFixed(2)}</div></div></div>
        <div style="display:flex;align-items:center;gap:12px;"><div style="width:44px;height:44px;border-radius:12px;background:#E3F2FD;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">💰</div><div style="flex:1;min-width:0;"><div style="font-size:13px;color:#757575;margin-bottom:2px;">Balance</div><div style="font-size:16px;font-weight:700;color:#667EEA;">${currency}${balance.toFixed(2)}</div></div></div>
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
            <div class="entry-item" data-category="${item.category.toLowerCase()}" data-note="${(item.note||'').toLowerCase()}"
              style="background:#FFF;border-radius:14px;padding:16px;box-shadow:0 2px 6px rgba(0,0,0,0.05);margin-bottom:10px;cursor:pointer;"
              ontouchstart="handleLongPress('${item.dataType}',${item.index},this)" ontouchend="cancelLongPress()" ontouchmove="cancelLongPress()"
              onmousedown="handleLongPress('${item.dataType}',${item.index},this)"  onmouseup="cancelLongPress()"  onmouseleave="cancelLongPress()">
              <div style="display:flex;align-items:center;gap:14px;">
                <div style="width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;background:${item.type==='income'?'#E8F5E9':'#FFEBEE'};">${item.type==='income'?'↗':'↘'}</div>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:15px;font-weight:600;color:#1A1A1A;margin-bottom:3px;">${item.category}</div>
                  <div style="font-size:13px;color:#757575;">${item.date}${item.note?' • '+item.note:''}</div>
                </div>
                <div style="font-size:18px;font-weight:700;color:${item.type==='income'?'#4CAF50':'#F44336'};white-space:nowrap;">${item.type==='income'?'+':'-'}${currency}${item.amount}</div>
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
        return `<button class="insight-option" data-category="${cat.toLowerCase()}" onclick="showCategoryDetails('${cat}','all')">
          <span class="option-icon">📁</span>
          <div style="flex:1;"><div class="option-text">${cat}</div><div style="font-size:13px;color:#757575;margin-top:2px;">Income: ${currency}${catIncome.toFixed(2)} | Expense: ${currency}${catExpense.toFixed(2)} | ${catCount} entries</div></div>
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
        <div style="display:flex;align-items:center;gap:12px;"><div style="width:44px;height:44px;border-radius:12px;background:#E8F5E9;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">↗</div><div style="flex:1;min-width:0;"><div style="font-size:13px;color:#757575;margin-bottom:2px;">Income</div><div style="font-size:16px;font-weight:700;color:#4CAF50;">${currency}${catIncome.toFixed(2)}</div></div></div>
        <div style="display:flex;align-items:center;gap:12px;"><div style="width:44px;height:44px;border-radius:12px;background:#FFEBEE;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">↘</div><div style="flex:1;min-width:0;"><div style="font-size:13px;color:#757575;margin-bottom:2px;">Expense</div><div style="font-size:16px;font-weight:700;color:#F44336;">${currency}${catExpense.toFixed(2)}</div></div></div>
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
                <div style="font-size:15px;font-weight:600;color:#1A1A1A;margin-bottom:3px;">${item.category}</div>
                <div style="font-size:13px;color:#757575;">${item.date}${item.note?' • '+item.note:''}</div>
              </div>
              <div style="font-size:18px;font-weight:700;color:${item.type==='income'?'#4CAF50':'#F44336'};white-space:nowrap;">${item.type==='income'?'+':'-'}${currency}${item.amount}</div>
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
              <div style="font-size:15px;font-weight:600;color:#1A1A1A;margin-bottom:3px;">${item.category}</div>
              <div style="font-size:13px;color:#757575;">${formatDate(item.date)}${item.note?' • '+item.note:''}</div>
            </div>
            <div style="font-size:18px;font-weight:700;color:${item.type==='income'?'#4CAF50':'#F44336'};white-space:nowrap;">${item.type==='income'?'+':'-'}${currency}${item.amount}</div>
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
  const cutoffStr  = cutoffDate.toISOString().split('T')[0];
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
      tooltip:{ callbacks:{ label: ctx => { const c=getCurrencySymbol(); return `${c}${ctx.parsed.toFixed(2)} (${((ctx.parsed/total)*100).toFixed(1)}%)`; } } } }
    }
  });
}

function renderCategoryBars(categories, total, type='expense') {
  const container = document.getElementById('category-bars'); if (!container) return;
  const currency = getCurrencySymbol();
  container.innerHTML = categories.map(([cat,amt]) => {
    const percent = ((amt/total)*100).toFixed(1);
    return `<div class="category-bar">
      <div class="category-bar-label">${cat}</div>
      <div class="category-bar-fill"><div class="category-bar-progress" style="width:${percent}%;background:linear-gradient(135deg,#667EEA 0%,#764BA2 100%)"></div></div>
      <div class="category-bar-amount" style="color:#667EEA">${currency}${amt.toFixed(0)}</div>
    </div>`;
  }).join('');
}

function renderTrendChart(data, days) {
  const canvas = document.getElementById('trendChart'); if (!canvas) return;
  const currency = getCurrencySymbol();
  const dates = [], incomeByDate = {}, expenseByDate = {};
  for (let i=days-1; i>=0; i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    const s = d.toISOString().split('T')[0];
    dates.push(s); incomeByDate[s]=0; expenseByDate[s]=0;
  }
  data.income.forEach(e => { if (incomeByDate.hasOwnProperty(e.date)) incomeByDate[e.date]+=Number(e.amount); });
  data.expenses.forEach(e => { if (expenseByDate.hasOwnProperty(e.date)) expenseByDate[e.date]+=Number(e.amount); });
  const labels = dates.map(d => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'}));
  if (trendChart) trendChart.destroy();
  trendChart = new Chart(canvas, {
    type:'line',
    data:{ labels, datasets:[
      {label:'Income', data:dates.map(d=>incomeByDate[d]),  borderColor:'#4CAF50',backgroundColor:'rgba(76,175,80,0.1)', fill:true,tension:0.4},
      {label:'Expense',data:dates.map(d=>expenseByDate[d]),borderColor:'#F44336',backgroundColor:'rgba(244,67,54,0.1)',fill:true,tension:0.4}
    ]},
    options:{ responsive:true, maintainAspectRatio:true, interaction:{intersect:false,mode:'index'},
      plugins:{ legend:{position:'bottom',labels:{padding:15,font:{size:13,weight:'600'}}}, tooltip:{callbacks:{label:ctx=>`${ctx.dataset.label}: ${currency}${ctx.parsed.y.toFixed(2)}`}} },
      scales:{ y:{beginAtZero:true,ticks:{callback:v=>currency+v}}, x:{ticks:{maxRotation:45,minRotation:45}} }
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
          <div class="category-bar-label">${cat}</div>
          <div class="category-bar-amount" style="color:#667EEA">${currency}${amt.toFixed(2)}</div>
        </div>`).join('')}
    </div>
    <button class="submit-btn" onclick="showAnalytics(${currentTimePeriod},'${type}')" style="margin-top:16px;">Back to Analytics</button>`);
}


// ============================================================
//  BACKUP & RESTORE
// ============================================================
function backupData() {
  const data = getData(), profile = getActiveProfile();
  const backup = { ...data, backupDate: new Date().toISOString(), version:'3.9', profileName: profile?.name||'Personal' };
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
  const backup = { ...data, backupDate:new Date().toISOString(), version:'3.9', encrypted:true, profileName:profile?.name||'Personal' };
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
  doc.text('Income',47.5,y+12,{align:'center'}); doc.setFontSize(12); doc.text(`${pdfCurrency} ${inc.toFixed(2)}`,47.5,y+22,{align:'center'});
  doc.setFillColor(255,235,238); doc.roundedRect(80,y+5,55,25,2,2,'F');
  doc.setTextColor(244,67,54); doc.setFontSize(10); doc.setFont(undefined,'bold');
  doc.text('Expense',107.5,y+12,{align:'center'}); doc.setFontSize(12); doc.text(`${pdfCurrency} ${exp.toFixed(2)}`,107.5,y+22,{align:'center'});
  doc.setFillColor(227,242,253); doc.roundedRect(140,y+5,50,25,2,2,'F');
  doc.setTextColor(102,126,234); doc.setFontSize(10); doc.setFont(undefined,'bold');
  doc.text('Balance',165,y+12,{align:'center'}); doc.setFontSize(12);
  const balText = bal>=0 ? `${pdfCurrency} ${bal.toFixed(2)}` : `-${pdfCurrency} ${Math.abs(bal).toFixed(2)}`;
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
  const amount   = `${type==='Income'?'+':'-'}${pdfCurrency} ${Number(item.amount).toFixed(2)}`;
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
      <h2 style="color:#667EEA;margin-bottom:24px;font-size:24px;">Privacy Policy</h2>

      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">📱 Data Storage & Privacy</h3>
        <p style="margin-bottom:12px;">SpendTrail is designed with your privacy as the top priority. All your financial data, including income entries, expense records, categories, notes, and transaction history, is stored exclusively on your device using your browser's local storage mechanism.</p>
        <p style="margin-bottom:12px;"><strong>We do not:</strong></p>
        <ul style="margin-left:20px;margin-bottom:12px;">
          <li style="margin-bottom:8px;">Collect any personal information</li>
          <li style="margin-bottom:8px;">Send your data to external servers</li>
          <li style="margin-bottom:8px;">Track your usage or behavior</li>
          <li style="margin-bottom:8px;">Share your information with third parties</li>
          <li style="margin-bottom:8px;">Store cookies for tracking purposes</li>
          <li style="margin-bottom:8px;">Require account registration or login</li>
        </ul>
        <p>Your financial data never leaves your device unless you explicitly export or backup the data yourself.</p>
      </div>

      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">👤 Multi-Profile Privacy</h3>
        <p style="margin-bottom:12px;">SpendTrail v3.9 introduces multi-profile support for separating personal, business, or family finances:</p>
        <ul style="margin-left:20px;margin-bottom:12px;">
          <li style="margin-bottom:8px;">Each profile's data is completely isolated on your device — no data is shared between profiles</li>
          <li style="margin-bottom:8px;">All profile data (transactions, currency settings) is stored locally under a unique profile ID</li>
          <li style="margin-bottom:8px;">Deleting a profile permanently removes all of its associated data from your device</li>
          <li style="margin-bottom:8px;">Switching profiles only changes which local data is displayed — no network requests are made</li>
          <li style="margin-bottom:8px;">Up to 5 profiles can exist simultaneously, all stored locally</li>
        </ul>
      </div>

      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">🔒 Security Measures</h3>
        <p style="margin-bottom:12px;">Your data security is paramount:</p>
        <ul style="margin-left:20px;margin-bottom:12px;">
          <li style="margin-bottom:8px;"><strong>Local Storage:</strong> Data is stored in your browser's secure local storage, isolated from other websites and applications.</li>
          <li style="margin-bottom:8px;"><strong>Encrypted Backups:</strong> When you create encrypted backups, we use industry-standard AES-256 encryption to protect your data with a password of your choice.</li>
          <li style="margin-bottom:8px;"><strong>No Server Transmission:</strong> Since no data is transmitted to servers, there's no risk of data breaches or unauthorized access from external sources.</li>
          <li style="margin-bottom:8px;"><strong>Device-Level Protection:</strong> Your data inherits the security measures of your device (PIN, password, biometrics).</li>
        </ul>
      </div>

      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">💾 Backup & Export</h3>
        <p style="margin-bottom:12px;">SpendTrail provides two backup options:</p>
        <ul style="margin-left:20px;margin-bottom:12px;">
          <li style="margin-bottom:8px;"><strong>Simple Backup:</strong> Creates a readable JSON file containing all your data for the active profile. This file is not encrypted and should be kept secure.</li>
          <li style="margin-bottom:8px;"><strong>Encrypted Backup:</strong> Creates a password-protected, AES-256 encrypted file. Only you have the password; if you lose it, the backup cannot be recovered.</li>
        </ul>
        <p style="margin-bottom:12px;">When you export data:</p>
        <ul style="margin-left:20px;">
          <li style="margin-bottom:8px;">The file is generated and saved directly to your device</li>
          <li style="margin-bottom:8px;">No data is uploaded to any server during the export process</li>
          <li style="margin-bottom:8px;">You have full control over where the backup file is stored</li>
          <li style="margin-bottom:8px;">You are responsible for the security of exported backup files</li>
        </ul>
      </div>

      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">📊 Analytics & Charts</h3>
        <p>The analytics and charts displayed in SpendTrail are generated entirely on your device using your local data. No analytics data is collected about your usage patterns, spending habits, or financial information. The insights you see are for your eyes only.</p>
      </div>

      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">🗑️ Data Deletion</h3>
        <p style="margin-bottom:12px;">You have complete control over your data:</p>
        <ul style="margin-left:20px;margin-bottom:12px;">
          <li style="margin-bottom:8px;"><strong>Individual Deletion:</strong> Delete specific income or expense entries at any time through the Edit/Delete options.</li>
          <li style="margin-bottom:8px;"><strong>Profile Deletion:</strong> Delete an entire profile and all its data permanently from the Manage Profiles screen.</li>
          <li style="margin-bottom:8px;"><strong>Complete Deletion:</strong> Use the "Delete All Data" option in the More tab to permanently erase all records in the active profile.</li>
          <li style="margin-bottom:8px;"><strong>Browser Data Clearing:</strong> Clearing your browser's data or cache will permanently delete all SpendTrail data stored locally.</li>
          <li style="margin-bottom:8px;"><strong>App Uninstallation:</strong> Uninstalling the Progressive Web App (PWA) or removing browser data will result in permanent data loss.</li>
        </ul>
        <p><strong>Important:</strong> Deleted data cannot be recovered unless you have a backup file saved separately.</p>
      </div>

      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">🌐 No External Services</h3>
        <p style="margin-bottom:12px;">SpendTrail operates entirely offline after the initial load. We do use the following external libraries loaded from CDNs for functionality:</p>
        <ul style="margin-left:20px;margin-bottom:12px;">
          <li style="margin-bottom:8px;"><strong>jsPDF:</strong> For generating PDF reports (loaded from cdnjs.cloudflare.com)</li>
          <li style="margin-bottom:8px;"><strong>CryptoJS:</strong> For encrypted backup functionality (loaded from cdnjs.cloudflare.com)</li>
          <li style="margin-bottom:8px;"><strong>Chart.js:</strong> For rendering analytics charts (loaded from cdn.jsdelivr.net)</li>
        </ul>
        <p>These libraries are loaded for functionality purposes only and do not collect or transmit any of your personal data.</p>
      </div>

      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">📱 Permissions</h3>
        <p style="margin-bottom:12px;">SpendTrail does not request or use:</p>
        <ul style="margin-left:20px;">
          <li style="margin-bottom:8px;">Camera or photo access</li>
          <li style="margin-bottom:8px;">Location services</li>
          <li style="margin-bottom:8px;">Contacts or address book</li>
          <li style="margin-bottom:8px;">Phone or SMS capabilities</li>
          <li style="margin-bottom:8px;">Microphone access</li>
          <li style="margin-bottom:8px;">Background app refresh</li>
          <li style="margin-bottom:8px;">Push notifications (unless you enable them)</li>
        </ul>
      </div>

      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">💱 Currency Feature</h3>
        <p style="margin-bottom:12px;">SpendTrail supports multi-currency symbol display per profile:</p>
        <ul style="margin-left:20px;">
          <li style="margin-bottom:8px;">Your selected currency symbol is stored locally on your device, per profile</li>
          <li style="margin-bottom:8px;">No currency conversion or exchange rate data is collected</li>
          <li style="margin-bottom:8px;">The currency symbol is purely for display purposes</li>
          <li style="margin-bottom:8px;">All amounts remain as entered; only the symbol changes</li>
        </ul>
      </div>

      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">🔄 Updates to This Policy</h3>
        <p style="margin-bottom:12px;">We may update this Privacy Policy from time to time to reflect:</p>
        <ul style="margin-left:20px;margin-bottom:12px;">
          <li style="margin-bottom:8px;">Changes in app functionality</li>
          <li style="margin-bottom:8px;">New features or capabilities</li>
          <li style="margin-bottom:8px;">Legal or regulatory requirements</li>
          <li style="margin-bottom:8px;">Improvements to security measures</li>
        </ul>
        <p>The latest version of this policy will always be available within the app under More → Privacy Policy. Continued use of SpendTrail after updates constitutes acceptance of the revised policy.</p>
      </div>

      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">👤 Your Rights</h3>
        <p style="margin-bottom:12px;">Since all data is stored locally on your device, you have complete control and ownership of your information:</p>
        <ul style="margin-left:20px;">
          <li style="margin-bottom:8px;"><strong>Access:</strong> View all your data at any time through the app interface</li>
          <li style="margin-bottom:8px;"><strong>Modify:</strong> Edit any entry using the Edit function</li>
          <li style="margin-bottom:8px;"><strong>Delete:</strong> Remove individual entries, entire profiles, or all data at once</li>
          <li style="margin-bottom:8px;"><strong>Export:</strong> Download your complete data set in JSON or PDF format</li>
          <li style="margin-bottom:8px;"><strong>Portability:</strong> Your data can be backed up and restored on any device</li>
        </ul>
      </div>

      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">⚠️ Important Disclaimers</h3>
        <ul style="margin-left:20px;">
          <li style="margin-bottom:8px;">SpendTrail is provided "as is" without warranties of any kind</li>
          <li style="margin-bottom:8px;">We are not responsible for data loss due to device failure, browser issues, or user error</li>
          <li style="margin-bottom:8px;">Regular backups are strongly recommended to prevent accidental data loss</li>
          <li style="margin-bottom:8px;">If you lose your encrypted backup password, your data cannot be recovered</li>
          <li style="margin-bottom:8px;">While we use secure encryption methods, you are responsible for keeping backup files in secure locations</li>
        </ul>
      </div>

      <div style="margin-bottom:28px;">
        <h3 style="color:#1A1A1A;font-size:18px;margin-bottom:12px;">📧 Contact & Support</h3>
        <p style="margin-bottom:12px;">SpendTrail is an open-source project. If you have:</p>
        <ul style="margin-left:20px;margin-bottom:12px;">
          <li style="margin-bottom:8px;">Questions about this Privacy Policy</li>
          <li style="margin-bottom:8px;">Concerns about data privacy or security</li>
          <li style="margin-bottom:8px;">Suggestions for improving privacy features</li>
          <li style="margin-bottom:8px;">Bug reports or technical issues</li>
          <li style="margin-bottom:8px;">Feature requests or ideas</li>
        </ul>
        <p style="margin-bottom:12px;">Please raise an issue on our GitHub repository:</p>
        <div style="background:#F5F5F5;padding:12px;border-radius:8px;margin-bottom:12px;">
          <a href="https://github.com/mananmadani/SpendTrail" target="_blank" style="color:#667EEA;font-weight:600;text-decoration:none;">🔗 github.com/mananmadani/SpendTrail</a>
        </div>
        <p style="margin-top:12px;">Since SpendTrail operates entirely locally without any backend infrastructure, we cannot access, view, or recover your data remotely. For data recovery, you must have a backup file.</p>
      </div>

      <div style="background:#E8F5E9;padding:16px;border-radius:12px;border-left:4px solid #4CAF50;">
        <p style="margin:0;font-weight:600;color:#2E7D32;">✓ Privacy Guarantee</p>
        <p style="margin:8px 0 0;color:#424242;">Your financial data is yours and yours alone. SpendTrail will never collect, transmit, sell, or share your personal information with anyone, ever.</p>
      </div>

      <p style="margin-top:24px;font-size:13px;color:#757575;text-align:center;">Last Updated: March 2026 | Version 3.9</p>
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
//  INITIALISE
// ============================================================
initProfiles();
updateProfileHeader();
loadHome();
setTodayDate();
updateCategoryList();

window.addEventListener('focus', setTodayDate);
document.addEventListener('visibilitychange', function() { if (!document.hidden) setTodayDate(); });
