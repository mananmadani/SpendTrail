# 📚 SpendTrail — User Guide

A complete guide to using every feature in SpendTrail.

---

## Table of Contents

1. [Managing Profiles](#-managing-profiles)
2. [Setting Your Currency](#-setting-your-currency)
3. [Adding Transactions](#-adding-transactions)
4. [Viewing & Searching Transactions](#-viewing--searching-transactions)
5. [Editing & Deleting Transactions](#-editing--deleting-transactions)
6. [Analytics](#-analytics)
7. [Ledger](#-ledger)
8. [Custom Statements](#-custom-statements)
9. [Exporting PDF Reports](#-exporting-pdf-reports)
10. [Backup & Restore](#-backup--restore)
11. [Deleting All Data](#-deleting-all-data)
12. [PDF Report Details](#-pdf-report-details)

---

## 👤 Managing Profiles

1. Go to **More → Manage Profiles**
2. Your active profile is highlighted with a blue border and **● Active** badge
3. **Switch profile** — tap any inactive profile card to switch to it
4. **Create profile** — tap **＋ New Profile**, enter a name (max 20 characters, up to 5 profiles total)
5. **Rename profile** — tap **Rename** on any profile card
6. **Delete profile** — tap **Delete** on any profile to permanently remove it and all its data

> The active profile name is always visible next to the SpendTrail logo in the header.  
> Each profile maintains completely separate transactions, categories, currency, and settings.

---

## 💱 Setting Your Currency

1. Go to **More → Currency Symbol**
2. Select your preferred currency from the dropdown (30 options available)
3. Tap **Save Currency**

> Currency settings are saved per profile. Each profile can have a different currency symbol.  
> Currency selection changes the display symbol only — no conversion calculations are performed.

---

## ➕ Adding Transactions

1. Tap the **Add** tab in the bottom navigation
2. Toggle between **Expense** or **Income** at the top
3. Fill in the form:
   - **Amount** — enter the value (e.g. 500.00)
   - **Category** — type a category name; existing categories are suggested automatically
   - **Date** — defaults to today; tap to change
   - **Note** — optional, for extra detail
4. Tap **"Add Expense"** or **"Add Income"**

> The 10 most recent transactions are shown on the Home tab immediately after adding.

---

## 📋 Viewing & Searching Transactions

### All Entries
1. Go to **Insights → All Entries**
2. Use the **search bar** at the top to filter by category or note in real-time
3. Use the **All / Income / Expense** filter tabs to narrow results
4. A summary of total income, expense, and balance is shown at the top

### Home Screen
- The Home tab always shows your 10 most recent transactions
- Tap **Add Income** or **Add Expense** shortcuts to jump directly to the Add tab with the correct type pre-selected

---

## ✏️ Editing & Deleting Transactions

1. **Long press** (or click and hold) any transaction in All Entries, Ledger, or Category Details
2. A context menu slides up with three options:
   - ✏️ **Edit** — modify amount, category, date, or note
   - 🗑️ **Delete** — permanently remove the transaction
   - **Cancel** — dismiss the menu

> After editing, the view refreshes automatically and returns you to where you were.

---

## 📊 Analytics

1. Go to **Insights → Analytics**
2. Select a time period: **Week** (7 days) / **Month** (30 days) / **3 Months** (90 days)
3. Toggle between **Expense** and **Income** analytics
4. Three chart views are available:
   - 🥧 **Pie Chart** — top 5 categories with percentages; tap "View Others Breakdown" to see remaining categories
   - 📊 **Bar Chart** — all categories sorted by amount with visual progress bars
   - 📈 **Trend Chart** — daily income vs expense over the selected period

---

## 📁 Ledger

1. Go to **Insights → Ledger**
2. All categories with transactions are listed, showing income total, expense total, and entry count
3. Use the **search bar** to filter categories by name
4. Tap any category to drill into its transactions
5. Inside a category, use the **All / Income / Expense** filter tabs
6. Long press any transaction to edit or delete it

---

## 📅 Custom Statements

1. Go to **Insights → Custom Statement**
2. Select a **Start Date** and **End Date**
3. Tap **"Generate"** to view all transactions in that period
4. Tap **"Export PDF"** to download a formatted statement for that date range

---

## 📄 Exporting PDF Reports

**Full Report (all data in active profile):**
1. Go to **Insights → Export PDF**
2. A PDF is generated and downloaded instantly
3. Filename includes the active profile name (e.g. `SpendTrail-Personal.pdf`)

**Date Range Report:**
1. Go to **Insights → Custom Statement**
2. Set your dates, tap **Generate**, then tap **Export PDF**
3. Filename includes the date range (e.g. `SpendTrail-Statement-2026-01-01-to-2026-03-31.pdf`)

> PDF currency symbols are displayed as readable text codes (Rs., USD, EUR, etc.) due to PDF font limitations.

---

## 💾 Backup & Restore

All backup and restore options are available under **More → Backup & Restore**.

### Creating a Backup

**Simple Backup (JSON):**
1. Go to **More → Backup & Restore → Backup Data**
2. A `.json` file is saved to your device
3. File is human-readable but **not encrypted** — store it securely

**Encrypted Backup:**
1. Go to **More → Backup & Restore → Encrypted Backup**
2. Enter a password (minimum 8 characters)
3. Confirm the password
4. An `.encrypted` file is saved to your device
5. ⚠️ If you lose your password, the backup **cannot be recovered**

### Restoring a Backup

1. Go to **More → Backup & Restore → Restore Data**
2. Select your backup file (`.json` or `.encrypted`)
3. Enter the password if restoring an encrypted backup
4. Confirm — data is restored into the currently active profile

> Backups are per-profile. Each profile's data is backed up and restored independently. Restoring overwrites the current active profile's data.

---

## 🗑️ Deleting All Data

1. Go to **More → Delete All Data**
2. Confirm twice when prompted
3. All transactions in the **active profile only** are permanently deleted
4. Other profiles are completely unaffected

> To delete an entire profile and all its data, use **More → Manage Profiles → Delete**.

---

## 📄 PDF Report Details

SpendTrail generates professional PDFs with:

- **Header** — branded with SpendTrail name and profile/date info
- **Summary Cards** — green (income), red (expense), blue (balance)
- **Transaction Table** — columns for Date, Category, Note, and Amount
- **Color coding** — green text for income, red for expense
- **Alternating rows** — for easy readability
- **Automatic pagination** — headers repeated on each page with page numbers

---

*For bug reports, feature requests, or questions, visit [github.com/mananmadani/SpendTrail/issues](https://github.com/mananmadani/SpendTrail/issues)*
