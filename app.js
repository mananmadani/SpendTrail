const tabs = document.querySelectorAll('.tab-btn');
const contents = document.querySelectorAll('.tab-content');
function activateTab(name) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    contents.forEach(c => c.classList.toggle('active', c.id === 'tab-' + name));
    if (window.navigator.vibrate) window.navigator.vibrate(22);
}
tabs.forEach(btn => {
    btn.addEventListener('click', e => {
        activateTab(e.target.dataset.tab);
        if (e.target.dataset.tab === "overview") {
            updateBalance(); updateSummary(); renderRecentList(); updateAutocompletes();
        } else if (e.target.dataset.tab === "income") {
            renderIncomeList(document.getElementById('search-income')?.value || "");
        } else if (e.target.dataset.tab === "expense") {
            renderExpenseList(document.getElementById('search-expense')?.value || "");
        }
    });
});
function getData() { return JSON.parse(localStorage.getItem('SpendTrail-data') || '{"income":[],"expenses":[]}'); }
function setData(data) { localStorage.setItem('SpendTrail-data', JSON.stringify(data)); }
function updateBalance() {
    const data = getData();
    const totalIncome = data.income.reduce((sum, i) => sum + Number(i.amount), 0);
    const totalExpenses = data.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    document.getElementById('balance').textContent = (totalIncome - totalExpenses).toFixed(2);
}
function updateSummary() {
    const data = getData();
    const totalCashIn = data.income.reduce((sum, i) => sum + Number(i.amount), 0);
    const totalCashOut = data.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    document.getElementById('total-cashin').textContent = `₹${totalCashIn.toFixed(2)}`;
    document.getElementById('total-cashout').textContent = `₹${totalCashOut.toFixed(2)}`;
}
function renderRecentList() {
    const data = getData();
    let all = [
        ...data.income.map(e => ({...e, type: 'Income'})),
        ...data.expenses.map(e => ({...e, type: 'Expense'}))
    ];
    
    // Sort by date (newest first), then by timestamp (newest first)
    all.sort((a, b) => {
        const dateComp = b.date.localeCompare(a.date);
        if (dateComp !== 0) return dateComp;
        return (b.timestamp || 0) - (a.timestamp || 0);
    });
    
    const shown = all.slice(0, 5);
    const list = document.getElementById('recent-list');
    list.innerHTML = '';
    shown.forEach(item => {
        const li = document.createElement('li');
        const typeColor = item.type === 'Income' ? '#00e389' : '#e94a46';
        li.style.cssText = `background:#242a36; border-radius:8px; padding:8px 10px; margin-bottom:8px; border-left:3px solid ${typeColor}; display:block;`;
        li.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
            <span style="color:${typeColor}; font-weight:700; font-size:0.95em;">${item.type}</span>
            <span style="color:#00BFA6; font-weight:700; font-size:1.05em;">₹${item.amount}</span>
          </div>
          <div style="color:#82ffd8; font-size:0.95em; margin-bottom:2px;">${item.category}</div>
          <div style="color:#7edfcc; font-size:0.88em;">${item.date}</div>
          ${item.note && item.note.trim() ? `<div style="color:#a9c3c3; font-size:0.85em; margin-top:4px; font-style:italic;">${item.note}</div>` : ''}
        `;
        list.appendChild(li);
    });
}
function renderIncomeList(filter="") {
    const data = getData();
    const list = document.getElementById('income-list');
    list.innerHTML = '';
    [...data.income]
  .map((item, idx) => ({ ...item, originalIndex: idx }))
  .sort((a, b) => {
    const dateComp = b.date.localeCompare(a.date);
    if (dateComp !== 0) return dateComp;
    return b.originalIndex - a.originalIndex;
  })
  .forEach((item, idx) => {
        if (!filter || item.category.toLowerCase().includes(filter) || (item.note && item.note.toLowerCase().includes(filter))) {
            const li = document.createElement('li');
            li.innerHTML = `₹${item.amount} | ${item.category} | ${item.date} | ${item.note||''} 
  <button onclick="editEntry('income', ${item.originalIndex})">Edit</button>
  <button onclick="deleteEntry('income', ${item.originalIndex})">Delete</button>`;
list.appendChild(li);
        }
    });
}
function renderExpenseList(filter="") {
    const data = getData();
    const list = document.getElementById('expense-list');
    list.innerHTML = '';
    [...data.expenses]
  .map((item, idx) => ({ ...item, originalIndex: idx }))
  .sort((a, b) => {
    const dateComp = b.date.localeCompare(a.date);
    if (dateComp !== 0) return dateComp;
    return b.originalIndex - a.originalIndex;
  })
  .forEach((item, idx) => {
        if (!filter || item.category.toLowerCase().includes(filter) || (item.note && item.note.toLowerCase().includes(filter))) {
            const li = document.createElement('li');
            li.innerHTML = `₹${item.amount} | ${item.category} | ${item.date} | ${item.note||''} 
  <button onclick="editEntry('expenses', ${item.originalIndex})">Edit</button>
  <button onclick="deleteEntry('expenses', ${item.originalIndex})">Delete</button>`;
list.appendChild(li);
        }
    });
}
window.deleteEntry = function(type, idx) {
    const data = getData();
    data[type].splice(idx, 1);
    setData(data);
    renderIncomeList(document.getElementById('search-income')?.value || "");
    renderExpenseList(document.getElementById('search-expense')?.value || "");
    updateBalance(); updateSummary(); renderRecentList(); updateAutocompletes();
    if (window.navigator.vibrate) window.navigator.vibrate(100);
};
window.editEntry = function(type, idx) {
    const data = getData();
    const entry = data[type][idx];
    document.getElementById('edit-amount').value = entry.amount;
    document.getElementById('edit-category').value = entry.category;
    document.getElementById('edit-date').value = entry.date;
    document.getElementById('edit-note').value = entry.note || '';
    document.getElementById('edit-type').value = type;
    document.getElementById('edit-idx').value = idx;
    document.getElementById('edit-modal').style.display = 'flex';
};
document.getElementById('edit-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const amount = document.getElementById('edit-amount').value;
    const category = document.getElementById('edit-category').value.trim();
    const date = document.getElementById('edit-date').value;
    const note = document.getElementById('edit-note').value;
    const type = document.getElementById('edit-type').value;
    const idx = document.getElementById('edit-idx').value;
    if (!amount || !category || !date) return;
    const data = getData();
    const oldTimestamp = data[type][idx].timestamp || Date.now();
    data[type][idx] = { amount, category, date, note, timestamp: oldTimestamp };
    setData(data);
    document.getElementById('edit-modal').style.display = 'none';
    renderIncomeList(document.getElementById('search-income')?.value || "");
    renderExpenseList(document.getElementById('search-expense')?.value || "");
    updateBalance(); updateSummary(); renderRecentList(); updateAutocompletes();
    if (window.navigator.vibrate) window.navigator.vibrate(22);
});
document.getElementById('close-edit-modal').addEventListener('click', function() {
    document.getElementById('edit-modal').style.display = 'none';
});
document.getElementById('edit-modal').addEventListener('click', function(e){
    if(e.target.id==='edit-modal') document.getElementById('edit-modal').style.display = 'none';
});
document.getElementById('income-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const amount = document.getElementById('income-amount').value;
    const category = document.getElementById('income-category').value.trim();
    const date = document.getElementById('income-date').value;
    const note = document.getElementById('income-note').value;
    if (!amount || !category || !date) return;
    const data = getData();
    data.income.push({ amount, category, date, note, timestamp: Date.now() });
    setData(data);
    this.reset();
    renderIncomeList(); updateBalance(); updateSummary(); renderRecentList(); updateAutocompletes();
    if (window.navigator.vibrate) window.navigator.vibrate(22);
});
document.getElementById('expense-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const amount = document.getElementById('expense-amount').value;
    const category = document.getElementById('expense-category').value.trim();
    const date = document.getElementById('expense-date').value;
    const note = document.getElementById('expense-note').value;
    if (!amount || !category || !date) return;
    const data = getData();
    data.expenses.push({ amount, category, date, note, timestamp: Date.now() });
    setData(data);
    this.reset();
    renderExpenseList(); updateBalance(); updateSummary(); renderRecentList(); updateAutocompletes();
    if (window.navigator.vibrate) window.navigator.vibrate(22);
});
document.getElementById('search-income').addEventListener('input', function() {
    renderIncomeList(this.value.toLowerCase());
});
document.getElementById('search-expense').addEventListener('input', function() {
    renderExpenseList(this.value.toLowerCase());
});
document.getElementById('export-pdf-btn').addEventListener('click', function() {
    const data = getData();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 10;
    
    // Title
    doc.setFontSize(18);
    doc.text('SpendTrail Report', 10, y); y += 10;
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 10, y); y += 10;
    
    // Summary
    const totalIncome = data.income.reduce((sum, i) => sum + Number(i.amount), 0);
    const totalExpense = data.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    doc.setFontSize(10);
    doc.text(`Total Income: Rs.${totalIncome.toFixed(2)}`, 10, y); y += 5;
    doc.text(`Total Expense: Rs.${totalExpense.toFixed(2)}`, 10, y); y += 5;
    doc.text(`Balance: Rs.${(totalIncome - totalExpense).toFixed(2)}`, 10, y); y += 10;
    
    // All entries with proper sorting
    let allEntries = [
        ...data.income.map(e => ({...e, type: 'Income'})),
        ...data.expenses.map(e => ({...e, type: 'Expense'}))
    ].sort((a, b) => {
        const dateCmp = b.date.localeCompare(a.date);
        if (dateCmp !== 0) return dateCmp;
        return (b.timestamp || 0) - (a.timestamp || 0);
    });
    
    doc.setFont(undefined, 'bold');
    doc.text('All Entries:', 10, y);
    doc.setFont(undefined, 'normal');
    y += 6;
    
    doc.setFontSize(9);
    allEntries.forEach(item => {
        if (y > 280) { doc.addPage(); y = 10; }
        doc.text(`${item.type} | Rs.${item.amount} | ${item.category} | ${item.date}`, 12, y);
        y += 4;
        if (item.note && item.note.trim()) {
            doc.text(`  Note: ${item.note}`, 12, y);
            y += 4;
        }
        y += 1;
    });
    
    doc.save('SpendTrail-report.pdf');
    if (window.navigator.vibrate) window.navigator.vibrate(50);
});
document.getElementById('delete-all-btn').addEventListener('click', function() {
    if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
        localStorage.removeItem('SpendTrail-data');
        renderIncomeList(); renderExpenseList();
        updateBalance(); updateSummary(); renderRecentList(); updateAutocompletes();
        if (window.navigator.vibrate) window.navigator.vibrate(100);
    }
});
function updateAutocompletes() {
    const data = getData();
    const incList = document.getElementById('inc-category-list');
    incList.innerHTML = '';
    [...new Set(data.income.map(e => (e.category||'').trim()).filter(x=>!!x))].forEach(cat => incList.innerHTML += `<option value="${cat}">`);
    const expList = document.getElementById('exp-category-list');
    expList.innerHTML = '';
    [...new Set(data.expenses.map(e => (e.category||'').trim()).filter(x=>!!x))].forEach(cat => expList.innerHTML += `<option value="${cat}">`);
}
function filterEntriesByDate(startDate, endDate) {
    const data = getData();
    const start = new Date(startDate);
    const end = new Date(endDate);
    let all = [
        ...data.income.map(e => ({...e, type: 'Income'})),
        ...data.expenses.map(e => ({...e, type: 'Expense'}))
    ];
    
    all = all.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= start && itemDate <= end;
    });
    
    return all.sort((a, b) => {
        const dateComp = b.date.localeCompare(a.date);
        if (dateComp !== 0) return dateComp;
        return (b.timestamp || 0) - (a.timestamp || 0);
    });
}
document.getElementById('generate-statement-btn').addEventListener('click', function() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    if (!startDate || !endDate) return;
    const filtered = filterEntriesByDate(startDate, endDate);
    const list = document.getElementById('statement-list');
    list.innerHTML = '';
    if(filtered.length === 0) {
        list.innerHTML = '<li>No entries in this range.</li>';
    } else {
        filtered.forEach(item => {
            const li = document.createElement('li');
            const typeColor = item.type === 'Income' ? '#00e389' : '#e94a46';
            li.style.cssText = `background:#242a36; border-radius:8px; padding:8px 10px; margin-bottom:8px; border-left:3px solid ${typeColor}; display:block;`;
            li.innerHTML = `
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                <span style="color:${typeColor}; font-weight:700; font-size:0.95em;">${item.type}</span>
                <span style="color:#00BFA6; font-weight:700; font-size:1.05em;">₹${item.amount}</span>
              </div>
              <div style="color:#82ffd8; font-size:0.95em; margin-bottom:2px;">${item.category}</div>
              <div style="color:#7edfcc; font-size:0.88em;">${item.date}</div>
              ${item.note && item.note.trim() ? `<div style="color:#a9c3c3; font-size:0.85em; margin-top:4px; font-style:italic;">${item.note}</div>` : ''}
            `;
            list.appendChild(li);
        });
    }
    if (window.navigator.vibrate) window.navigator.vibrate(22);
});
document.getElementById('export-statement-pdf-btn').addEventListener('click', function() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    if (!startDate || !endDate) return;
    const filtered = filterEntriesByDate(startDate, endDate);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(18);
    doc.text('SpendTrail Statement', 10, y); y += 8;
    doc.setFontSize(12);
    doc.text(`Date Range: ${startDate} to ${endDate}`, 10, y); y += 8;
    doc.setFontSize(10);
    filtered.forEach(item => {
        let line =
          `${item.type} | ₹${item.amount} | ${item.category} | ${item.date}` +
          (item.note && item.note.trim() ? ` | ${item.note}` : "");
        doc.text(line, 10, y);
        y += 6;
    });
    doc.save('SpendTrail-statement.pdf');
    if (window.navigator.vibrate) window.navigator.vibrate(50);
});
function initialize() {
    renderIncomeList();
    renderExpenseList();
    updateBalance();
    updateSummary();
    renderRecentList();
    updateAutocompletes();
}
initialize();
// Hamburger menu open/close controls
document.getElementById('menu-btn').onclick = function() {
  document.getElementById('side-menu').style.display = 'block';
  document.getElementById('menu-overlay').style.display = 'block';
  // Haptic feedback!
  if (window.navigator.vibrate) window.navigator.vibrate(20);
};
function closeMenu() {
  document.getElementById('side-menu').style.display = 'none';
  document.getElementById('menu-overlay').style.display = 'none';
}

