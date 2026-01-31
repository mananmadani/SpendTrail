# 💰 SpendTrail

> A modern, privacy-focused expense and income tracker with multi-currency support built as a Progressive Web App (PWA)

[![Live Demo](https://img.shields.io/badge/Demo-Live-success)](https://mananmadani.github.io/SpendTrail/)
[![Downloads](https://hits.sh/github.com/mananmadani/SpendTrail/main.svg?label=downloads&color=7c1&labelColor=555&style=flat)](https://github.com/mananmadani/SpendTrail)
[![Version](https://img.shields.io/badge/version-3.8-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

## 📖 About

SpendTrail is a lightweight, privacy-first expense tracker that runs entirely in your browser. No servers, no accounts, no tracking - just you and your financial data. Built with vanilla JavaScript and modern web technologies, it offers a seamless experience across all devices while keeping your data completely private.

## 📸 Screenshots

<div align="center">

### Dashboard & Overview
<img src="screenshots/dashboard.jpg" alt="Dashboard showing balance and recent transactions" width="300"/>

### Add Transactions
<img src="screenshots/add-transaction.jpg" alt="Add income or expense form" width="300"/>

### Analytics & Insights
<img src="screenshots/analytics.jpg" alt="Pie chart and bar chart analytics" width="300"/>

### Ledger View
<img src="screenshots/ledger.jpg" alt="Complete transaction ledger with filters" width="300"/>

### PDF Export
<img src="screenshots/pdf-export.jpg" alt="Professional PDF report example" width="300"/>

</div>

## ✨ Key Features

### Core Functionality
- 📊 **Income & Expense Tracking** - Simple, intuitive entry system with categories and notes
- 💱 **Multi-Currency Support** - Choose from 30 currency symbols (₹, $, €, £, ¥, and more)
- 📈 **Visual Analytics** - Beautiful pie charts, bar graphs, and trend analysis
- 💰 **Real-time Balance** - Instant overview of your financial status
- 📁 **Category Management** - Organize transactions with custom categories
- 🔍 **Smart Search** - Search transactions by category or note in real-time

### Advanced Features
- 📅 **Custom Statements** - Generate reports for any date range
- 📄 **Professional PDF Export** - Beautiful, color-coded reports with tables and summaries
- 💾 **Backup & Restore** - Simple JSON or AES-256 encrypted backups
- 📋 **Complete Ledger** - View all entries with powerful filtering and search

### Technical Highlights
- 🔒 **Privacy First** - All data stored locally using localStorage
- 🌙 **PWA Support** - Install as native app on any device
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- ⚡ **Offline Support** - Works without internet connection
- 🎨 **Modern UI** - Clean, minimalist design with smooth animations

## 🌍 Supported Currencies

SpendTrail supports **30 currency symbols** from around the world:

**Asia:** INR (₹), JPY (¥), CNY (元), SGD (S$), HKD (HK$), MYR (RM), THB (฿), IDR (Rp), PKR (₨), BDT (৳), KRW (₩)

**Europe:** EUR (€), GBP (£), CHF (Fr), SEK (SEK), NOK (NOK), DKK (DKK), PLN (zł), TRY (₺), RUB (₽)

**Americas:** USD ($), CAD (C$), BRL (R$), MXN (Mex$), AUD (A$), NZD (NZ$)

**Middle East:** AED (د.إ), SAR (﷼), QAR (ر.ق)

**Africa:** ZAR (R)

*Note: Currency selection only changes the display symbol. No conversion calculations are performed.*

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
```

## 📁 Project Structure

```
SpendTrail/
├── index.html           # Main HTML file
├── app.js              # Core application logic
├── style.css           # Styles and themes 
├── manifest.json       # PWA manifest
├── service-worker.js   # Service worker for offline support
├── SpendTrail.png      # App icon (1024x1024)
├── screenshots/        # App screenshots for README
│   ├── dashboard.jpg
│   ├── add-transaction.jpg
│   ├── analytics.jpg
│   ├── ledger.jpg
│   └── pdf-export.jpg
├── README.md           # Documentation
├── LICENSE             # MIT License
└── .gitignore          # Git ignore rules
```

## 📚 Usage Guide

### Setting Your Currency

1. Go to **More → Currency Symbol**
2. Select your preferred currency from the dropdown
3. All amounts will now display with your chosen symbol

### Adding Transactions

1. Click the **Add** tab in the bottom navigation
2. Toggle between **Income** or **Expense**
3. Enter:
   - **Amount** (e.g., 500.00)
   - **Category** (e.g., Food, Salary, Rent)
   - **Date** (defaults to today)
   - **Note** (optional)
4. Click **"Add Income"** or **"Add Expense"**

### Searching Transactions

1. Go to **Insights → All Entries**
2. Use the **search bar** to filter by category or note
3. Search works in real-time as you type
4. Combine with Income/Expense filters for precise results

### Viewing Analytics

1. Go to **Insights → Analytics**
2. Filter by time period (**Week** / **Month** / **3 Months**)
3. Toggle between **Income** and **Expense** analytics
4. View:
   - 🥧 **Pie Chart** - Category breakdown with percentages
   - 📊 **Bar Chart** - All categories sorted by amount
   - 📈 **Trend Chart** - Daily income vs expense trends

### Generating Custom Statements

1. Go to **Insights → Custom Statement**
2. Select **Start Date** and **End Date**
3. Click **"Generate"** to view transactions
4. Click **"Export PDF"** to download a professional report

### Managing Your Data

**Backup Options:**

- **Simple Backup**: Go to **More → Backup Data** (JSON format, human-readable)
- **Encrypted Backup**: Go to **More → Encrypted Backup** (AES-256 encrypted, password-protected)

**Restore Data:**

1. Go to **More → Restore Data**
2. Select your backup file (`.json` or `.encrypted`)
3. Enter password (if encrypted)
4. Confirm restoration

**Export Full Report:**

- Go to **More → Export PDF** for a complete financial report

### Edit or Delete Transactions

1. **Long press** (or click and hold) any transaction
2. A context menu will appear with options:
   - ✏️ **Edit** - Modify the transaction
   - 🗑️ **Delete** - Remove the transaction
   - **Cancel** - Close the menu

## 🎨 PDF Report Features

SpendTrail generates professional PDF reports with:

📊 **Color-coded Summary Cards**
- Green card for total income
- Red card for total expenses
- Blue card for balance

📋 **Clean Table Layout**
- Column headers (Date, Category, Note, Amount)
- Alternating row backgrounds for readability
- Green text for income, red for expense
- Currency symbols displayed as text codes (e.g., Rs., USD, EUR)

📄 **Professional Formatting**
- Automatic pagination with page numbers
- Headers repeated on each page
- Branded header with app logo
- International date format support

*Note: PDF exports display currency symbols as readable text codes (Rs., USD, EUR, etc.) due to PDF font limitations.*

## 🔒 Privacy & Security

### Data Storage

✅ **100% Local Storage** - All data stored in your browser's localStorage  
✅ **No Cloud Sync** - Data never leaves your device  
✅ **No Tracking** - Zero analytics, cookies, or trackers  
✅ **No Registration** - No accounts, emails, or personal info required  

### Encryption

🔐 **AES-256 Encryption** - Military-grade encryption for backups  
🔑 **Your Password Only** - Only you know the password  
⚠️ **Password Recovery** - Not possible (by design for security)  

### Data Control

📥 **Export Anytime** - Download your data in JSON or PDF  
🗑️ **Delete Anytime** - Permanently delete all data  
💾 **Backup Control** - Create backups whenever you want  

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/mananmadani/SpendTrail/issues).

### How to Contribute

1. Fork the project
2. Create your feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

### Development Guidelines

- Write clean, readable code
- Follow existing code style
- Test on multiple browsers
- Update documentation if needed

## 📝 Changelog

### v3.8 (Current - February 2026)

✨ **New Features**
- 💱 **Multi-Currency Support** - Choose from 30 currency symbols worldwide
- 🔍 **Search in All Entries** - Real-time search by category or note
- 💱 **Currency Settings** - Easily switch between different currency symbols

📚 **Improvements**
- Added GitHub support link for issue reporting
- Better PDF readability with currency text codes

### v3.7 (January 2026)

🐛 **Bug Fixes**
- Fixed minor bugs affecting app stability
- Improved overall app performance
- Enhanced error handling and validation

✨ **Improvements**
- Better stability and reliability
- Optimized resource usage
- Minor UI refinements

### v3.6 (December 2025)

🐛 **Bug Fixes**
- Fixed transaction sorting to prioritize date over timestamp
- Old entries now appear in correct chronological position
- Export PDF now uses proper date-based sorting

✨ **Improvements**
- Professional PDF exports with colored tables and summary cards
- Custom statement PDFs with period-specific summaries
- Better PDF layout with headers, footers, and page numbers
- Improved date formatting in PDFs (Indian format)

### v3.5 (November 2025)

- Added income analytics with charts
- Fixed entry sorting in custom statements
- Added empty state displays in ledger
- Enhanced privacy policy

### v3.4 (October 2025)

- Initial public release
- Basic income/expense tracking
- Simple analytics
- PDF export functionality

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

**What does this mean?**

✅ Free to use for personal and commercial projects  
✅ Free to modify and distribute  
✅ No warranty provided  
❌ Author not liable for any damages  

## 👨‍💻 Author

**Manan Madani**

- 🐙 GitHub: [@mananmadani](https://github.com/mananmadani)
- 🌐 Project: [SpendTrail](https://github.com/mananmadani/SpendTrail)
- 📧 Support: [Open an issue](https://github.com/mananmadani/SpendTrail/issues)

## ⭐ Show Your Support

If SpendTrail helped you manage your finances better, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs or issues
- 💡 Suggesting new features
- 🔀 Contributing code improvements
- 📢 Sharing with friends and family

## 📬 Support & Feedback

- 🐛 **Bug Reports**: [Open an issue](https://github.com/mananmadani/SpendTrail/issues)
- 💡 **Feature Requests**: [Open an issue](https://github.com/mananmadani/SpendTrail/issues)
- ❓ **Questions**: [Discussions](https://github.com/mananmadani/SpendTrail/discussions)

---

**Made with ❤️ for better financial tracking**
