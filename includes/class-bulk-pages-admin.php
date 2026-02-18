<?php
/**
 * WBPG_Admin Class
 * Handles Admin Menu and UI rendering.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WBPG_Admin {
	/** @var string Plugin version */
	private $version = WBPG_VERSION;



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
		wp_enqueue_style( 'wbpg-font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css', array(), '6.5.1' );
		
		// Enqueue Tippy.js and Popper.js for robust tooltips
		wp_enqueue_script( 'wbpg-popper', 'https://unpkg.com/@popperjs/core@2', array(), '2.11.8', true );
		wp_enqueue_script( 'wbpg-tippy', 'https://unpkg.com/tippy.js@6', array( 'wbpg-popper' ), '6.3.7', true );

		wp_enqueue_style( 'wbpg-admin-style', WBPG_PLUGIN_URL . 'assets/css/admin.css', array(), WBPG_VERSION );
		wp_enqueue_script( 'wbpg-admin-script', WBPG_PLUGIN_URL . 'assets/js/admin.js', array( 'jquery', 'wbpg-tippy' ), WBPG_VERSION, true );

		// Localize Script for API and i18n
		wp_localize_script( 'wbpg-admin-script', 'wbpgData', array(
			'apiUrl' => esc_url_raw( rest_url( 'wp-bulk-pages/v1' ) ),
			'nonce'  => wp_create_nonce( 'wp_rest' ),
			'i18n'   => array(
				'loading'         => __( 'Loading...', 'wp-bulk-pages-generator' ),
				'generate'        => __( 'Generate List', 'wp-bulk-pages-generator' ),
				'none'            => __( 'None (Top Level)', 'wp-bulk-pages-generator' ),
				'select_cat'      => __( 'Select Category', 'wp-bulk-pages-generator' ),
				'configure'       => __( '2. Configure %s Details', 'wp-bulk-pages-generator' ),
				'bulkDelete'      => __( 'Bulk Delete', 'wp-bulk-pages-generator' ),
				'confirmDelete'   => __( 'Are you sure you want to delete the selected rows?', 'wp-bulk-pages-generator' ),
				'darkMode'        => __( 'Dark Mode', 'wp-bulk-pages-generator' ),
				'lightMode'       => __( 'Light Mode', 'wp-bulk-pages-generator' ),
				'create_btn'      => __( 'Create All %ss', 'wp-bulk-pages-generator' ),
				'confirm_remove'  => __( 'Remove %d rows?', 'wp-bulk-pages-generator' ),
				'confirm_create'  => __( 'Create %d %s(s)?', 'wp-bulk-pages-generator' ),
				'confirm_filled'  => __( '%d out of %d is filled, can I create?', 'wp-bulk-pages-generator' ),
				'creating'        => __( 'Creating...', 'wp-bulk-pages-generator' ),
				'view'            => __( 'View %s', 'wp-bulk-pages-generator' ),
				'delete_selected' => __( 'Delete Selected (%d)', 'wp-bulk-pages-generator' ),
				'success_msg'     => __( 'Successfully created %d out of %d %s(s).', 'wp-bulk-pages-generator' ),
				'error_failed'    => __( ' (%d failed or skipped)', 'wp-bulk-pages-generator' ),
				'error_no_title'  => __( 'Title is missing or empty', 'wp-bulk-pages-generator' ),
				'success_created' => __( 'Created successfully', 'wp-bulk-pages-generator' ),
				'unknown_error'   => __( 'Unknown error', 'wp-bulk-pages-generator' ),
				'network_error'   => __( 'Network Error', 'wp-bulk-pages-generator' ),
				'tip_type'        => __( 'Select the content type you want to create.', 'wp-bulk-pages-generator' ),
				'tip_count'       => __( 'Number of rows to add to the table (Max 100).', 'wp-bulk-pages-generator' ),
				'tip_title'       => __( 'The main identifier for this item.', 'wp-bulk-pages-generator' ),
				'tip_slug'        => __( 'URL-friendly version of the title.', 'wp-bulk-pages-generator' ),
				'tip_content'     => __( 'Rich block markup or HTML content.', 'wp-bulk-pages-generator' ),
				'placeholder_title' => __( 'Enter %s title...', 'wp-bulk-pages-generator' ),
				'placeholder_slug'  => __( 'slug', 'wp-bulk-pages-generator' ),
				'placeholder_content' => __( 'Block content or HTML...', 'wp-bulk-pages-generator' ),
				'skipped'           => __( 'Skipped (No title)', 'wp-bulk-pages-generator' ),
				'confirm_type_change' => __( 'Switching the post type will clear your current list. Continue?', 'wp-bulk-pages-generator' ),
				'confirm_leave'       => __( 'Bulk creation is in progress. Are you sure you want to leave?', 'wp-bulk-pages-generator' ),
				'toggle_theme'       => __( 'Toggle Light/Dark Mode', 'wp-bulk-pages-generator' ),
			)
		) );
	}

	/**
	 * Get Current Theme Mode from Cookie (for no-flash initial load).
	 */
	private function get_theme_mode() {
		return isset( $_COOKIE['wbpg_theme'] ) ? sanitize_key( $_COOKIE['wbpg_theme'] ) : 'light';
	}

	/**
	 * Render Admin Page.
	 */
	public function render_admin_page() {
		$theme = $this->get_theme_mode();
		?>
		<div class="wrap wbpg-admin-wrap" data-theme="<?php echo esc_attr( $theme ); ?>" role="main" aria-labelledby="wbpg-main-title">
			<header class="wbpg-header">
				<div class="wbpg-header-main">
					<h1 id="wbpg-main-title"><?php _e( 'WP Bulk Pages Generator', 'wp-bulk-pages-generator' ); ?></h1>
					<p><?php _e( 'Create multiple WordPress pages efficiently with a modern interface.', 'wp-bulk-pages-generator' ); ?></p>
				</div>
				<div class="wbpg-header-actions">
					<button id="wbpg-theme-toggle" class="button button-secondary" aria-label="<?php esc_attr_e( 'Toggle Light/Dark Mode', 'wp-bulk-pages-generator' ); ?>">
						<?php if ( 'dark' === $theme ) : ?>
							<i class="fa-regular fa-sun"></i>
							<span class="wbpg-toggle-text"><?php _e( 'Light Mode', 'wp-bulk-pages-generator' ); ?></span>
						<?php else : ?>
							<i class="fa-regular fa-moon"></i>
							<span class="wbpg-toggle-text"><?php _e( 'Dark Mode', 'wp-bulk-pages-generator' ); ?></span>
						<?php endif; ?>
					</button>
				</div>
			</header>

			<div class="wbpg-layout">
				<main class="wbpg-main-content">
					<!-- Setup Card -->
					<div class="wbpg-card wbpg-setup">
						<div class="wbpg-card-header">
							<h2>1. Build Your List</h2>
						</div>
						<div class="wbpg-input-group">
							<label for="wbpg-post-type" id="post-type-label">
								<?php _e( 'Which Post Type?', 'wp-bulk-pages-generator' ); ?>
								<span class="wbpg-tooltip-icon" id="tip-type"><i class="fa-solid fa-circle-info"></i></span>
							</label>
							<select id="wbpg-post-type" aria-labelledby="post-type-label">
								<option value="page"><?php _e( 'Page', 'wp-bulk-pages-generator' ); ?></option>
								<option value="post"><?php _e( 'Post', 'wp-bulk-pages-generator' ); ?></option>
							</select>
						</div>

						<div class="wbpg-input-group">
							<label for="wbpg-count" id="count-label">
								<?php _e( 'How many rows should we add?', 'wp-bulk-pages-generator' ); ?>
								<span class="wbpg-tooltip-icon" id="tip-count"><i class="fa-solid fa-circle-info"></i></span>
							</label>
							<div class="wbpg-input-row">
								<input type="number" id="wbpg-count" min="1" max="100" value="5" aria-labelledby="count-label">
								<button id="wbpg-generate-btn" class="button button-primary" aria-label="<?php esc_attr_e( 'Generate new rows', 'wp-bulk-pages-generator' ); ?>"><?php _e( 'Generate List', 'wp-bulk-pages-generator' ); ?></button>
							</div>
						</div>
					</div>

					<!-- Table Card -->
					<div id="wbpg-list-container" class="wbpg-card wbpg-list" style="display:none;">
						<div class="wbpg-list-header">
							<div class="wbpg-list-title">
								<h2 id="wbpg-configure-title"><?php _e( '2. Configure Page Details', 'wp-bulk-pages-generator' ); ?></h2>
							</div>
							<div class="wbpg-actions">
								<button id="wbpg-delete-selected-btn" class="button button-link-delete" style="display:none;"><?php _e( 'Delete Selected', 'wp-bulk-pages-generator' ); ?></button>
								<button id="wbpg-create-all-btn" class="button button-primary"><?php _e( 'Create All Pages', 'wp-bulk-pages-generator' ); ?></button>
							</div>
						</div>

						<div class="wbpg-table-responsive">
							<table class="wbpg-table" id="wbpg-pages-table">
								<thead>
									<tr>
										<th class="col-check"><input type="checkbox" id="wbpg-select-all" aria-label="<?php esc_attr_e( 'Select all rows', 'wp-bulk-pages-generator' ); ?>"></th>
										<th class="col-status"><?php _e( 'Status', 'wp-bulk-pages-generator' ); ?></th>
										<th><?php _e( 'Title', 'wp-bulk-pages-generator' ); ?> <span class="wbpg-tooltip-icon" id="tip-title"><i class="fa-solid fa-circle-info"></i></span></th>
										<th><?php _e( 'Slug', 'wp-bulk-pages-generator' ); ?> <span class="wbpg-tooltip-icon" id="tip-slug"><i class="fa-solid fa-circle-info"></i></span></th>
										<th class="col-parent" id="wbpg-parent-column-head"><?php _e( 'Parent', 'wp-bulk-pages-generator' ); ?></th>
										<th><?php _e( 'Content', 'wp-bulk-pages-generator' ); ?> <span class="wbpg-tooltip-icon" id="tip-content"><i class="fa-solid fa-circle-info"></i></span></th>
										<th class="col-action"><?php _e( 'Action', 'wp-bulk-pages-generator' ); ?></th>
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
						<h2><?php _e( 'Progress Summary', 'wp-bulk-pages-generator' ); ?></h2>
						<div id="wbpg-progress-bar-container" role="progressbar" aria-valuemin="0" aria-valuemax="100">
							<div id="wbpg-progress-bar"></div>
						</div>
						<p id="wbpg-progress-text" aria-live="polite"><?php _e( 'Creating pages: 0/0', 'wp-bulk-pages-generator' ); ?></p>
					</div>

				</main>

				<aside class="wbpg-sidebar" aria-label="<?php esc_attr_e( 'Help and Documentation', 'wp-bulk-pages-generator' ); ?>">
					<!-- User Guide Section -->
					<div class="wbpg-card wbpg-guide">
						<h2><?php _e( 'User Guide & Examples', 'wp-bulk-pages-generator' ); ?></h2>
						<div class="wbpg-guide-content">
							<div class="wbpg-guide-item">
								<h3><?php _e( 'Basic Usage', 'wp-bulk-pages-generator' ); ?></h3>
								<p><?php echo sprintf( __( 'Enter the number of pages, fill in titles, and click %s. If you leave the slug empty, WordPress will generate it from the title.', 'wp-bulk-pages-generator' ), '<strong>' . __( 'Create All', 'wp-bulk-pages-generator' ) . '</strong>' ); ?></p>
							</div>
							<div class="wbpg-guide-item">
								<h3><?php _e( 'Block Content', 'wp-bulk-pages-generator' ); ?></h3>
								<p><?php _e( 'Paste the markup below for a heading and paragraph:', 'wp-bulk-pages-generator' ); ?></p>
								<code>&lt;!-- wp:heading --&gt;&lt;h2&gt;Hello&lt;/h2&gt;&lt;!-- /wp:heading --&gt;<br>&lt;!-- wp:paragraph --&gt;&lt;p&gt;Bulk page.&lt;/p&gt;&lt;!-- /wp:paragraph --&gt;</code>
							</div>
							<div class="wbpg-guide-item">
								<h3><?php _e( 'Parent Pages', 'wp-bulk-pages-generator' ); ?></h3>
								<p><?php echo sprintf( __( 'Select a %s for sub-pages. This is hidden for non-hierarchical types.', 'wp-bulk-pages-generator' ), '<strong>' . __( 'Parent', 'wp-bulk-pages-generator' ) . '</strong>' ); ?></p>
							</div>
							<div class="wbpg-guide-item">
								<h3><?php _e( 'Bulk Actions', 'wp-bulk-pages-generator' ); ?></h3>
								<p><?php echo sprintf( __( 'Select rows to delete them at once using the %s button.', 'wp-bulk-pages-generator' ), '<strong>' . __( 'Delete Selected', 'wp-bulk-pages-generator' ) . '</strong>' ); ?></p>
							</div>
						</div>
					</div>
				</aside>
			</div>
			<div class="wbpg-footer-clear"></div>
		</div>
		<?php
	}
}
