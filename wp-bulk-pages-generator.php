<?php
/**
 * Plugin Name: WP Bulk Pages Generator
 * Plugin URI:  https://github.com/boopathirbk/wp-bulk-pages-generator
 * Description: A modern, user-friendly plugin to bulk create pages with titles, slugs, parent pages, and block content.
 * Version:     1.0.0
 * Author:      Boopathi R
 * Author URI:  https://github.com/boopathirbk
 * Text Domain: wp-bulk-pages-generator
 * Requires at least: 6.0
 * Tested up to:      6.7
 * Requires PHP:      7.4
 * License:     Apache 2.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define Plugin Constants
define( 'WBPG_VERSION', '1.0.0' );
define( 'WBPG_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WBPG_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Include necessary files
require_once WBPG_PLUGIN_DIR . 'includes/class-bulk-pages-api.php';
require_once WBPG_PLUGIN_DIR . 'includes/class-bulk-pages-admin.php';

// Initialize the plugin
function wbpg_init() {
	load_plugin_textdomain( 'wp-bulk-pages-generator', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
	new WBPG_API();
	new WBPG_Admin();
}
add_action( 'plugins_loaded', 'wbpg_init' );
