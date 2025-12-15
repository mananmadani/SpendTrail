# 💰 SpendTrail

> A modern, privacy-focused expense and income tracker built as a Progressive Web App (PWA)

[![Live Demo](https://img.shields.io/badge/Demo-Live-success)](https://mananmadani.github.io/SpendTrail/)
[![Version](https://img.shields.io/badge/version-3.6-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

## 📖 About

SpendTrail is a lightweight, privacy-first expense tracker that runs entirely in your browser. No servers, no accounts, no tracking - just you and your financial data. Built with vanilla JavaScript and modern web technologies, it offers a seamless experience across all devices while keeping your data completely private.

## ✨ Key Features

### Core Functionality
- 📊 **Income & Expense Tracking** - Simple, intuitive entry system with categories and notes
- 📈 **Visual Analytics** - Beautiful pie charts, bar graphs, and trend analysis
- 💰 **Real-time Balance** - Instant overview of your financial status
- 📁 **Category Management** - Organize transactions with custom categories
- 🔍 **Smart Ledger** - View and filter all entries with powerful search

### Advanced Features
- 📅 **Custom Statements** - Generate reports for any date range
- 📄 **Professional PDF Export** - Beautiful, color-coded reports with tables and summaries
- 💾 **Backup & Restore** - Simple JSON or AES-256 encrypted backups
- ⏰ **Smart Sorting** - Chronological sorting by date, then time
- 🎯 **Long Press Actions** - Edit or delete entries with long press (mobile & desktop)

### Technical Highlights
- 🔒 **Privacy First** - All data stored locally using localStorage
- 🌙 **PWA Support** - Install as native app on any device
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- ⚡ **Offline Support** - Works without internet connection
- 🎨 **Modern UI** - Clean, minimalist design with smooth animations

## 🚀 Quick Start

### 🌐 Try Online
**No installation required!** Visit: [SpendTrail App](https://mananmadani.github.io/SpendTrail/)

### 📱 Install as App

<details>
<summary><b>Android / Chrome</b></summary>

1. Visit the [SpendTrail App](https://mananmadani.github.io/SpendTrail/)
2. Tap the menu (⋮) in the top-right corner
3. Select **"Install app"** or **"Add to Home screen"**
4. SpendTrail will be added to your home screen
</details>

<details>
<summary><b>iOS / Safari</b></summary>

1. Visit the [SpendTrail App](https://mananmadani.github.io/SpendTrail/)
2. Tap the **Share** button (square with arrow)
3. Scroll down and select **"Add to Home Screen"**
4. Tap **"Add"** to confirm
</details>

<details>
<summary><b>Desktop (Chrome, Edge, Brave)</b></summary>

1. Visit the [SpendTrail App](https://mananmadani.github.io/SpendTrail/)
2. Look for the **install icon** (⊕) in the address bar
3. Click it and select **"Install"**
4. SpendTrail will open as a standalone app
</details>

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Vanilla JavaScript (ES6+) |
| **Styling** | Custom CSS3 with Flexbox/Grid |
| **Storage** | LocalStorage API |
| **Charts** | Chart.js v4.4.0 |
| **PWA** | Service Workers, Web App Manifest |
| **PDF** | jsPDF v2.5.1 |
| **Encryption** | CryptoJS v4.1.1 (AES-256) |

## 💻 Local Development

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3 (optional, for local server)

### Installation

```bash
# Clone the repository
git clone https://github.com/mananmadani/SpendTrail.git

# Navigate to directory
cd SpendTrail

# Option 1: Open directly
# Simply open index.html in your browser

# Option 2: Use local server (recommended)
python -m http.server 8000

# Visit http://localhost:8000
📁 Project Structure
SpendTrail/
├── index.html           # Main HTML file
├── app.js              # Core application logic (~600 lines)
├── style.css           # Styles and themes (~800 lines)
├── manifest.json       # PWA manifest
├── service-worker.js   # Service worker for offline support
├── SpendTrail.png      # App icon (1024x1024)
├── README.md           # Documentation
├── LICENSE             # MIT License
└── .gitignore          # Git ignore rules
📚 Usage Guide
Adding Transactions
Click the Add tab in the bottom navigation
Toggle between Income or Expense
Enter:
Amount (e.g., 500.00)
Category (e.g., Food, Salary, Rent)
Date (defaults to today)
Note (optional)
Click "Add Income" or "Add Expense"
Viewing Analytics
Go to Insights → Analytics
Filter by time period (Week / Month / 3 Months)
Toggle between Income and Expense analytics
View:
🥧 Pie Chart - Category breakdown with percentages
📊 Bar Chart - All categories sorted by amount
📈 Trend Chart - Daily income vs expense trends
Generating Custom Statements
Go to Insights → Custom Statement
Select Start Date and End Date
Click "Generate" to view transactions
Click "Export PDF" to download a professional report
Managing Your Data
Backup Options
Simple Backup: Go to More → Backup Data (JSON format, human-readable)
Encrypted Backup: Go to More → Encrypted Backup (AES-256 encrypted, password-protected)
Restore Data
Go to More → Restore Data
Select your backup file (.json or .encrypted)
Enter password (if encrypted)
Confirm restoration
Export Full Report
Go to More → Export PDF for a complete financial report
Edit or Delete Transactions
Long press (or click and hold) any transaction
A context menu will appear with options:
✏️ Edit - Modify the transaction
🗑️ Delete - Remove the transaction
Cancel - Close the menu
🎨 PDF Report Features
SpendTrail generates professional PDF reports with:
📊 Color-coded Summary Cards
Green card for total income
Red card for total expenses
Blue card for balance
📋 Clean Table Layout
Column headers (Date, Category, Note, Amount)
Alternating row backgrounds for readability
Green text for income, red for expense
📄 Professional Formatting
Automatic pagination with page numbers
Headers repeated on each page
Branded header with app logo
Indian date format (e.g., "14 Dec 2025")
🔒 Privacy & Security
Data Storage
✅ 100% Local Storage - All data stored in your browser's localStorage
✅ No Cloud Sync - Data never leaves your device
✅ No Tracking - Zero analytics, cookies, or trackers
✅ No Registration - No accounts, emails, or personal info required
Encryption
🔐 AES-256 Encryption - Military-grade encryption for backups
🔑 Your Password Only - Only you know the password
⚠️ Password Recovery - Not possible (by design for security)
Data Control
📥 Export Anytime - Download your data in JSON or PDF
🗑️ Delete Anytime - Permanently delete all data
💾 Backup Control - Create backups whenever you want
🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
How to Contribute
Fork the project
Create your feature branch
git checkout -b feature/AmazingFeature
Commit your changes
git commit -m 'Add some AmazingFeature'
Push to the branch
git push origin feature/AmazingFeature
Open a Pull Request
Development Guidelines
Write clean, readable code
Follow existing code style
Test on multiple browsers
Update documentation if needed
📝 Changelog
v3.6 (Current - December 2025)
🐛 Bug Fixes
Fixed transaction sorting to prioritize date over timestamp
Old entries now appear in correct chronological position
Export PDF now uses proper date-based sorting
✨ Improvements
Professional PDF exports with colored tables and summary cards
Custom statement PDFs with period-specific summaries
Consistent sorting across all views (Home, All Entries, Ledger, Statements)
Better PDF layout with headers, footers, and page numbers
Improved date formatting in PDFs (Indian format)
v3.5 (November 2025)
Added income analytics with charts
Fixed entry sorting in custom statements
Added empty state displays in ledger
Enhanced privacy policy
v3.4 (October 2025)
Initial public release
Basic income/expense tracking
Simple analytics
PDF export functionality
🐛 Known Issues
Comma formatting for large numbers is under development
Browser localStorage limit is ~5-10MB (sufficient for thousands of transactions)
🗺️ Roadmap
[ ] Recurring transactions
[ ] Budget goals and alerts
[ ] Multi-currency support
[ ] Dark mode
[ ] Data sync via Google Drive (optional)
[ ] Category icons
[ ] Transaction attachments (receipt photos)
📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
What does this mean?
✅ Free to use for personal and commercial projects
✅ Free to modify and distribute
✅ No warranty provided
❌ Author not liable for any damages
👨‍💻 Author
Manan Madani
🐙 GitHub: @mananmadani
📧 Email: Open an issue for contact
🌐 Project: SpendTrail
⭐ Show Your Support
If SpendTrail helped you manage your finances better, please consider:
⭐ Starring the repository
🐛 Reporting bugs or issues
💡 Suggesting new features
🔀 Contributing code improvements
📢 Sharing with friends and family
📬 Support & Feedback
🐛 Bug Reports: Open an issue
💡 Feature Requests: Open an issue
❓ Questions: Discussions
