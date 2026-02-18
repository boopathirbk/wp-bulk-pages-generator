jQuery(document).ready(function ($) {
    const $rowsContainer = $('#wbpg-rows');
    const $listWrapper = $('#wbpg-list-container');
    const $generateBtn = $('#wbpg-generate-btn');
    const $createBtn = $('#wbpg-create-all-btn');
    const $countInput = $('#wbpg-count');
    const $summaryBox = $('#wbpg-status-summary');
    const $progressBar = $('#wbpg-progress-bar');
    const $progressText = $('#wbpg-progress-text');

    let parentOptionsHtml = '<option value="0">None (Top Level)</option>';
    let currentPostType = 'page';

    // Load Post Types
    function loadPostTypes() {
        $.ajax({
            url: wbpgData.apiUrl + '/post-types',
            method: 'GET',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-WP-Nonce', wbpgData.nonce);
            },
            success: function (types) {
                const $selector = $('#wbpg-post-type');
                $selector.empty();
                types.forEach(function (type) {
                    $selector.append(`<option value="${type.slug}" data-hierarchical="${type.hierarchical ? '1' : '0'}" ${type.slug === 'page' ? 'selected' : ''}>${type.name}</option>`);
                });
                toggleParentColumn();
            }
        });
    }
    loadPostTypes();

    function toggleParentColumn() {
        const isHierarchical = $('#wbpg-post-type option:selected').data('hierarchical') === 1;
        if (isHierarchical) {
            $('.col-parent').show();
            $('.wbpg-row-parent').prop('disabled', false).css('opacity', '1');
        } else {
            $('.col-parent').hide();
            $('.wbpg-row-parent').prop('disabled', true).css('opacity', '0.5');
        }
    }

    // Handle Post Type Change
    $('#wbpg-post-type').on('change', function () {
        currentPostType = $(this).val();
        toggleParentColumn();
        loadParents(currentPostType);
    });

    // Generate List Rows
    $generateBtn.on('click', function () {
        const count = parseInt($countInput.val());
        if (isNaN(count) || count < 1) return;

        // Optionally clear or append? User request said "create the number of list"
        $rowsContainer.empty();
        for (let i = 0; i < count; i++) {
            addRow();
        }

        $listWrapper.show();
        $summaryBox.hide();
        $('#wbpg-select-all').prop('checked', false);
        $('#wbpg-delete-selected-btn').hide();

        $('html, body').animate({
            scrollTop: $listWrapper.offset().top - 50
        }, 500);
    });

    function addRow(data = {}) {
        const rowId = Date.now() + Math.random().toString(36).substr(2, 9);
        const rowHtml = `
            <tr id="row-${rowId}" class="wbpg-row">
                <td class="col-check"><input type="checkbox" class="wbpg-row-check"></td>
                <td class="col-status"><span class="wbpg-status-icon pending" title="Pending"></span></td>
                <td><input type="text" class="wbpg-row-title" placeholder="Enter title..." value="${data.title || ''}" required></td>
                <td><input type="text" class="wbpg-row-slug" placeholder="slug" value="${data.slug || ''}"></td>
                <td><select class="wbpg-row-parent">${parentOptionsHtml}</select></td>
                <td><textarea class="wbpg-row-content" placeholder="Content...">${data.content || ''}</textarea></td>
                <td class="col-action"><span class="wbpg-row-remove dashicons dashicons-trash" title="Remove"></span></td>
            </tr>
        `;
        const $row = $(rowHtml);
        if (data.parent) {
            $row.find('.wbpg-row-parent').val(data.parent);
        }
        $rowsContainer.append($row);
    }

    // Demo Data
    $('#wbpg-load-demo-btn').on('click', function () {
        $rowsContainer.empty();
        const demoData = [
            { title: 'Our Solutions', slug: 'solutions', content: '<!-- wp:heading --><h2>Solutions</h2><!-- /wp:heading --><!-- wp:paragraph --><p>We solve problems.</p><!-- /wp:paragraph -->' },
            { title: 'Case Studies', slug: 'case-studies', content: '<!-- wp:paragraph --><p>Real results for real clients.</p><!-- /wp:paragraph -->' },
            { title: 'Tech Stack', slug: 'tech', content: '<!-- wp:paragraph --><p>Our modern development stack.</p><!-- /wp:paragraph -->' }
        ];
        demoData.forEach(data => addRow(data));
        $listWrapper.show();
        $summaryBox.hide();
    });

    // Bulk Selection Logic
    $('#wbpg-select-all').on('change', function () {
        const isChecked = $(this).is(':checked');
        $('.wbpg-row-check').prop('checked', isChecked);
        toggleBulkActions();
    });

    $rowsContainer.on('change', '.wbpg-row-check', function () {
        toggleBulkActions();
    });

    function toggleBulkActions() {
        const selectedCount = $('.wbpg-row-check:checked').length;
        if (selectedCount > 0) {
            $('#wbpg-delete-selected-btn').show().text(`Delete Selected (${selectedCount})`);
        } else {
            $('#wbpg-delete-selected-btn').hide();
        }
    }

    // Delete Selected
    $('#wbpg-delete-selected-btn').on('click', function () {
        const selected = $('.wbpg-row-check:checked');
        if (selected.length === 0) return;

        if (confirm(`Remove ${selected.length} rows?`)) {
            selected.closest('tr').fadeOut(300, function () {
                $(this).remove();
                toggleBulkActions();
                if ($('.wbpg-row').length === 0) {
                    $listWrapper.hide();
                    $('#wbpg-select-all').prop('checked', false);
                }
            });
        }
    });

    // Remove row
    $rowsContainer.on('click', '.wbpg-row-remove', function () {
        $(this).closest('tr').fadeOut(300, function () {
            $(this).remove();
            toggleBulkActions();
            if ($('.wbpg-row').length === 0) $listWrapper.hide();
        });
    });

    // Create All Pages
    $createBtn.on('click', async function () {
        const rows = $('.wbpg-row');
        const pendingRows = rows.filter(function () {
            return $(this).find('.wbpg-status-icon').hasClass('pending');
        });

        if (pendingRows.length === 0) return;

        if (!confirm(`Create ${pendingRows.length} ${currentPostType}(s)?`)) return;

        $createBtn.prop('disabled', true).text('Creating...');
        $summaryBox.show();
        $progressBar.css('width', '0%');

        let completed = 0;
        const total = pendingRows.length;

        for (let i = 0; i < pendingRows.length; i++) {
            const $row = $(pendingRows[i]);
            const $statusIcon = $row.find('.wbpg-status-icon');

            const data = {
                title: $row.find('.wbpg-row-title').val().trim(),
                slug: $row.find('.wbpg-row-slug').val().trim(),
                parent: parseInt($row.find('.wbpg-row-parent').val()),
                content: $row.find('.wbpg-row-content').val(),
                post_type: currentPostType
            };

            // Basic Client Side Validation
            if (!data.title) {
                $statusIcon.attr('class', 'wbpg-status-icon error').attr('title', 'Title is missing or empty');
                $row.find('.wbpg-row-title').css('border-color', 'var(--wbpg-error)');
                completed++;
                updateProgress(completed, total);
                continue;
            }

            // Reset border if it was erroring before
            $row.find('.wbpg-row-title').css('border-color', 'var(--wbpg-border)');
            $statusIcon.attr('class', 'wbpg-status-icon loading').attr('title', 'Creating...');

            try {
                const response = await createPage(data);
                if (response.success && response.id) {
                    $statusIcon.attr('class', 'wbpg-status-icon success').attr('title', 'Created successfully');
                    // Add link below the title if not already there
                    if ($row.find('.wbpg-view-link').length === 0) {
                        $row.find('.wbpg-row-title').after(`<div class="wbpg-view-link" style="font-size:11px; margin-top:4px;"><a href="${response.link}" target="_blank">View Page</a></div>`);
                    }
                    // Disable inputs for success rows
                    $row.find('input, select, textarea').prop('disabled', true).css('opacity', '0.6');
                    $row.find('.wbpg-row-remove').hide();
                } else {
                    const errorMsg = (response && response.message) ? response.message : 'Unknown error';
                    $statusIcon.attr('class', 'wbpg-status-icon error').attr('title', errorMsg);
                }
            } catch (error) {
                let msg = 'Network Error';
                if (error.responseJSON && error.responseJSON.message) {
                    msg = error.responseJSON.message;
                }
                $statusIcon.attr('class', 'wbpg-status-icon error').attr('title', msg);
            }

            completed++;
            updateProgress(completed, total);
        }

        $createBtn.prop('disabled', false).text('Create All Pages');
    });

    function createPage(data) {
        return $.ajax({
            url: wbpgData.apiUrl + '/create',
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-WP-Nonce', wbpgData.nonce);
            }
        });
    }

    function updateProgress(completed, total) {
        const percentage = (completed / total) * 100;
        $progressBar.css('width', percentage + '%');
        $progressText.text(`Creating pages: ${completed}/${total}`);
    }
});
