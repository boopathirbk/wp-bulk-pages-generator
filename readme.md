# WP Bulk Pages Generator 🚀
### The Ultimate 2026-Ready Bulk Content Engine for WordPress

[![WordPress Version](https://img.shields.io/badge/WordPress-6.0%2B-blue.svg?style=flat-square&logo=wordpress)](https://wordpress.org)
[![PHP Version](https://img.shields.io/badge/PHP-7.4%2B-777bb4.svg?style=flat-square&logo=php)](https://php.net)
[![UI Design](https://img.shields.io/badge/UI-Geist--Minimal-black.svg?style=flat-square)](https://vercel.com/design)
[![Accessibility](https://img.shields.io/badge/WCAG-3.0%20Ready-success.svg?style=flat-square)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![Tooltips](https://img.shields.io/badge/UI-Tippy.js--Popper-blue.svg?style=flat-square)](https://atomiks.github.io/tippyjs/)

**WP Bulk Pages Generator** is an enterprise-grade WordPress plugin engineered for 2026 performance, security, and accessibility standards. Built on the **Geist Design System**, it provides a frictionless, high-speed interface for bulk-deploying Pages, Posts, and Custom Post Types (CPT) with precision taxonomy integration.

---

## 🎨 2026-Ready Feature Set

- **💎 Modern Geist Architecture**: A high-density, minimalist interface designed for rapid data entry and zero cognitive load.
- **🌗 Intelligent Dark Mode**: Automated theme persistence with high-contrast optimization for low-light environments.
- **🛡️ State Armor (Operation Lock)**: Prevents accidental navigation or refresh during bulk creation, protecting your content batches from interruption.
- **🧱 Block-Native Engine**: Full validation for **Gutenberg Block Markup**, ensuring your bulk content renders perfectly in the modern editor.
- **🔄 Dynamic Context Branding**: Real-time dashboard rebranding that adapts titles, instructions, and tooltips based on the selected post type.
- **🍱 Advanced Taxonomy Layer**: Deep integration with hierarchical (Categories) and flat (Tags) taxonomies across all public post types.
- **💬 Robust Popper Tooltips**: Integrated **Tippy.js** for unclipped, context-aware interactive help that escapes parent container bounds.
- **📐 Pixel-Perfect Table Engine**: `table-layout: fixed` architecture ensures 100% alignment and full column visibility across all viewports.
- **♿ WCAG 3.0 Preparedness**: Enhanced focus indicators, semantic landmarking, and automated focus management for high-speed accessibility.
- **⚡ Performance First**: Zero layout thrash via `DocumentFragment` batching and optimized `async/await` sequential processing.

---

## 🛠️ Deployment Workflow

1. **Build Your List**: Select your target content type. The system identifies hierarchical structures and available taxonomies automatically.
2. **Configure Details**: Fill in titles, slugs, and content. The UI dynamically focuses your cursor and validates titles in real-time.
3. **Smart Execution**: Click "Create All" to trigger the sequential generation engine with live visual progress tracking.

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
- **A11y Core**: Accessible status icons, ARIA-live announcements, and `:focus-visible` high-contrast support.

---

## 📥 Quick Installation

1. Upload the `wp-bulk-pages-generator` folder to your `/wp-content/plugins/` directory.
2. Activate the plugin in the **Plugins** menu.
3. Navigate to **"Bulk Pages"** in your admin sidebar to begin bulk deployment.

---

## 👨‍💻 Developer Support
The plugin exposes several endpoints under the `wp-bulk-pages/v1` namespace for external automation or integration workflows.

*Engineered for speed. Hardened for the future.*
