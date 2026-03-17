# 📝 Changelog

All notable changes to SpendTrail are documented here.

---

## v4.0.6 — March 2026

🎨 **UI Fixes**
- **Tap Highlight Removed** — on Android and iOS, tapping any button or interactive element showed a blue highlight flash (browser default tap highlight). This has been removed across the entire app for a cleaner, more native app-like feel

---

## v4.0.5 — March 2026

✨ **New Features**
- **System Navigation Support** — the Android back button, Android swipe-back gesture, iOS swipe-back gesture, and desktop browser back button now all work correctly within the app. Previously pressing back would exit the app or go to a previous website. Now it closes the open overlay first, then navigates back to the Home tab if on another tab, and only exits the app when already on Home with no overlay open

🐛 **Bug Fixes**
- **Edit Entry Back Navigation Fix** — pressing back while editing a transaction from All Entries would incorrectly close the entire overlay, taking the user out of All Entries. Similarly, editing from a Category Details screen would close the entire Ledger view. Back now correctly returns to All Entries or the specific Category Details screen depending on where the edit was opened from. 

---

## v4.0.4 — March 2026

🎨 **UI Improvements**
- **Trend Chart Y-Axis Decimals Removed** — the Y-axis labels on the trend chart were showing unnecessary decimal places (e.g. `₹10,000.00`, `₹0.00`). Chart axis labels now display as whole numbers (e.g. `₹10,000`, `₹0`), giving the chart more horizontal space and making the axis easier to read at a glance

---

## v4.0.3 — March 2026

🎨 **UI Fixes**
- **Overlay Title Overflow** — long category or profile names in the overlay header no longer break the layout. The title now truncates cleanly with `...` if it exceeds the available space, and the Back button is always fully visible regardless of title length
- **iOS Scroll Bleed** — on iPhone and iPad, scrolling to the bottom of an overlay (such as All Entries, Analytics, or Privacy Policy) would bleed through and scroll the background page. The overlay now correctly contains its own scroll and the background page stays in place

---

## v4.0.2 — March 2026

🐛 **Bug Fixes**
- **Date Label Bug Fix** — "Today" and "Yesterday" labels were incorrect for users in timezones behind UTC (e.g. USA, Europe). Dates stored as `"2025-03-15"` were being parsed as UTC midnight, causing them to appear as the previous day on affected devices. Date strings are now parsed as local time, fixing the labels for all timezones worldwide
- **Analytics Chart UTC Bug Fix** — charts (pie, bar, and trend) were using UTC time to calculate the cutoff date for the selected period (Week / Month / 3 Months). This caused today's transactions to be excluded from analytics for several hours after midnight in timezones ahead of UTC. All chart date calculations now use local device time
- **Trend Chart Date Keys Fix** — the daily trend chart was generating date keys using UTC, meaning the bars could be misaligned with actual local dates. Date keys are now generated using local time, ensuring each bar correctly represents the local calendar day

---

## v4.0.1 — March 2026

🔒 **Security**
- **XSS Vulnerability Fix** — category names and notes are now properly escaped before being injected into the UI. Previously, malicious input like `<script>` tags in category or note fields could break the layout or execute unintended code. All user-entered values across All Entries, Ledger, Category Details, Custom Statement, Analytics, Edit form, and Recent Transactions are now escaped using `escapeHtml()` before rendering
- Datalist category suggestions and currency select options are also now escaped

🔧 **Improvements**
- Backup files now correctly report `version: 4.0.1`

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
