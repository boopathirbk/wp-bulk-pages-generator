# WP Bulk Pages Generator 🚀
### The Ultimate 2026-Ready Bulk Content Engine for WordPress

[![WordPress Version](https://img.shields.io/badge/WordPress-6.9.1-blue.svg?style=flat-square&logo=wordpress)](https://wordpress.org)
[![PHP Version](https://img.shields.io/badge/PHP-7.4%2B-777bb4.svg?style=flat-square&logo=php)](https://php.net)
[![UI Design](https://img.shields.io/badge/UI-Geist--Minimal-black.svg?style=flat-square)](https://vercel.com/design)
[![Accessibility](https://img.shields.io/badge/WCAG-2.2%20Level%20AA-success.svg?style=flat-square)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![A11y Notifications](https://img.shields.io/badge/A11y-ARIA%20Live-orange.svg?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)

**WP Bulk Pages Generator** is an enterprise-grade WordPress plugin engineered for 2026 performance, security, and accessibility standards. Built on the **Geist Design System** and fully optimized for **WordPress 6.9.1**, it provides a frictionless, high-speed interface for bulk-deploying Pages, Posts, and Custom Post Types (CPT) with precision taxonomy integration.

---

## 🎨 2026-Ready Feature Set

- **💎 Modern Geist Architecture**: A high-density, minimalist interface designed for rapid data entry and zero cognitive load.
- **📱 Mobile-First Card View**: Intelligent responsive engine that transforms data tables into clean, scannable cards on mobile devices.
- **🌗 Intelligent Dark Mode**: Automated theme persistence with high-contrast optimization for low-light environments.
- **🛡️ State Armor (Operation Lock)**: Prevents accidental navigation or refresh during bulk creation, protecting your content batches from interruption.
- **🧱 Block-Native Engine**: Full validation for **Gutenberg Block Markup**, ensuring your bulk content renders perfectly in the modern editor.
- **🔄 Dynamic Context Branding**: Real-time dashboard rebranding that adapts titles, instructions, and tooltips based on the selected post type.
- **🍱 Advanced Taxonomy Layer**: Deep integration with hierarchical (Categories) and flat (Tags) taxonomies across all public post types.
- **📐 40px Component Standard**: All buttons and inputs follow the latest **WP 6.9 Design System** height standards for optimal reach and clickability.
- **♿ WCAG 2.2 Level AA Compliance**: High-visibility focus rings, ARIA landmarks, keyboard support (Enter/Space), and automated focus management.
- **📢 Real-Time A11y Announcements**: Integrated `aria-live` regions that announce creation progress and success/error status to screen reader users.
- **⚡ Performance First**: Zero layout thrash via `DocumentFragment` batching and optimized `async/await` sequential processing.
- **🎯 Precise Creation Logic**: Intelligent row-filtering that skips empty entries while providing a descriptive "X out of Y filled" confirmation prompt.
- **🔄 Instant Reset (Start Over)**: A dedicated recovery flow that resets the entire workspace without page reloads, with automatic focus management.

---

## 🛠️ Deployment Workflow

1. **Build Your List**: Select your target content type. The system identifies hierarchical structures and available taxonomies automatically.
2. **Configure Details**: Fill in titles, slugs, and content. The UI dynamically focuses your cursor and validates titles in real-time.
3. **Smart Execution**: Click "Create All". The system calculates how many rows are filled, asks for confirmation, and skip any empty rows while marking them as "Skipped".
4. **Instant Feedback**: The Progress Summary provides a real-time count of successes, failures, and skipped items via a modern progress bar and live text announcements.

---

## 🏗️ Technical Architecture

### Backend: Stable & Future-Proof
- **Universal Compatibility**: Hardened for **PHP 7.4 through 8.2+**. 
- **Modern Standards**: Implements 2026-ready patterns while maintaining absolute stability on legacy environments.
- **Security First**: Nonce-locked REST API endpoints with managed capability drifts and strict sanitization.
- **Resilient API**: Structured error handling for taxonomy and parent-page retrieval with graceful failovers.

### Frontend: Modern Asset Stack
- **Geist UI Layer**: Vanilla CSS optimization (zero bloat) with CSS Containment for lag-free interactions.
- **Tippy.js & Popper.js**: Industry-standard tooltip positioning for unclipped interactive hints.
- **Speed**: Sequential `async/await` loop ensures no server-side bottlenecks or database lockouts.
- **A11y Core**: Accessible status icons, ARIA-live announcements, and high-visibility native focus rings.

---

## 📥 Quick Installation

1. Upload the `wp-bulk-pages-generator` folder to your `/wp-content/plugins/` directory.
2. Activate the plugin in the **Plugins** menu.
3. Navigate to **"Bulk Pages"** in your admin sidebar to begin bulk deployment.

---

## 👨‍💻 Developer Support
The plugin exposes several endpoints under the `wp-bulk-pages/v1` namespace for external automation or integration workflows.

*Engineered for speed. Hardened for the future.*
