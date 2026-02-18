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
    let currentTaxonomy = '';
    let availablePostTypes = {};

    // Theme Toggle Logic
    const $wrap = $('.wbpg-admin-wrap');
    const $themeToggle = $('#wbpg-theme-toggle');
    const $themeIcon = $themeToggle.find('.dashicons');

    function setTheme(theme) {
        $wrap.attr('data-theme', theme);
        localStorage.setItem('wbpg-theme', theme);
        if (theme === 'dark') {
            $themeIcon.removeClass('dashicons-lightbulb').addClass('dashicons-visibility');
        } else {
            $themeIcon.removeClass('dashicons-visibility').addClass('dashicons-lightbulb');
        }
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('wbpg-theme') || 'light';
    setTheme(savedTheme);

    $themeToggle.on('click', function () {
        const newTheme = $wrap.attr('data-theme') === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    });

    function updateDynamicLabels() {
        const typeData = availablePostTypes[currentPostType] || {};
        const typeLabel = typeData.name || 'Page';
        const taxLabel = typeData.tax_label || 'Category';
        const isHierarchical = typeData.hierarchical;

        $('#wbpg-configure-title').text(`2. Configure ${typeLabel} Details`);
        $('#wbpg-create-all-btn').text(`Create All ${typeLabel}s`);

        // Update Column Header
        if (isHierarchical) {
            $('#wbpg-parent-column-head').text('Parent');
        } else if (typeData.taxonomy) {
            $('#wbpg-parent-column-head').text(taxLabel);
        }
    }

    // Load Post Types
    function loadPostTypes() {
        $.ajax({
            url: wbpgData.apiUrl + '/post-types',
            method: 'GET',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-WP-Nonce', wbpgData.nonce);
                $generateBtn.prop('disabled', true).text('Loading...');
            },
            success: function (types) {
                const $selector = $('#wbpg-post-type');
                $selector.empty();
                types.forEach(function (type) {
                    availablePostTypes[type.slug] = type;
                    $selector.append(`<option value="${type.slug}" data-hierarchical="${type.hierarchical ? '1' : '0'}" ${type.slug === 'page' ? 'selected' : ''}>${type.name}</option>`);
                });
                toggleParentColumn();
                updateDynamicLabels();
                loadParents(currentPostType);
                $generateBtn.prop('disabled', false).text('Generate List');
            }
        });
    }
    loadPostTypes();

    function toggleParentColumn() {
        const typeData = availablePostTypes[currentPostType] || { hierarchical: true };
        const isHierarchical = typeData.hierarchical;
        const hasTaxonomy = !!typeData.taxonomy;

        if (isHierarchical || hasTaxonomy) {
            $('.col-parent').show();
            $('.wbpg-row-parent').prop('disabled', false);
        } else {
            $('.col-parent').hide();
            $('.wbpg-row-parent').prop('disabled', true);
        }
    }

    // Load parent pages or terms for a specific post type
    function loadParents(postType = 'page') {
        const typeData = availablePostTypes[postType] || { hierarchical: true };
        const isHierarchical = typeData.hierarchical;
        currentTaxonomy = typeData.taxonomy || '';

        if (isHierarchical) {
            parentOptionsHtml = '<option value="0">None (Top Level)</option>';
            $.ajax({
                url: wbpgData.apiUrl + '/parents',
                method: 'GET',
                data: { post_type: postType },
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('X-WP-Nonce', wbpgData.nonce);
                },
                success: function (parents) {
                    parents.forEach(function (parent) {
                        parentOptionsHtml += `<option value="${parent.id}">${parent.title}</option>`;
                    });
                    refreshDropdowns();
                }
            });
        } else if (currentTaxonomy) {
            parentOptionsHtml = '<option value="0">Select Category</option>';
            $.ajax({
                url: wbpgData.apiUrl + '/terms',
                method: 'GET',
                data: { taxonomy: currentTaxonomy },
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('X-WP-Nonce', wbpgData.nonce);
                },
                success: function (terms) {
                    terms.forEach(function (term) {
                        parentOptionsHtml += `<option value="${term.id}">${term.title}</option>`;
                    });
                    refreshDropdowns();
                }
            });
        }
    }

    function refreshDropdowns() {
        $('.wbpg-row .wbpg-row-parent').each(function () {
            const $select = $(this);
            if ($select.closest('tr').find('.wbpg-status-icon').hasClass('pending')) {
                const currentVal = $select.val();
                $select.html(parentOptionsHtml).val(currentVal);
            }
        });
    }


    // Handle Post Type Change
    $('#wbpg-post-type').on('change', function () {
        currentPostType = $(this).val();
        toggleParentColumn();
        loadParents(currentPostType);
        updateDynamicLabels();
    });

    // Generate List Rows
    $generateBtn.on('click', function () {
        let count = parseInt($countInput.val());
        if (isNaN(count) || count < 1) return;

        if (count > 100) {
            count = 100;
            $countInput.val(100);
        }

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
                <td class="col-parent"><select class="wbpg-row-parent">${parentOptionsHtml}</select></td>
                <td><textarea class="wbpg-row-content" placeholder="Block content or HTML...">${data.content || ''}</textarea></td>
                <td class="col-action"><span class="wbpg-row-remove dashicons dashicons-trash" title="Remove"></span></td>
            </tr>
        `;
        const $row = $(rowHtml);
        if (data.parent) {
            $row.find('.wbpg-row-parent').val(data.parent);
        }
        $rowsContainer.append($row);
        toggleParentColumn();
    }

    // Selection Logic Fixes
    $('#wbpg-select-all').on('change', function () {
        const isChecked = $(this).is(':checked');
        $('.wbpg-row-check').prop('checked', isChecked).trigger('change');
    });

    $rowsContainer.on('change', '.wbpg-row-check', function () {
        const checkbox = $(this);
        const row = checkbox.closest('tr');
        if (checkbox.is(':checked')) {
            row.addClass('selected');
        } else {
            row.removeClass('selected');
            $('#wbpg-select-all').prop('checked', false);
        }
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
            const $statusIcon = $(this).find('.wbpg-status-icon');
            return $statusIcon.hasClass('pending') || $statusIcon.hasClass('error');
        });

        if (pendingRows.length === 0) return;

        const typeLabel = $('#wbpg-post-type option:selected').text();
        if (!confirm(`Create ${pendingRows.length} ${typeLabel}(s)?`)) return;

        $createBtn.prop('disabled', true).text('Creating...');
        $summaryBox.show();
        $progressBar.css('width', '0%');

        let completed = 0;
        let successCount = 0;
        const total = pendingRows.length;

        for (let i = 0; i < pendingRows.length; i++) {
            const $row = $(pendingRows[i]);
            const $statusIcon = $row.find('.wbpg-status-icon');

            const data = {
                title: $row.find('.wbpg-row-title').val().trim(),
                slug: $row.find('.wbpg-row-slug').val().trim(),
                parent: availablePostTypes[currentPostType].hierarchical ? parseInt($row.find('.wbpg-row-parent').val()) : 0,
                term_id: !availablePostTypes[currentPostType].hierarchical ? parseInt($row.find('.wbpg-row-parent').val()) : 0,
                taxonomy: currentTaxonomy,
                content: $row.find('.wbpg-row-content').val(),
                post_type: currentPostType
            };

            // Reset UI state before attempt
            $row.find('.wbpg-row-title').css('border-color', 'var(--wbpg-border)');
            $statusIcon.attr('class', 'wbpg-status-icon loading').attr('title', 'Creating...');

            // Strict Validation
            if (!data.title) {
                $statusIcon.attr('class', 'wbpg-status-icon error').attr('title', 'Title is missing or empty');
                $row.find('.wbpg-row-title').css('border-color', 'var(--wbpg-error)');
                completed++;
                updateProgress(successCount, total, completed);
                continue;
            }

            try {
                const response = await createPage(data);
                if (response.success && response.id) {
                    $statusIcon.attr('class', 'wbpg-status-icon success').attr('title', 'Created successfully');
                    if ($row.find('.wbpg-view-link').length === 0) {
                        $row.find('.wbpg-row-title').after(`<div class="wbpg-view-link" style="font-size:11px; margin-top:4px;"><a href="${response.link}" target="_blank">View ${typeLabel}</a></div>`);
                    }
                    $row.find('input, select, textarea').prop('disabled', true).css('opacity', '0.6');
                    $row.find('.wbpg-row-remove').hide();
                    successCount++;
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
            updateProgress(successCount, total, completed);
        }

        $createBtn.prop('disabled', false).text(`Create All ${typeLabel}s`);
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

    function updateProgress(successCount, total, attempted) {
        const percentage = (attempted / total) * 100;
        const typeLabel = $('#wbpg-post-type option:selected').text();
        $progressBar.css('width', percentage + '%');
        $progressText.text(`Successfully created ${successCount} out of ${total} ${typeLabel}(s).`);

        if (attempted === total && successCount < total) {
            $progressText.append(` (${total - successCount} failed or skipped)`);
            $progressText.css('color', 'var(--wbpg-error)');
        } else if (attempted === total) {
            $progressText.css('color', 'var(--wbpg-success)');
        } else {
            $progressText.css('color', 'var(--wbpg-text-muted)');
        }
    }
});
