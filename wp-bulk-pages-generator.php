<?php
/**
 * Plugin Name: WP Bulk Pages Generator
 * Plugin URI:  https://github.com/boopathirbk/wp-bulk-pages-generator
 * Description: A modern, user-friendly plugin to bulk create pages with titles, slugs, parent pages, and block content.
 * Version:     1.0.3
 * Author:      Boopathi R
 * Author URI:  https://github.com/boopathirbk
 * Text Domain: wp-bulk-pages-generator
 * Requires at least: 6.0
 * Tested up to:      6.9
 * Requires PHP:      7.4
 * License:     Apache 2.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define Plugin Constants
define( 'WBPG_VERSION', '1.0.3' );
define( 'WBPG_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WBPG_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Include necessary files
require_once WBPG_PLUGIN_DIR . 'includes/class-bulk-pages-api.php';
require_once WBPG_PLUGIN_DIR . 'includes/class-bulk-pages-admin.php';

// Initialize GitHub Auto-Updater
require_once WBPG_PLUGIN_DIR . 'vendor/plugin-update-checker/plugin-update-checker.php';
use YahnisElsts\PluginUpdateChecker\v5\PucFactory;

$wbpgUpdateChecker = PucFactory::buildUpdateChecker(
	'https://github.com/boopathirbk/wp-bulk-pages-generator/',
	__FILE__,
	'wp-bulk-pages-generator'
);
// Force update checks to look for tags/releases on the main branch
$wbpgUpdateChecker->setBranch( 'main' );
// Enable checking for compiled .zip assets in the GitHub release
$wbpgUpdateChecker->getVcsApi()->enableReleaseAssets();

// Inject screenshot URLs into the plugin details popup
add_filter( 'puc_request_info_result-wp-bulk-pages-generator', function( $pluginInfo ) {
	if ( ! is_object( $pluginInfo ) ) {
		return $pluginInfo;
	}

	$base_url = 'https://raw.githubusercontent.com/boopathirbk/wp-bulk-pages-generator/main/screenshots/';
	$screenshots = array(
		1 => 'Generate%20Page.png',
		2 => 'Parent%20and%20Category%20Search.png',
		3 => 'Progress%20Summary.png',
		4 => 'Custom%20Post.png',
		5 => 'Dark%20Mode.png',
		6 => 'User%20Guide.png',
		7 => 'About.png',
	);

	if ( ! isset( $pluginInfo->sections['screenshots'] ) ) {
		$pluginInfo->sections['screenshots'] = '';
	}

	$html = '<ol>';
	$descs = array(
		1 => 'Generate Pages — Select your post type and generate a grid of rows for bulk content entry.',
		2 => 'Parent & Category Search — Intelligent searchable dropdowns for parent pages and taxonomy terms.',
		3 => 'Progress Summary — Real-time progress bar with success/error tracking during bulk creation.',
		4 => 'Custom Post Types — Full support for any registered public Custom Post Type.',
		5 => 'Dark Mode — Premium Geist-inspired dark theme with system preference detection.',
		6 => 'User Guide — Built-in documentation with workflow examples and code patterns.',
		7 => 'About Page — Plugin dashboard with capabilities overview and author information.',
	);
	foreach ( $screenshots as $num => $file ) {
		$url  = $base_url . $file;
		$desc = isset( $descs[ $num ] ) ? esc_html( $descs[ $num ] ) : '';
		$html .= '<li><a href="' . esc_url( $url ) . '"><img src="' . esc_url( $url ) . '" alt="' . $desc . '" style="max-width:100%;height:auto;border:1px solid #eee;border-radius:6px;margin:8px 0;" /></a><p>' . $desc . '</p></li>';
	}
	$html .= '</ol>';

	$pluginInfo->sections['screenshots'] = $html;

	return $pluginInfo;
} );

// Initialize the plugin
function wbpg_init() {
	load_plugin_textdomain( 'wp-bulk-pages-generator', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
	new WBPG_API();
	new WBPG_Admin();
}
add_action( 'plugins_loaded', 'wbpg_init' );