// Privacy Policy - show in overlay page
function showPrivacyPolicy() {
  closeMenu();
  document.getElementById('page-content').innerHTML = `
    <div style="padding:13px;">
      <h3 style="margin-top:0;">Privacy Policy</h3>
      <p><strong>Data Privacy:</strong><br>
      SpendTrail keeps your financial data private. All your entries are stored only on your device with your browser’s local storage. No data is sent to any server or outside this device.</p>
      <p><strong>Permissions:</strong><br>
      This app does not use your contacts, location, camera, or personal info. No information about you or your device is shared with anyone.</p>
      <p><strong>Removing Data:</strong><br>
      If you delete the app or clear your browser storage, all records will be permanently erased.</p>
      <p><strong>Updates:</strong><br>
      This policy will be updated if the app ever requires new features or permissions. Latest version will always be available in this section.</p>
      <p>Contact us anytime through the support option if you have privacy concerns or questions.</p>
    </div>
  `;
  document.getElementById('page-view').style.display = 'block';
}
// All Entries - show all income and expense entries
function showAllEntries(filterType = 'all') {
  closeMenu();
  const data = getData();
  let all = [
    ...data.income.map(e => ({ ...e, type: 'Income' })),
    ...data.expenses.map(e => ({ ...e, type: 'Expense' }))
  ];

  if (filterType === 'income') all = all.filter(e => e.type === 'Income');
  if (filterType === 'expense') all = all.filter(e => e.type === 'Expense');

  all = all.sort((a, b) => {
    const dateCmp = b.date.localeCompare(a.date);
    if (dateCmp !== 0) return dateCmp;
    return (b.timestamp || 0) - (a.timestamp || 0);
  });

  const totalIncome = data.income.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpense = data.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const balance = totalIncome - totalExpense;

  let html = `
  <div style="padding:10px;">
    <b style="font-size:1.3em; color:#00BFA6;">All Entries</b>
    
    <div style="margin:18px 0; padding:16px; background:#232c40; border-radius:14px; box-shadow:0 3px 12px #00bfa618;">
      <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
        <span style="color:#7edfcc;">Total Income:</span>
        <span style="color:#00e389; font-weight:700;">₹${totalIncome.toFixed(2)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
        <span style="color:#7edfcc;">Total Expense:</span>
        <span style="color:#e94a46; font-weight:700;">₹${totalExpense.toFixed(2)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding-top:10px; border-top:1.5px solid #394457;">
        <span style="color:#b2ded7; font-weight:600;">Balance:</span>
        <span style="color:#00BFA6; font-weight:700; font-size:1.15em;">₹${balance.toFixed(2)}</span>
      </div>
    </div>

    <div style="margin:15px 0 22px 0; display: flex; gap: 10px;">
      <button onclick="showAllEntries('all'); if(window.navigator.vibrate) window.navigator.vibrate(18);" 
        style="padding:8px 28px; border-radius:25px; border:none; font-weight:700; font-size:1.07em; background:${filterType==='all' ? '#00BFA6' : '#232c40'}; color:${filterType==='all' ? '#181c26' : '#00BFA6'}; box-shadow:0 2px 8px #00bfa613; cursor:pointer; transition:background .18s,color .18s;">
        All
      </button>
      <button onclick="showAllEntries('income'); if(window.navigator.vibrate) window.navigator.vibrate(18);" 
        style="padding:8px 28px; border-radius:25px; border:none; font-weight:700; font-size:1.07em; background:${filterType==='income' ? '#00BFA6' : '#232c40'}; color:${filterType==='income' ? '#181c26' : '#00BFA6'}; box-shadow:0 2px 8px #00bfa613; cursor:pointer; transition:background .18s,color .18s;">
        Income
      </button>
      <button onclick="showAllEntries('expense'); if(window.navigator.vibrate) window.navigator.vibrate(18);" 
        style="padding:8px 28px; border-radius:25px; border:none; font-weight:700; font-size:1.07em; background:${filterType==='expense' ? '#00BFA6' : '#232c40'}; color:${filterType==='expense' ? '#181c26' : '#00BFA6'}; box-shadow:0 2px 8px #00bfa613; cursor:pointer; transition:background .18s,color .18s;">
        Expense
      </button>
    </div>

    <div style="color:#7edfcc; font-size:0.95em; margin-bottom:12px;">
      Showing ${all.length} ${filterType === 'all' ? 'entries' : filterType + ' entries'}
    </div>
  `;
  
  if (all.length === 0) {
    html += '<div style="padding:20px; text-align:center; color:#7edfcc;">No entries yet.</div>';
  } else {
    html += '<div style="max-height:55vh; overflow-y:auto;">';
    all.forEach(e => {
      const typeColor = e.type === 'Income' ? '#00e389' : '#e94a46';
      html += `
        <div style="background:#242a36; border-radius:8px; padding:8px 10px; margin-bottom:8px; border-left:3px solid ${typeColor};">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
            <span style="color:${typeColor}; font-weight:700; font-size:0.95em;">${e.type}</span>
            <span style="color:#00BFA6; font-weight:700; font-size:1.05em;">₹${e.amount}</span>
          </div>
          <div style="color:#82ffd8; font-size:0.95em; margin-bottom:2px;">${e.category}</div>
          <div style="color:#7edfcc; font-size:0.88em;">${e.date}</div>
          ${e.note && e.note.trim() ? `<div style="color:#a9c3c3; font-size:0.85em; margin-top:4px; font-style:italic;">${e.note}</div>` : ''}
        </div>
      `;
    });
    html += '</div>';
  }
  
  html += '</div>';
  document.getElementById('page-content').innerHTML = html;
  document.getElementById('page-view').style.display = 'block';
      }
