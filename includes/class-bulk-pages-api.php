<?php
/**
 * WBPG_API Class
 * Handles REST API endpoints for the plugin.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WBPG_API {

	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register REST API routes.
	 */
	public function register_routes() {
		register_rest_route( 'wp-bulk-pages/v1', '/create', array(
			'methods'             => 'POST',
			'callback'            => array( $this, 'create_page' ),
			'permission_callback' => array( $this, 'check_permission' ),
			'args'                => array(
				'title'   => array(
					'required'          => true,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
				),
				'slug'    => array(
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_title',
				),
				'parent'  => array(
					'type'              => 'integer',
					'sanitize_callback' => 'absint',
				),
				'content' => array(
					'type'              => 'string',
					'sanitize_callback' => 'wp_kses_post',
				),
				'post_type' => array(
					'type'              => 'string',
					'default'           => 'page',
					'sanitize_callback' => 'sanitize_key',
				),
			),
		) );

		register_rest_route( 'wp-bulk-pages/v1', '/parents', array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'get_parents' ),
			'permission_callback' => array( $this, 'check_permission' ),
			'args'                => array(
				'post_type' => array(
					'type'     => 'string',
					'default'  => 'page',
					'required' => false,
				),
			),
		) );

		register_rest_route( 'wp-bulk-pages/v1', '/post-types', array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'get_post_types' ),
			'permission_callback' => array( $this, 'check_permission' ),
		) );
	}

	/**
	 * Permission check for API requests.
	 */
	public function check_permission() {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Create a single page.
	 */
	public function create_page( $request ) {
		$params    = $request->get_json_params();
		$title     = sanitize_text_field( $params['title'] );
		$slug      = sanitize_title( $params['slug'] );
		$parent    = intval( $params['parent'] );
		$content   = $params['content'];
		$post_type = ! empty( $params['post_type'] ) ? sanitize_key( $params['post_type'] ) : 'page';

		if ( empty( $title ) ) {
			return new WP_Error( 'missing_title', 'Title is required.', array( 'status' => 400 ) );
		}

		$post_data = array(
			'post_title'   => $title,
			'post_name'    => $slug,
			'post_parent'  => $parent,
			'post_content' => wp_kses_post( $content ),
			'post_type'    => $post_type,
			'post_status'  => 'publish',
		);

		$post_id = wp_insert_post( $post_data );

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		return array(
			'success' => true,
			'id'      => $post_id,
			'link'    => get_permalink( $post_id ),
		);
	}

	/**
	 * Get list of pages for parent dropdown.
	 */
	public function get_parents( $request ) {
		$post_type = $request->get_param( 'post_type' ) ?: 'page';
		
		$pages = get_pages( array(
			'post_type'   => $post_type,
			'post_status' => 'publish',
			'sort_column' => 'post_title',
		) );

		$results = array();
		if ( ! empty( $pages ) && ! is_wp_error( $pages ) ) {
			foreach ( $pages as $page ) {
				$prefix = '';
				$ancestors = get_post_ancestors( $page->ID );
				if ( ! empty( $ancestors ) ) {
					$prefix = str_repeat( '&mdash; ', count( $ancestors ) );
				}

				$results[] = array(
					'id'    => $page->ID,
					'title' => $prefix . $page->post_title,
				);
			}
		}

		return $results;
	}

	/**
	 * Get list of public post types.
	 */
	public function get_post_types() {
		$post_types = get_post_types( array( 'public' => true ), 'objects' );
		$results = array();

		foreach ( $post_types as $slug => $post_type ) {
			// Skip media and other non-standard CPTs if needed
			if ( in_array( $slug, array( 'attachment', 'revision', 'nav_menu_item' ) ) ) {
				continue;
			}
			$results[] = array(
				'slug'         => $slug,
				'name'         => $post_type->labels->singular_name ?: $post_type->labels->name,
				'hierarchical' => (bool) $post_type->hierarchical,
			);
		}

		return $results;
	}
}
