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
    let isCreating = false;
    const i18n = wbpgData.i18n;

    // Theme Toggle Logic
    function setTheme(theme) {
        const $wrap = $('.wbpg-admin-wrap');
        const $toggleBtn = $('#wbpg-theme-toggle');
        const $icon = $toggleBtn.find('i');
        const $textSpan = $toggleBtn.find('.wbpg-toggle-text');

        $wrap.attr('data-theme', theme);
        localStorage.setItem('wbpg_theme', theme);

        // Use a cookie for no-flash SSR initial load
        document.cookie = `wbpg_theme=${theme}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;

        if (theme === 'dark') {
            $icon.removeClass('fa-moon fa-lightbulb').addClass('fa-sun');
            $textSpan.text(i18n.lightMode || 'Light Mode');
        } else {
            $icon.removeClass('fa-sun fa-lightbulb').addClass('fa-moon');
            $textSpan.text(i18n.darkMode || 'Dark Mode');
        }
    }

    // Initialize Tippy.js
    function initTooltips() {
        if (typeof tippy === 'function') {
            tippy('.wbpg-tooltip-icon', {
                content(reference) {
                    const id = reference.getAttribute('id');
                    return i18n[id.replace('tip-', 'tip_')] || 'Info';
                },
                appendTo: () => document.body,
                theme: 'light',
                animation: 'shift-away',
                interactive: true
            });
        }
    }

    // Initialize Theme (Favor Cookie/LocalStorage)
    const savedTheme = localStorage.getItem('wbpg_theme') || getCookie('wbpg_theme') || 'light';
    setTheme(savedTheme);

    function getCookie(name) {
        let value = `; ${document.cookie}`;
        let parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
    $('#wbpg-theme-toggle').attr('aria-label', i18n.toggle_theme);
    initTooltips();

    // Prevent navigation during creation
    $(window).on('beforeunload', function () {
        if (isCreating) return i18n.confirm_leave;
    });

    // Use delegated listener for theme toggle
    $(document).on('click', '#wbpg-theme-toggle', function (e) {
        e.preventDefault();
        const $currentWrap = $('.wbpg-admin-wrap');
        const newTheme = $currentWrap.attr('data-theme') === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        // Refresh tippy theme if needed or just use a neutral one
    });

    function updateDynamicLabels() {
        const typeData = availablePostTypes[currentPostType] || {};
        const typeLabel = typeData.name || 'Page';
        const taxLabel = typeData.tax_label || 'Category';
        const isHierarchical = typeData.hierarchical;

        $('#wbpg-configure-title').text(i18n.configure.replace('%s', typeLabel));
        $('#wbpg-create-all-btn').text(i18n.create_btn.replace('%s', typeLabel));

        // Update Column Header
        if (isHierarchical) {
            $('#wbpg-parent-column-head').text(i18n.parent || 'Parent');
        } else if (typeData.taxonomy) {
            $('#wbpg-parent-column-head').text(taxLabel);
        }

        // Update Tooltips
        $('#tip-type').attr('aria-label', i18n.tip_type);
        $('#tip-count').attr('aria-label', i18n.tip_count);
        $('#tip-title').attr('aria-label', i18n.tip_title.replace('item', typeLabel.toLowerCase()));
        $('#tip-slug').attr('aria-label', i18n.tip_slug);
        $('#tip-content').attr('aria-label', i18n.tip_content);

        // Update existing row placeholders if any
        $('.wbpg-row-title').attr('placeholder', i18n.placeholder_title.replace('%s', typeLabel));
    }

    // Load Post Types
    function loadPostTypes() {
        $.ajax({
            url: wbpgData.apiUrl + '/post-types',
            method: 'GET',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-WP-Nonce', wbpgData.nonce);
                $generateBtn.prop('disabled', true).text(i18n.loading);
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
                $generateBtn.prop('disabled', false).text(i18n.generate);
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
            parentOptionsHtml = `<option value="0">${i18n.none}</option>`;
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
            parentOptionsHtml = `<option value="0">${i18n.select_cat}</option>`;
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
        if (isCreating) return; // Guard against concurrent operations
        const $this = $(this);
        if ($('.wbpg-row').length > 0) {
            if (!confirm(i18n.confirm_type_change)) {
                $this.val(currentPostType);
                return;
            }
            $rowsContainer.empty();
            $listWrapper.hide();
            $summaryBox.hide();
        }

        currentPostType = $this.val();
        toggleParentColumn();
        loadParents(currentPostType);
        updateDynamicLabels();
    });

    // Enforce count limits on input
    $countInput.on('input', function () {
        let val = parseInt($(this).val());
        if (val > 100) $(this).val(100);
        if (val < 1 && $(this).val() !== '') $(this).val(1);
    });

    // Generate List Rows
    $generateBtn.on('click', function () {
        if (isCreating) return; // Guard against current operations
        if (isCreating) return; // Guard against concurrent operations
        let count = parseInt($countInput.val());
        if (isNaN(count) || count < 1) return;

        if (count > 100) {
            count = 100;
            $countInput.val(100);
        }

        $rowsContainer.empty();

        // Performance Optimization: Use DocumentFragment for batch insertion
        const fragment = document.createDocumentFragment();
        const tempTable = document.createElement('table');
        const tempTbody = document.createElement('tbody');

        for (let i = 0; i < count; i++) {
            const rowHtml = createRowHtml();
            tempTbody.innerHTML = rowHtml.trim();
            fragment.appendChild(tempTbody.firstChild);
        }
        $rowsContainer[0].appendChild(fragment);
        initTooltips(); // Re-init for new icons

        $listWrapper.show();
        $summaryBox.hide();
        $('#wbpg-select-all').prop('checked', false);
        $('#wbpg-delete-selected-btn').hide();

        $('html, body').animate({
            scrollTop: $listWrapper.offset().top - 50
        }, 500, function () {
            // Set focus to the first title input for accessibility
            $rowsContainer.find('.wbpg-row-title').first().focus();
        });
    });

    function createRowHtml(data = {}) {
        const rowId = Date.now() + Math.random().toString(36).substr(2, 9);
        const typeData = availablePostTypes[currentPostType] || {};
        const typeLabel = typeData.name || 'Page';

        return `
            <tr id="row-${rowId}" class="wbpg-row">
                <td class="col-check"><input type="checkbox" class="wbpg-row-check"></td>
                <td class="col-status"><div class="wbpg-status-icon pending" title="Pending"><i class="fa-regular fa-clock"></i></div></td>
                <td><input type="text" class="wbpg-row-title" placeholder="${i18n.placeholder_title.replace('%s', typeLabel)}" value="${data.title || ''}" required></td>
                <td><input type="text" class="wbpg-row-slug" placeholder="${i18n.placeholder_slug}" value="${data.slug || ''}"></td>
                <td class="col-parent"><select class="wbpg-row-parent">${parentOptionsHtml}</select></td>
                <td><textarea class="wbpg-row-content" placeholder="${i18n.placeholder_content}">${data.content || ''}</textarea></td>
                <td class="col-action"><span class="wbpg-row-remove fa-solid fa-trash-can" title="Remove"></span></td>
            </tr>
        `;
    }

    function addRow(data = {}) {
        const $row = $(createRowHtml(data));
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
            $('#wbpg-delete-selected-btn').show().html(`<i class="fa-solid fa-trash-can" style="margin-right:4px;"></i> ${i18n.delete_selected.replace('%d', selectedCount)}`);
        } else {
            $('#wbpg-delete-selected-btn').hide();
        }
    }

    // Delete Selected
    $('#wbpg-delete-selected-btn').on('click', function () {
        const selected = $('.wbpg-row-check:checked');
        if (selected.length === 0) return;

        if (confirm(i18n.confirm_remove.replace('%d', selected.length))) {
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
        if (!confirm(i18n.confirm_create.replace('%d', pendingRows.length).replace('%s', typeLabel))) return;

        isCreating = true;
        $createBtn.prop('disabled', true).text(i18n.creating);
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
            $statusIcon.attr('class', 'wbpg-status-icon loading').attr('title', i18n.creating).html('<i class="fa-solid fa-circle-notch fa-spin"></i>');

            // Strict Validation
            if (!data.title) {
                $statusIcon.attr('class', 'wbpg-status-icon error').attr('title', i18n.error_no_title).html('<i class="fa-solid fa-circle-exclamation"></i>');
                $row.find('.wbpg-row-title').css('border-color', 'var(--wbpg-error)');
                completed++;
                updateProgress(successCount, total, completed);
                continue;
            }

            try {
                const response = await createPage(data);
                if (response.success && response.id) {
                    $statusIcon.attr('class', 'wbpg-status-icon success').attr('title', i18n.success_created).html('<i class="fa-solid fa-circle-check"></i>');
                    $row.find('.wbpg-view-link').remove(); // Prevent duplicates
                    $row.find('.wbpg-row-title').after(`<div class="wbpg-view-link" style="font-size:11px; margin-top:4px;"><a href="${response.link}" target="_blank">${i18n.view.replace('%s', typeLabel)}</a></div>`);
                    $row.find('input, select, textarea').prop('disabled', true).css('opacity', '0.6');
                    $row.find('.wbpg-row-remove').hide();
                    successCount++;
                } else {
                    const errorMsg = (response && response.message) ? response.message : i18n.unknown_error;
                    $statusIcon.attr('class', 'wbpg-status-icon error').attr('title', errorMsg).html('<i class="fa-solid fa-circle-xmark"></i>');
                }
            } catch (error) {
                let msg = i18n.network_error;
                if (error.responseJSON && error.responseJSON.message) {
                    msg = error.responseJSON.message;
                }
                $statusIcon.attr('class', 'wbpg-status-icon error').attr('title', msg).html('<i class="fa-solid fa-triangle-exclamation"></i>');
            }

            completed++;
            updateProgress(successCount, total, completed);
        }

        isCreating = false;
        $createBtn.prop('disabled', false).text(i18n.create_btn.replace('%s', typeLabel));
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
        const $icon = (attempted === total && successCount === total) ? '<i class="fa-solid fa-circle-check" style="margin-right:8px;"></i>' : '';
        $progressBar.css('width', percentage + '%');

        let formatted = i18n.success_msg
            .replace('%d', successCount)
            .replace('%d', total)
            .replace('%s', typeLabel);

        $progressText.html(`${$icon}${formatted}`);

        if (attempted === total && successCount < total) {
            $progressText.append(i18n.error_failed.replace('%d', total - successCount));
            $progressText.css('color', 'var(--wbpg-error)');
        } else if (attempted === total) {
            $progressText.css('color', 'var(--wbpg-success)');
        } else {
            $progressText.css('color', 'var(--wbpg-text-muted)');
        }
    }
});