// Ledger: Show all categories in menu
function showLedgerCategories() {
  const data = getData();
  const categories = Array.from(new Set([...data.income.map(x => x.category), ...data.expenses.map(x => x.category)])).filter(Boolean);
  let html = '<div style="padding:10px 0 0 5px; font-weight:600;">Select Category:</div>';
  html += categories.map(cat => `<div class="menu-item" onclick="showLedger('${cat}')">${cat}</div>`).join('');
  document.getElementById('menu-content').innerHTML = html;
}

// Ledger: Show selected category in overlay
function showLedger(category, filterType = 'all') {
  closeMenu();
  const data = getData();
  let all = [
    ...data.income.map(e => ({ ...e, type: 'Income' })),
    ...data.expenses.map(e => ({ ...e, type: 'Expense' }))
  ].filter(e => e.category === category);

  if (filterType === 'income') all = all.filter(e => e.type === 'Income');
  if (filterType === 'expense') all = all.filter(e => e.type === 'Expense');

  all = all.sort((a, b) => {
    const dateCmp = b.date.localeCompare(a.date);
    if (dateCmp !== 0) return dateCmp;
    return (b.timestamp || 0) - (a.timestamp || 0);
  });

// Calculate totals from ALL entries in this category (before filter)
  const allCategoryEntries = [
    ...data.income.map(e => ({ ...e, type: 'Income' })),
    ...data.expenses.map(e => ({ ...e, type: 'Expense' }))
  ].filter(e => e.category === category);
  
  const totalIncome = allCategoryEntries.filter(e => e.type === 'Income').reduce((sum, e) => sum + Number(e.amount), 0);
  const totalExpense = allCategoryEntries.filter(e => e.type === 'Expense').reduce((sum, e) => sum + Number(e.amount), 0);

  let html = `
  <div style="padding:10px;">
    <b style="font-size:1.3em; color:#00BFA6;">${category}</b>
    
    <div style="margin:18px 0; padding:16px; background:#232c40; border-radius:14px; box-shadow:0 3px 12px #00bfa618;">
      <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
        <span style="color:#7edfcc;">Total Income:</span>
        <span style="color:#00e389; font-weight:700;">₹${totalIncome.toFixed(2)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
        <span style="color:#7edfcc;">Total Expense:</span>
        <span style="color:#e94a46; font-weight:700;">₹${totalExpense.toFixed(2)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding-top:10px; border-top:1.5px solid #394457;">
        <span style="color:#b2ded7; font-weight:600;">Transactions:</span>
        <span style="color:#00BFA6; font-weight:700;">${all.length} entries</span>
      </div>
    </div>

    <div style="margin:15px 0 22px 0; display: flex; gap: 10px;">
      <button onclick="showLedger('${category}', 'all'); if(window.navigator.vibrate) window.navigator.vibrate(18);" 
        style="padding:8px 28px; border-radius:25px; border:none; font-weight:700; font-size:1.07em; background:${filterType==='all' ? '#00BFA6' : '#232c40'}; color:${filterType==='all' ? '#181c26' : '#00BFA6'}; box-shadow:0 2px 8px #00bfa613; cursor:pointer; transition:background .18s,color .18s;">
        All
      </button>
      <button onclick="showLedger('${category}', 'income'); if(window.navigator.vibrate) window.navigator.vibrate(18);" 
        style="padding:8px 28px; border-radius:25px; border:none; font-weight:700; font-size:1.07em; background:${filterType==='income' ? '#00BFA6' : '#232c40'}; color:${filterType==='income' ? '#181c26' : '#00BFA6'}; box-shadow:0 2px 8px #00bfa613; cursor:pointer; transition:background .18s,color .18s;">
        Income
      </button>
      <button onclick="showLedger('${category}', 'expense'); if(window.navigator.vibrate) window.navigator.vibrate(18);" 
        style="padding:8px 28px; border-radius:25px; border:none; font-weight:700; font-size:1.07em; background:${filterType==='expense' ? '#00BFA6' : '#232c40'}; color:${filterType==='expense' ? '#181c26' : '#00BFA6'}; box-shadow:0 2px 8px #00bfa613; cursor:pointer; transition:background .18s,color .18s;">
        Expense
      </button>
    </div>

    <div style="color:#7edfcc; font-size:0.95em; margin-bottom:12px;">
      Showing ${all.length} ${filterType === 'all' ? 'entries' : filterType + ' entries'}
    </div>
  `;
  
  if (all.length === 0) {
    html += '<div style="padding:20px; text-align:center; color:#7edfcc;">No entries yet.</div>';
  } else {
    html += '<div style="max-height:55vh; overflow-y:auto;">';
    all.forEach(e => {
      const typeColor = e.type === 'Income' ? '#00e389' : '#e94a46';
      html += `
        <div style="background:#242a36; border-radius:8px; padding:8px 10px; margin-bottom:8px; border-left:3px solid ${typeColor};">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
            <span style="color:${typeColor}; font-weight:700; font-size:0.95em;">${e.type}</span>
            <span style="color:#00BFA6; font-weight:700; font-size:1.05em;">₹${e.amount}</span>
          </div>
          <div style="color:#82ffd8; font-size:0.95em; margin-bottom:2px;">${category}</div>
          <div style="color:#7edfcc; font-size:0.88em;">${e.date}</div>
          ${e.note && e.note.trim() ? `<div style="color:#a9c3c3; font-size:0.85em; margin-top:4px; font-style:italic;">${e.note}</div>` : ''}
        </div>
      `;
    });
    html += '</div>';
  }
  
  html += '</div>';
  document.getElementById('page-content').innerHTML = html;
  document.getElementById('page-view').style.display = 'block';
}

// Back button for overlay page with haptic feedback
document.getElementById('close-page-view').onclick = function() {
  document.getElementById('page-view').style.display = 'none';
  if (window.navigator.vibrate) window.navigator.vibrate(22);
};
