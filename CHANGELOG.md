# 📝 Changelog

All notable changes to SpendTrail are documented here.

---

## v4.0 — March 2026

✨ **New Features**
- 📶 **Full Offline Support** — service worker now correctly registered in the app, enabling true offline functionality after first visit. All app files (HTML, CSS, JS, and CDN libraries) are cached on first load and served from the device cache thereafter
- 🔐 **Updated Privacy Policy** — comprehensive rewrite with 16 detailed sections covering offline functionality, data retention, children's privacy, your rights, and more

🔧 **Improvements**
- Service worker registration added to `index.html` — previously the service worker file existed but was never registered, meaning offline mode did not work
- Privacy policy now reflects full PWA offline behaviour and service worker data handling

---

## v3.9 — March 2026

✨ **New Features**
- 👤 **Multi-Profile Support** — create up to 5 fully isolated profiles (Personal, Business, Travel, Family, etc.)
- 🔄 **Profile Switcher** — manage and switch profiles from More → Manage Profiles
- 🏷️ **Profile Header Indicator** — active profile name always visible in the app header
- 📄 **Profile-Aware Exports** — backup filenames and PDF reports include the active profile name

🔧 **Improvements**
- Export PDF moved to Insights tab alongside Analytics, All Entries, Ledger, and Custom Statement
- Profile-scoped Delete All Data — only clears data in the active profile, other profiles untouched
- Automatic migration — existing users' data seamlessly migrated to a default Personal profile on first launch with zero data loss

---

## v3.8 — February 2026

✨ **New Features**
- 💱 **Multi-Currency Support** — choose from 30 currency symbols worldwide
- 🔍 **Search in All Entries** — real-time search by category or note
- **Currency Settings** — easily switch between different currency symbols per profile

🔧 **Improvements**
- Added GitHub support link for issue reporting
- Better PDF readability with currency text codes (Rs., USD, EUR, etc.)

---

## v3.7 — January 2026

🐛 **Bug Fixes**
- Fixed minor bugs affecting app stability
- Improved overall app performance
- Enhanced error handling and input validation

🔧 **Improvements**
- Better stability and reliability across browsers
- Optimised resource usage
- Minor UI refinements

---

## v3.6 — December 2025

🐛 **Bug Fixes**
- Fixed transaction sorting to prioritise date over timestamp
- Old entries now appear in correct chronological position
- Export PDF now uses proper date-based sorting

🔧 **Improvements**
- Professional PDF exports with coloured tables and summary cards
- Custom statement PDFs with period-specific income/expense summaries
- Better PDF layout with headers, footers, and automatic page numbers
- Improved date formatting in PDFs

---

## v3.5 — November 2025

- Added income analytics with charts
- Fixed entry sorting in custom statements
- Added empty state displays in ledger
- Enhanced privacy policy

---

## v3.4 — October 2025

- Initial public release
- Basic income and expense tracking
- Simple analytics
- PDF export functionality
