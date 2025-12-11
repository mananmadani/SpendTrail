# 💰 SpendTrail

> A modern, privacy-focused expense and income tracker built as a Progressive Web App (PWA)

[![Live Demo](https://img.shields.io/badge/Demo-Live-success)](https://mananmadani.github.io/SpendTrail/)
[![Version](https://img.shields.io/badge/version-3.5-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

## ✨ Features

- 📊 **Track Income & Expenses** - Simple and intuitive entry system
- 📈 **Visual Analytics** - Beautiful charts showing spending breakdown
- 💰 **Real-time Balance** - Always know where you stand financially
- 📁 **Category Management** - Organize transactions by category
- 🔍 **Smart Ledger** - View all entries with powerful filtering
- 📅 **Custom Statements** - Generate reports for any date range
- 💾 **Backup & Restore** - Simple JSON or encrypted backup options
- 📄 **PDF Export** - Professional reports ready to share
- 🔒 **Privacy First** - All data stored locally on your device
- 🌙 **PWA Support** - Install as app on any device
- 📱 **Fully Responsive** - Works perfectly on mobile, tablet, and desktop
- ⚡ **Offline Support** - Works without internet connection

## 🚀 Quick Start

### Try it Now
Visit the live demo: [SpendTrail App](https://mananmadani.github.io/SpendTrail/)

### Install as App

**On Android/Chrome:**
1. Visit the link above
2. Tap the menu (⋮) and select "Install app"
3. SpendTrail will be added to your home screen

**On iOS/Safari:**
1. Visit the link above
2. Tap the Share button
3. Select "Add to Home Screen"

**On Desktop:**
1. Visit the link above
2. Click the install icon in the address bar

## 🛠️ Tech Stack

- **Frontend:** Vanilla JavaScript (ES6+)
- **Styling:** Custom CSS with modern design
- **Storage:** LocalStorage API
- **Charts:** Chart.js
- **PWA:** Service Workers, Web App Manifest
- **PDF Generation:** jsPDF
- **Encryption:** CryptoJS

## 📦 Installation (For Developers)

```bash
# Clone the repository
git clone https://github.com/mananmadani/SpendTrail.git

# Navigate to directory
cd SpendTrail

# Open in browser
# Simply open index.html in your browser
# Or use a local server:

# Using Python 3
python -m http.server 8000

# Then visit http://localhost:8000
📁 Project Structure
SpendTrail/
├── index.html           # Main HTML file
├── app.js              # Core application logic
├── style.css           # Styles and themes
├── manifest.json       # PWA manifest
├── service-worker.js   # Service worker for offline support
├── SpendTrail.png      # App icon
└── README.md           # Documentation
🔒 Privacy & Security
Your data, your control:
✅ All data stored locally on your device
✅ No data sent to external servers
✅ No tracking or analytics
✅ No account registration required
✅ Works completely offline
✅ Optional encrypted backups with your password
💡 Usage
Adding Transactions
Click the Add tab
Toggle between Income/Expense
Enter amount, category, date, and optional note
Click "Add Income" or "Add Expense"
Viewing Analytics
Go to Insights → Analytics
Toggle between Income and Expense analytics
View pie charts, bar charts, and trend analysis
Filter by week, month, or 3 months
Generating Reports
Go to Insights → Custom Statement
Select start and end date
Click "Generate" to view
Click "Export PDF" to download
Backup Your Data
Go to More tab
Choose "Backup Data" (simple JSON) or "Encrypted Backup" (password-protected)
Save the file securely
Restore anytime using "Restore Data"
🤝 Contributing
Contributions, issues, and feature requests are welcome!
Fork the project
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request
📝 Changelog
v3.5 (Current)
✅ Added income analytics with charts
✅ Fixed entry sorting in custom statements
✅ Added empty state displays in ledger
✅ Improved auto-update system for PWA
✅ Added input validation (no negative/zero amounts)
✅ Enhanced privacy policy
v3.4
Initial public release
📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
👨‍💻 Author
Manan Madani
GitHub: @mananmadani
Project Link: SpendTrail
⭐ Show Your Support
Give a ⭐️ if this project helped you!
📬 Contact
Have questions or suggestions? Feel free to open an issue!
