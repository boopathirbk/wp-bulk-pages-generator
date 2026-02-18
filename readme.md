# WP Bulk Pages Generator 🚀

**WP Bulk Pages Generator** is a professional-grade, high-performance WordPress plugin designed to streamline the creation of multiple pages, posts, or custom post types in seconds. Built with a modern **Geist-inspired** aesthetic and a focus on security and efficiency, it’s the ultimate tool for developers and site owners building large-scale content structures.

---

## ✨ Key Features

- **Multi Post-Type Support**: Effortlessly generate Posts, Pages, or any public Custom Post Type (CPTs) dynamically detected from your site.
- **Hierarchical Content Creation**: Full support for parent-child relationships with a dynamic, context-aware dropdown.
- **Modern "Geist" UI**: A premium, minimalist admin interface that feels like a native part of the future WordPress dashboard.
- **Bulk Actions & Smart Selection**: Select multiple rows, delete in bulk, or use the "Select All" feature for rapid editing.
- **Interactive Tooltips & User Guide**: Built-in contextual awareness for every field, plus a comprehensive guide with block markup examples.
- **Secure & Robust**: 
  - **Sequential Processing**: Prevents server timeouts by creating items one by one.
  - **Strict Sanitization**: Uses `wp_kses_post()` for block markup security and standard WP sanitization for all inputs.
  - **REST API Driven**: Built on the WordPress REST API for maximum performance and compatibility.

## 🚀 Getting Started

### Installation
1. Download the plugin as a `.zip` file.
2. Go to **Plugins > Add New > Upload Plugin** in your WordPress dashboard.
3. Activate the plugin.
4. Locate the **Bulk Pages** menu in your sidebar.

### How to Use
1. **Choose Your Post Type**: Select if you are creating Posts, Pages, or a specific CPT.
2. **Setup Your List**: Enter the number of rows you need and click **Generate List**.
3. **Fill the Data**: Enter titles, slugs (optional), parents, and block content.
4. **Create All**: Click the **Create All Pages** button and watch the real-time progress bar.

---

## 🛠️ Developer Information

- **Requires at least**: WordPress 6.0
- **Tested up to**: WordPress 6.9.1
- **Requires PHP**: 7.4+
- **License**: GPL v2 or later

### Security Highlights
This plugin follows the latest **2026 WordPress Security Standards**:
- Nonce verification on all REST calls.
- `manage_options` capability check on all endpoints.
- Hierarchical detection to prevent illegal parent-child assignments.

---

## 📈 SEO Optimized
Use this plugin to rapidly build out your site's SEO silos and content clusters. By ensuring consistent slugs and hierarchical structures, you can improve your site's crawlability and ranking potential instantly.

---

*Developed with ❤️ for the WordPress Community.*
 - **Slug**: The URL slug (optional, auto-generated from title if empty).
    - **Parent**: Select a parent page (optional).
    - **Content**: Add content (HTML or Block Comments supported).
4. Click **Create All Pages** to start the process.

- WordPress 6.0 or higher
- PHP 7.4 or higher
