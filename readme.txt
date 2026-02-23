=== WP Bulk Pages Generator ===
Contributors: boopathirbk
Requires at least: 6.0
Tested up to: 6.9
Requires PHP: 7.4
Stable tag: 1.0.3
License: Apache 2.0
License URI: https://www.apache.org/licenses/LICENSE-2.0

A modern, user-friendly plugin to bulk create pages, posts, and CPTs with titles, slugs, parent hierarchal structures, categories, and Gutenberg block content sequentially to bypass server timeouts.

== Description ==

**The high-performance bulk content engine for WordPress.**

WP Bulk Pages Generator allows you to create hundreds of pages or posts seamlessly. Built with an Async Sequential Engine, it bypasses shared hosting timeouts by processing items one by one natively through the WordPress REST API.

= Features =

* **Async Sequential Engine:** Creates items one-by-one, averting PHP max_execution_time limits and database locks. 
* **Deep Taxonomy Support:** Seamlessly assign parent pages (for hierarchical CPTs) or categories (for flat CPTs).
* **Geist Design System:** Designed meticulously with principles of optical alignment and accessibility. Fully supports Dark Mode.
* **WCAG 2.2 Level AA:** Keyboard navigable interfaces, large touch targets, clear focus indications, and reduced-motion support.
* **Gutenberg Ready:** Add raw WordPress block comments and content directly to the bulk generator.
* **Security Focused:** Uses secure wp_rest nonces, sanitize_text_field, wp_kses_post, and strict capability checks.

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/wp-bulk-pages-generator` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress.
3. Access the plugin via the newly added "Bulk Pages" menu item.

== Frequently Asked Questions ==

= Does this work on Shared Hosting? =
Yes! The plugin uses an Async Sequential Engine that makes individual REST API calls for each row. You will not hit server memory limits or timeouts.

= Can I use it for Custom Post Types? =
Yes. The plugin queries your WordPress instance to automatically identify and support all publicly queryable post types (e.g., custom portfolios, property listings, or directories).

== Screenshots ==

1. Generate Pages — Select your post type and generate a grid of rows for bulk content entry.
2. Parent & Category Search — Intelligent searchable dropdowns for parent pages and taxonomy terms.
3. Progress Summary — Real-time progress bar with success/error tracking during bulk creation.
4. Custom Post Types — Full support for any registered public Custom Post Type.
5. Dark Mode — Premium Geist-inspired dark theme with system preference detection.
6. User Guide — Built-in documentation with workflow examples and code patterns.
7. About Page — Plugin dashboard with capabilities overview and author information.

== Changelog ==

= 1.0.3 =
* Updated compatibility to WordPress 6.9.1 and PHP 8.5.
* Added visual Screenshots gallery to the About page.
* Fixed table layout for Custom Post Types causing excessive row spacing.
* Updated marketing site and documentation with latest screenshots.

= 1.0.2 =
* Added native GitHub auto-updater integration (one-click updates from WP dashboard).
* Redesigned the About page with an enhanced Geist UI plugin dashboard.
* Resolved minor accessibility and typo audit findings.

= 1.0.1 =
* Added search functionality for parent and categories in bulk pages generator.

= 1.0.0 =
* First major public release following WP Bulk Pages Generator audit. Features Geist UI and auto-updates from GitHub releases.