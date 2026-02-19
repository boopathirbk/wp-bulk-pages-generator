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
	 * Add Admin Menu Page and Submenus.
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

		add_submenu_page(
			'wp-bulk-pages-generator',
			__( 'Generator', 'wp-bulk-pages-generator' ),
			__( 'Generator', 'wp-bulk-pages-generator' ),
			'manage_options',
			'wp-bulk-pages-generator',
			array( $this, 'render_admin_page' )
		);

		add_submenu_page(
			'wp-bulk-pages-generator',
			__( 'User Guide & Strategy', 'wp-bulk-pages-generator' ),
			__( 'User Guide', 'wp-bulk-pages-generator' ),
			'manage_options',
			'wp-bulk-pages-docs',
			array( $this, 'render_docs_page' )
		);

		add_submenu_page(
			'wp-bulk-pages-generator',
			__( 'About Author', 'wp-bulk-pages-generator' ),
			__( 'About', 'wp-bulk-pages-generator' ),
			'manage_options',
			'wp-bulk-pages-about',
			array( $this, 'render_about_page' )
		);
	}

	/**
	 * Enqueue Admin Assets.
	 */
	public function enqueue_assets( $hook ) {
		if ( false === strpos( $hook, 'wp-bulk-pages-generator' ) && false === strpos( $hook, 'wp-bulk-pages-docs' ) && false === strpos( $hook, 'wp-bulk-pages-about' ) ) {
			return;
		}

		// Enqueue Font Awesome
		wp_enqueue_style( 'wbpg-font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css', array(), '6.5.1' );
		
		// Enqueue Tippy.js and Popper.js
		wp_enqueue_script( 'wbpg-popper', 'https://unpkg.com/@popperjs/core@2', array(), '2.11.8', true );
		wp_enqueue_script( 'wbpg-tippy', 'https://unpkg.com/tippy.js@6', array( 'wbpg-popper' ), '6.3.7', true );

		wp_enqueue_style( 'wbpg-admin-style', WBPG_PLUGIN_URL . 'assets/css/admin.css', array(), WBPG_VERSION );
		wp_enqueue_script( 'wbpg-admin-script', WBPG_PLUGIN_URL . 'assets/js/admin.js', array( 'jquery', 'wbpg-tippy' ), WBPG_VERSION, true );

		// Localize Script
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
				'error_duplicate_slug' => __( 'Duplicate slug detected in your list', 'wp-bulk-pages-generator' ),
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
				'results'           => __( 'Creation Results', 'wp-bulk-pages-generator' ),
				'start_over'        => __( 'Start Over', 'wp-bulk-pages-generator' ),
				'confirm_type_change' => __( 'Switching the post type will clear your current list. Continue?', 'wp-bulk-pages-generator' ),
				'confirm_leave'       => __( 'Bulk creation is in progress. Are you sure you want to leave?', 'wp-bulk-pages-generator' ),
				'toggle_theme'       => __( 'Toggle Light/Dark Mode', 'wp-bulk-pages-generator' ),
				'select_type'        => __( 'Select Post Type...', 'wp-bulk-pages-generator' ),
				'generate_btn'       => __( 'Generate %ss', 'wp-bulk-pages-generator' ),
				'copy'              => __( 'Copy', 'wp-bulk-pages-generator' ),
				'copied'            => __( 'Copied!', 'wp-bulk-pages-generator' ),
			)
		) );
	}

	/**
	 * Get Current Theme Mode.
	 */
	private function get_theme_mode() {
		return isset( $_COOKIE['wbpg_theme'] ) ? sanitize_key( $_COOKIE['wbpg_theme'] ) : 'light';
	}

	/**
	 * Render Admin Page (Generator).
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

			<div class="wbpg-layout wbpg-layout-full">
				<main class="wbpg-main-content" id="wbpg-main">
					<!-- Setup Card -->
					<div class="wbpg-card wbpg-setup">
						<div class="wbpg-card-header">
							<h2>1. Build Your List</h2>
						</div>
						<div class="wbpg-input-group">
							<label for="wbpg-post-type" id="post-type-label">
								<?php _e( 'Which Post Type?', 'wp-bulk-pages-generator' ); ?>
								<span class="wbpg-tooltip-icon" id="tip-type"><i class="fa-solid fa-circle-info" aria-hidden="true"></i></span>
							</label>
							<select id="wbpg-post-type" aria-labelledby="post-type-label">
								<option value=""><?php _e( 'Select Post Type...', 'wp-bulk-pages-generator' ); ?></option>
								<option value="page"><?php _e( 'Page', 'wp-bulk-pages-generator' ); ?></option>
								<option value="post"><?php _e( 'Post', 'wp-bulk-pages-generator' ); ?></option>
							</select>
						</div>
						<div id="wbpg-generate-row" class="wbpg-input-group" style="display:none;">
							<label for="wbpg-count" id="count-label">
								<?php _e( 'How many rows should we add?', 'wp-bulk-pages-generator' ); ?>
								<span class="wbpg-tooltip-icon" id="tip-count"><i class="fa-solid fa-circle-info" aria-hidden="true"></i></span>
							</label>
							<div class="wbpg-input-row">
								<input type="number" id="wbpg-count" min="1" max="100" value="5" aria-labelledby="count-label" placeholder="5">
								<button id="wbpg-generate-btn" class="button button-primary" aria-label="<?php esc_attr_e( 'Generate new rows for content entry', 'wp-bulk-pages-generator' ); ?>"><?php _e( 'Generate List', 'wp-bulk-pages-generator' ); ?></button>
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
								<button id="wbpg-delete-selected-btn" class="button button-link-delete" style="display:none;" aria-label="<?php esc_attr_e( 'Delete all selected rows from the table', 'wp-bulk-pages-generator' ); ?>"><?php _e( 'Delete Selected', 'wp-bulk-pages-generator' ); ?></button>
								<button id="wbpg-create-all-btn" class="button button-primary" aria-label="<?php esc_attr_e( 'Start bulk creation process for all items in the table', 'wp-bulk-pages-generator' ); ?>"><?php _e( 'Create All Pages', 'wp-bulk-pages-generator' ); ?></button>
							</div>
						</div>

						<div class="wbpg-table-responsive">
							<table class="wbpg-table" id="wbpg-pages-table">
								<thead>
									<tr>
										<th class="col-check"><input type="checkbox" id="wbpg-select-all" aria-label="<?php esc_attr_e( 'Select all rows', 'wp-bulk-pages-generator' ); ?>"></th>
										<th class="col-status"><?php _e( 'Status', 'wp-bulk-pages-generator' ); ?></th>
										<th><?php _e( 'Title', 'wp-bulk-pages-generator' ); ?> <span class="wbpg-tooltip-icon" id="tip-title"><i class="fa-solid fa-circle-info" aria-hidden="true"></i></span></th>
										<th><?php _e( 'Slug', 'wp-bulk-pages-generator' ); ?> <span class="wbpg-tooltip-icon" id="tip-slug"><i class="fa-solid fa-circle-info" aria-hidden="true"></i></span></th>
										<th class="col-parent" id="wbpg-parent-column-head"><?php _e( 'Parent', 'wp-bulk-pages-generator' ); ?></th>
										<th><?php _e( 'Content', 'wp-bulk-pages-generator' ); ?> <span class="wbpg-tooltip-icon" id="tip-content"><i class="fa-solid fa-circle-info" aria-hidden="true"></i></span></th>
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
						<div class="wbpg-summary-header">
							<h2><?php _e( 'Progress Summary', 'wp-bulk-pages-generator' ); ?></h2>
							<button id="wbpg-start-over-btn" class="button button-secondary" style="display:none;"><?php _e( 'Start Over', 'wp-bulk-pages-generator' ); ?></button>
						</div>
						<div id="wbpg-progress-bar-container" role="progressbar" aria-valuemin="0" aria-valuemax="100">
							<div id="wbpg-progress-bar"></div>
						</div>
						<p id="wbpg-progress-text" aria-live="polite"><?php _e( 'Creating pages: 0/0', 'wp-bulk-pages-generator' ); ?></p>
						<div id="wbpg-results-container" style="display:none;" role="region" aria-labelledby="wbpg-results-title-head">
							<h3 class="wbpg-results-title" id="wbpg-results-title-head"><?php _e( 'Review Created Items', 'wp-bulk-pages-generator' ); ?></h3>
							<div id="wbpg-results-list" class="wbpg-results-list" aria-live="polite"></div>
						</div>
					</div>
				</main>
			</div>
			<div class="wbpg-footer-clear"></div>
		</div>
		<?php
	}

	/**
	 * Render Documentation Page.
	 */
	public function render_docs_page() {
		$theme = $this->get_theme_mode();
		?>
		<div class="wrap wbpg-admin-wrap" data-theme="<?php echo esc_attr( $theme ); ?>" role="main" aria-labelledby="wbpg-docs-title">
			<header class="wbpg-header">
				<div class="wbpg-header-main">
					<h1 id="wbpg-docs-title"><?php _e( 'User Guide & Strategy', 'wp-bulk-pages-generator' ); ?></h1>
					<p><?php _e( 'Master bulk creation with professional guides and high-conversion block patterns.', 'wp-bulk-pages-generator' ); ?></p>
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

			<div class="wbpg-docs-layout">
				<!-- Quick Start Card -->
				<div class="wbpg-card wbpg-docs-card">
					<h2><i class="fa-solid fa-bolt" aria-hidden="true" style="margin-right:12px;color:var(--wbpg-accent);"></i><?php _e( 'Speed Workflow', 'wp-bulk-pages-generator' ); ?></h2>
					<div class="wbpg-docs-content">
						<p><?php echo sprintf( __( 'Deploy hundreds of pages in seconds with this high-performance sequence:', 'wp-bulk-pages-generator' ) ); ?></p>
						<ol class="wbpg-docs-list">
							<li><strong><?php _e( 'Select Post Type:', 'wp-bulk-pages-generator' ); ?></strong> <?php _e( 'Choose between Pages, Posts, or custom types.', 'wp-bulk-pages-generator' ); ?></li>
							<li><strong><?php _e( 'Define Volume:', 'wp-bulk-pages-generator' ); ?></strong> <?php _e( 'Enter the number of items you wish to create.', 'wp-bulk-pages-generator' ); ?></li>
							<li><strong><?php _e( 'Fill Details:', 'wp-bulk-pages-generator' ); ?></strong> <?php _e( 'Enter titles, slugs, and optional block content.', 'wp-bulk-pages-generator' ); ?></li>
							<li><strong><?php _e( 'Bulk Create:', 'wp-bulk-pages-generator' ); ?></strong> <?php _e( 'Click "Create All" and watch the engine process in real-time.', 'wp-bulk-pages-generator' ); ?></li>
						</ol>
					</div>
				</div>

				<!-- Strategy & Patterns Card -->
				<div class="wbpg-card wbpg-docs-card">
					<h2><i class="fa-solid fa-layer-group" aria-hidden="true" style="margin-right:12px;color:var(--wbpg-accent);"></i><?php _e( 'Content Architecture', 'wp-bulk-pages-generator' ); ?></h2>
					<div class="wbpg-docs-content">
						<p><?php _e( 'Use these high-fidelity snippets to create professional layouts instantly:', 'wp-bulk-pages-generator' ); ?></p>
						
						<div class="wbpg-pattern-item">
							<div class="wbpg-pattern-header">
								<strong><i class="fa-regular fa-circle-question" style="margin-right:8px;"></i><?php _e( 'Professional FAQ Section', 'wp-bulk-pages-generator' ); ?></strong>
								<button class="wbpg-copy-btn button button-small" data-clipboard="faq"><?php _e( 'Copy Code', 'wp-bulk-pages-generator' ); ?></button>
							</div>
							<code id="pattern-faq">&lt;!-- wp:details {"summary":"Is this free?"} --&gt;&lt;details open&gt;&lt;summary&gt;Is this free?&lt;/summary&gt;&lt;!-- wp:paragraph --&gt;&lt;p&gt;Yes, fully open source.&lt;/p&gt;&lt;!-- /wp:paragraph --&gt;&lt;/details&gt;&lt;!-- /wp:details --&gt;</code>
						</div>

						<div class="wbpg-pattern-item">
							<div class="wbpg-pattern-header">
								<strong><i class="fa-solid fa-bullseye" style="margin-right:8px;"></i><?php _e( 'Modern Call to Action', 'wp-bulk-pages-generator' ); ?></strong>
								<button class="wbpg-copy-btn button button-small" data-clipboard="cta"><?php _e( 'Copy Code', 'wp-bulk-pages-generator' ); ?></button>
							</div>
							<code id="pattern-cta">&lt;!-- wp:buttons --&gt;&lt;div class="wp-block-buttons"&gt;&lt;!-- wp:button --&gt;&lt;div class="wb-block-button"&gt;&lt;a class="wp-block-button__link wp-element-button"&gt;Start Now&lt;/a&gt;&lt;/div&gt;&lt;!-- /wp:button --&gt;&lt;/div&gt;&lt;!-- /wp:buttons --&gt;</code>
						</div>
					</div>
				</div>

				<!-- Pro Tips & A11y Card -->
				<div class="wbpg-card wbpg-docs-card">
					<h2><i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true" style="margin-right:12px;color:var(--wbpg-accent);"></i><?php _e( 'Pro Tips & Access', 'wp-bulk-pages-generator' ); ?></h2>
					<div class="wbpg-docs-content">
						<ul class="wbpg-docs-list">
							<li><i class="fa-solid fa-keyboard" style="margin-right:8px;opacity:0.6;"></i><?php _e( 'Use **Tab** keys to navigate quickly between input fields.', 'wp-bulk-pages-generator' ); ?></li>
							<li><i class="fa-solid fa-trash-can" style="margin-right:8px;opacity:0.6;"></i><?php _e( 'Press **Enter** or **Space** on the trash icon to remove a row via keyboard.', 'wp-bulk-pages-generator' ); ?></li>
							<li><i class="fa-solid fa-tag" style="margin-right:8px;opacity:0.6;"></i><?php _e( 'Leave the **Slug** empty to let WordPress generate a search-friendly URL.', 'wp-bulk-pages-generator' ); ?></li>
							<li><i class="fa-solid fa-rotate-left" style="margin-right:8px;opacity:0.6;"></i><?php _e( 'The **Start Over** button clears all data—use it to quickly start a new batch.', 'wp-bulk-pages-generator' ); ?></li>
						</ul>
					</div>
				</div>

			</div>
			<div class="wbpg-footer-clear"></div>
		</div>
		<?php
	}

	/**
	 * Render About Page.
	 */
	public function render_about_page() {
		$theme = $this->get_theme_mode();
		?>
		<div class="wrap wbpg-admin-wrap" data-theme="<?php echo esc_attr( $theme ); ?>" role="main" aria-labelledby="wbpg-about-title">
			<header class="wbpg-header">
				<div class="wbpg-header-main">
					<h1 id="wbpg-about-title"><?php _e( 'About the Creator', 'wp-bulk-pages-generator' ); ?></h1>
					<p><?php _e( 'The philosophy, vision, and craftsmanship behind the engine.', 'wp-bulk-pages-generator' ); ?> <span class="wbpg-version-badge">v<?php echo esc_html( $this->version ); ?></span></p>
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

			<div class="wbpg-about-layout">
				<!-- Author Bio Card -->
				<div class="wbpg-card wbpg-author-card">
					<div class="wbpg-author-profile">
						<div class="wbpg-author-info">
							<h2>Boopathi R</h2>
							<p class="wbpg-author-tagline"><?php _e( 'Open Source Architect & Craftsmanship Enthusiast', 'wp-bulk-pages-generator' ); ?></p>
							<div class="wbpg-author-bio">
								<p><?php _e( 'I am a Computer Science Engineer with over 10 years of professional experience in software design and development. For the past 7 years, I have focused my expertise on WordPress, web design, and IT infrastructure, building high-performance digital solutions.', 'wp-bulk-pages-generator' ); ?></p>
								<p><?php _e( 'I find deep joy in creating open source tools that contribute positively to our planet. My work is guided by strict principles and a commitment to all industry guidelines to ensure the delivery of smooth, rich, beautiful, fast, and accessible code.', 'wp-bulk-pages-generator' ); ?></p>
								<p><?php _e( 'I believe that software should not only be functional but should also feel premium and intuitive, respecting every micro-interaction and focus state to provide a truly superior user experience.', 'wp-bulk-pages-generator' ); ?></p>
							</div>
							<div class="wbpg-social-grid">
								<a href="https://github.com/boopathirbk" target="_blank" class="wbpg-social-link" title="GitHub Profile">
									<i class="fa-brands fa-github"></i>
									<span>GitHub</span>
								</a>
								<a href="https://linkedin.com/in/boopathirb" target="_blank" class="wbpg-social-link" title="LinkedIn Profile">
									<i class="fa-brands fa-linkedin"></i>
									<span>LinkedIn</span>
								</a>
								<a href="mailto:genius@duck.com" class="wbpg-social-link" title="Send Email">
									<i class="fa-solid fa-envelope"></i>
									<span><?php _e( 'Email', 'wp-bulk-pages-generator' ); ?></span>
								</a>
							</div>
							<p class="wbpg-security-note">
								<i class="fa-solid fa-shield-halved" style="margin-right:6px;opacity:0.6;"></i>
								<?php _e( 'Note: The email above is anonymized for security purposes. If your message is legitimate, I will reach back out from my primary address.', 'wp-bulk-pages-generator' ); ?>
							</p>
						</div>
					</div>
				</div>

				<!-- Support & Services -->
				<div class="wbpg-about-side">
					<!-- Custom Software -->
					<div class="wbpg-card wbpg-services-card">
						<h2><i class="fa-solid fa-wand-magic-sparkles" style="margin-right:12px;color:var(--wbpg-accent);"></i><?php _e( 'Custom Solutions', 'wp-bulk-pages-generator' ); ?></h2>
						<p><?php _e( 'I’m available for building custom software, specialized tools, high-performance websites, and mobile applications tailored to your specific budget and vision.', 'wp-bulk-pages-generator' ); ?></p>
						<a href="mailto:genius@duck.com" class="button button-primary" style="width:100%;">
							<?php _e( 'Hire for Custom Work', 'wp-bulk-pages-generator' ); ?>
						</a>
					</div>

					<!-- Donate Section -->
					<div class="wbpg-card wbpg-donate-card">
						<h2><i class="fa-solid fa-mug-hot" style="margin-right:12px;color:var(--wbpg-accent);"></i><?php _e( 'Fuel the Creator', 'wp-bulk-pages-generator' ); ?></h2>
						<p><?php _e( 'Supporting open source helps me dedicated more time to building tools like this for the community.', 'wp-bulk-pages-generator' ); ?></p>
						<a href="https://paypal.me/boopathirbk" target="_blank" class="button button-secondary" style="width:100%;">
							<i class="fa-brands fa-paypal" style="margin-right:8px;"></i>
							<?php _e( 'Donate via PayPal', 'wp-bulk-pages-generator' ); ?>
						</a>
					</div>

					<!-- Moved Collaboration Section -->
					<div class="wbpg-card">
						<h2><i class="fa-solid fa-code-branch" style="margin-right:12px;color:var(--wbpg-accent);"></i><?php _e( 'Technical Support', 'wp-bulk-pages-generator' ); ?></h2>
						<div class="wbpg-docs-links">
							<a href="https://github.com/boopathirbk/wp-bulk-pages-generator" target="_blank" class="button button-secondary" style="margin-bottom:10px; width:100%;">
								<i class="fa-brands fa-github" style="margin-right:8px;"></i><?php _e( 'Official Repository', 'wp-bulk-pages-generator' ); ?>
							</a>
							<a href="https://github.com/boopathirbk/wp-bulk-pages-generator/issues" target="_blank" class="button button-secondary" style="width:100%;">
								<i class="fa-solid fa-circle-exclamation" style="margin-right:8px;"></i><?php _e( 'Open an Issue', 'wp-bulk-pages-generator' ); ?>
							</a>
						</div>
					</div>
				</div>
			</div>
			<div class="wbpg-footer-clear"></div>
		</div>
		<?php
	}
}
