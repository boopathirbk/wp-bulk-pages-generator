<?php
/**
 * WBPG_Admin Class
 * Handles Admin Menu and UI rendering.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WBPG_Admin {

	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_menu_page' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
	}

	/**
	 * Add Admin Menu Page.
	 */
	public function add_menu_page() {
		add_menu_page(
			'Bulk Pages Generator',
			'Bulk Pages',
			'manage_options',
			'wp-bulk-pages-generator',
			array( $this, 'render_admin_page' ),
			'dashicons-plus-alt',
			25
		);
	}

	/**
	 * Enqueue Admin Assets.
	 */
	public function enqueue_assets( $hook ) {
		if ( false === strpos( $hook, 'wp-bulk-pages-generator' ) ) {
			return;
		}

		// Enqueue Geist Font (System stacks favored, adding Inter as fallback)
		wp_enqueue_style( 'wbpg-admin-style', WBPG_PLUGIN_URL . 'assets/css/admin.css', array(), WBPG_VERSION );
		wp_enqueue_script( 'wbpg-admin-script', WBPG_PLUGIN_URL . 'assets/js/admin.js', array( 'jquery' ), WBPG_VERSION, true );

		// Localize Script for API info
		wp_localize_script( 'wbpg-admin-script', 'wbpgData', array(
			'apiUrl' => esc_url_raw( rest_url( 'wp-bulk-pages/v1' ) ),
			'nonce'  => wp_create_nonce( 'wp_rest' ),
		) );
	}

	/**
	 * Render Admin Page.
	 */
	public function render_admin_page() {
		?>
		<div class="wrap wbpg-admin-wrap" data-theme="light">
			<div class="wbpg-header">
				<div class="wbpg-header-main">
					<h1>WP Bulk Pages Generator</h1>
					<p>Create multiple WordPress pages efficiently with a modern interface.</p>
				</div>
				<div class="wbpg-header-actions">
					<button id="wbpg-theme-toggle" class="button button-secondary" aria-label="Toggle Dark Mode">
						<span class="dashicons dashicons-lightbulb"></span>
					</button>
				</div>
			</div>

			<div class="wbpg-layout">
				<div class="wbpg-main-content">
					<!-- Setup Card -->
					<div class="wbpg-card wbpg-setup">
						<div class="wbpg-card-header">
							<h2>1. Build Your List</h2>
						</div>
						<div class="wbpg-input-group">
							<label for="wbpg-post-type" id="post-type-label">
								Which Post Type?
								<span class="wbpg-tooltip-icon" aria-label="Select whether you want to create Posts, Pages, or a Custom Post Type.">info</span>
							</label>
							<select id="wbpg-post-type" aria-labelledby="post-type-label">
								<option value="page">Page</option>
								<option value="post">Post</option>
							</select>
						</div>

						<div class="wbpg-input-group">
							<label for="wbpg-count" id="count-label">
								How many rows should we add?
								<span class="wbpg-tooltip-icon" aria-label="Enter the number of empty rows you want to add to the table below. (Max 100)">info</span>
							</label>
							<div class="wbpg-input-row">
								<input type="number" id="wbpg-count" min="1" max="100" value="5" aria-labelledby="count-label">
								<button id="wbpg-generate-btn" class="button button-primary" aria-label="Generate new rows">Generate List</button>
							</div>
						</div>
					</div>

					<!-- Table Card -->
					<div id="wbpg-list-container" class="wbpg-card wbpg-list" style="display:none;">
						<div class="wbpg-list-header">
							<div class="wbpg-list-title">
								<h2 id="wbpg-configure-title">2. Configure Page Details</h2>
							</div>
							<div class="wbpg-actions">
								<button id="wbpg-delete-selected-btn" class="button button-link-delete" style="display:none;">Delete Selected</button>
								<button id="wbpg-create-all-btn" class="button button-primary">Create All Pages</button>
							</div>
						</div>

						<div class="wbpg-table-responsive">
							<table class="wbpg-table" id="wbpg-pages-table">
								<thead>
									<tr>
										<th class="col-check"><input type="checkbox" id="wbpg-select-all" aria-label="Select all rows"></th>
										<th class="col-status">Status</th>
										<th>Title <span class="wbpg-tooltip-icon" aria-label="The main headline of your page.">info</span></th>
										<th>Slug <span class="wbpg-tooltip-icon" aria-label="The bit that goes in the URL. Auto-generated if left empty.">info</span></th>
										<th class="col-parent" id="wbpg-parent-column-head">Parent</th>
										<th>Content <span class="wbpg-tooltip-icon" aria-label="Add text, HTML, or Gutenberg block markup here.">info</span></th>
										<th class="col-action">Action</th>
									</tr>
								</thead>
								<tbody id="wbpg-rows">
									<!-- Rows will be injected here -->
								</tbody>
							</table>
						</div>
					</div>

					<!-- Status Summary -->
					<div id="wbpg-status-summary" class="wbpg-card wbpg-summary" style="display:none;">
						<h2>Progress Summary</h2>
						<div id="wbpg-progress-bar-container" role="progressbar" aria-valuemin="0" aria-valuemax="100">
							<div id="wbpg-progress-bar"></div>
						</div>
						<p id="wbpg-progress-text" aria-live="polite">Creating pages: 0/0</p>
					</div>
				</div>

				<div class="wbpg-sidebar">
					<!-- User Guide Section -->
					<div class="wbpg-card wbpg-guide">
						<h2>User Guide & Examples</h2>
						<div class="wbpg-guide-content">
							<div class="wbpg-guide-item">
								<h3>Basic Usage</h3>
								<p>Enter the number of pages, fill in titles, and click <strong>Create All</strong>. If you leave the slug empty, WordPress will generate it from the title.</p>
							</div>
							<div class="wbpg-guide-item">
								<h3>Block Content</h3>
								<p>Paste the markup below for a heading and paragraph:</p>
								<code>&lt;!-- wp:heading --&gt;&lt;h2&gt;Hello&lt;/h2&gt;&lt;!-- /wp:heading --&gt;<br>&lt;!-- wp:paragraph --&gt;&lt;p&gt;Bulk page.&lt;/p&gt;&lt;!-- /wp:paragraph --&gt;</code>
							</div>
							<div class="wbpg-guide-item">
								<h3>Parent Pages</h3>
								<p>Select a <strong>Parent</strong> for sub-pages. This is hidden for non-hierarchical types.</p>
							</div>
							<div class="wbpg-guide-item">
								<h3>Bulk Actions</h3>
								<p>Select rows to delete them at once using the <strong>Delete Selected</strong> button.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<?php
	}
}
