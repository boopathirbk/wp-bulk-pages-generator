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

		register_rest_route( 'wp-bulk-pages/v1', '/terms', array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'get_terms' ),
			'permission_callback' => array( $this, 'check_permission' ),
			'args'                => array(
				'taxonomy' => array(
					'type'     => 'string',
					'default'  => 'category',
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
	 * Create a single item (page, post, or CPT).
	 */
	public function create_page( $request ) {
		$params    = $request->get_json_params();
		$title     = ! empty( $params['title'] ) ? sanitize_text_field( $params['title'] ) : '';
		$slug      = ! empty( $params['slug'] ) ? sanitize_title( $params['slug'] ) : '';
		$parent    = ! empty( $params['parent'] ) ? absint( $params['parent'] ) : 0;
		$content   = ! empty( $params['content'] ) ? wp_kses_post( $params['content'] ) : '';
		$post_type = ! empty( $params['post_type'] ) ? sanitize_key( $params['post_type'] ) : 'page';
		$term_id   = ! empty( $params['term_id'] ) ? absint( $params['term_id'] ) : 0;
		$taxonomy  = ! empty( $params['taxonomy'] ) ? sanitize_key( $params['taxonomy'] ) : '';

		if ( empty( $title ) ) {
			return new WP_Error( 'missing_title', __( 'Title is required.', 'wp-bulk-pages-generator' ), array( 'status' => 400 ) );
		}

		$post_data = array(
			'post_title'   => $title,
			'post_name'    => $slug,
			'post_parent'  => $parent,
			'post_content' => $content,
			'post_type'    => $post_type,
			'post_status'  => 'publish',
		);

		$post_id = wp_insert_post( $post_data );

		if ( is_wp_error( $post_id ) ) {
			return new WP_Error( 'insert_failed', $post_id->get_error_message(), array( 'status' => 500 ) );
		}

		// Assign taxonomy if applicable
		if ( $post_id && $term_id > 0 && ! empty( $taxonomy ) ) {
			wp_set_post_terms( $post_id, array( $term_id ), $taxonomy );
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
	 * Get list of terms for taxonomy.
	 */
	public function get_terms( $request ) {
		$taxonomy = $request->get_param( 'taxonomy' ) ?: 'category';
		
		$terms = get_terms( array(
			'taxonomy'   => $taxonomy,
			'hide_empty' => false,
		) );

		$results = array();
		if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
			foreach ( $terms as $term ) {
				$results[] = array(
					'id'    => $term->term_id,
					'title' => $term->name,
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
			if ( in_array( $slug, array( 'attachment', 'revision', 'nav_menu_item' ) ) ) {
				continue;
			}

			// Get taxonomies for this post type
			$taxonomies = get_object_taxonomies( $slug, 'objects' );
			$primary_taxonomy = '';
			foreach ( $taxonomies as $tax_slug => $tax_obj ) {
				if ( $tax_obj->hierarchical && $tax_obj->public ) {
					$primary_taxonomy = $tax_slug;
					break;
				}
			}
			// Fallback to first public available taxonomy
			if ( empty( $primary_taxonomy ) ) {
				foreach ( $taxonomies as $tax_slug => $tax_obj ) {
					if ( $tax_obj->public && ! in_array( $tax_slug, array( 'post_format' ) ) ) {
						$primary_taxonomy = $tax_slug;
						break;
					}
				}
			}

			$results[] = array(
				'slug'         => $slug,
				'name'         => $post_type->labels->singular_name ?: $post_type->labels->name,
				'hierarchical' => (bool) $post_type->hierarchical,
				'taxonomy'     => $primary_taxonomy,
				'tax_label'    => ! empty( $primary_taxonomy ) ? $taxonomies[ $primary_taxonomy ]->labels->singular_name : '',
			);
		}

		return $results;
	}
}
