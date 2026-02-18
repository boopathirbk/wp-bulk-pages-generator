jQuery(document).ready(function ($) {
    // HTML escaping utility to prevent XSS
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    const $rowsContainer = $('#wbpg-rows');
    const $listWrapper = $('#wbpg-list-container');
    const $generateBtn = $('#wbpg-generate-btn');
    const $createBtn = $('#wbpg-create-all-btn');
    const $countInput = $('#wbpg-count');
    const $summaryBox = $('#wbpg-status-summary');
    const $progressBar = $('#wbpg-progress-bar');
    const $progressText = $('#wbpg-progress-text');
    const $adminWrap = $('.wbpg-admin-wrap');
    const $themeToggle = $('#wbpg-theme-toggle');

    let parentOptionsHtml = '<option value="0">None (Top Level)</option>';
    let currentPostType = '';
    let currentTaxonomy = '';
    let availablePostTypes = {};
    let isCreating = false;
    const i18n = wbpgData.i18n;

    // Theme Toggle Logic
    function setTheme(theme) {
        const $icon = $themeToggle.find('i');
        const $textSpan = $themeToggle.find('.wbpg-toggle-text');

        $adminWrap.attr('data-theme', theme);
        localStorage.setItem('wbpg_theme', theme);
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
            // Destroy existing instances on dynamic icons to prevent memory leaks
            $('.wbpg-row .wbpg-tooltip-icon').each(function () {
                if (this._tippy) this._tippy.destroy();
            });

            tippy('.wbpg-tooltip-icon', {
                content(reference) {
                    const id = reference.getAttribute('id');
                    if (!id) return reference.getAttribute('title') || 'Info';
                    return i18n[id.replace('tip-', 'tip_')] || reference.getAttribute('title') || 'Info';
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
        const isHierarchical = typeData.hierarchical;
        const hasTaxonomy = !!typeData.taxonomy;

        $('#wbpg-configure-title').text(i18n.configure.replace('%s', typeLabel));
        $('#wbpg-create-all-btn').text(i18n.create_btn.replace('%s', typeLabel));

        // Update Column Header and Visibility
        if (isHierarchical || hasTaxonomy) {
            $('.col-parent').show();
            $('.wbpg-row-parent').prop('disabled', false);
            $('#wbpg-parent-column-head').text(isHierarchical ? (i18n.parent || 'Parent') : typeData.tax_label);
        } else {
            $('.col-parent').hide();
            $('.wbpg-row-parent').prop('disabled', true);
        }

        // Update Tooltips
        $('#tip-title').attr('aria-label', i18n.tip_title.replace('item', escapeHtml(typeLabel.toLowerCase())));
        $('.wbpg-row-title').attr('placeholder', i18n.placeholder_title.replace('%s', escapeHtml(typeLabel)));
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
                $selector.append(`<option value="">${i18n.select_type || 'Select Post Type...'}</option>`);
                types.forEach(function (type) {
                    availablePostTypes[type.slug] = type;
                    $selector.append(`<option value="${escapeHtml(type.slug)}" data-hierarchical="${type.hierarchical ? '1' : '0'}">${escapeHtml(type.name)}</option>`);
                });
                toggleParentColumn();
                updateDynamicLabels();
                if (currentPostType) loadParents(currentPostType);
                $generateBtn.prop('disabled', false); // Initial label will be set by selection change
            }
        });
    }
    loadPostTypes();

    function toggleParentColumn() {
        updateDynamicLabels(); // Consolidate logic
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
                        parentOptionsHtml += `<option value="${parent.id}">${escapeHtml(parent.title)}</option>`;
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
                        parentOptionsHtml += `<option value="${term.id}">${escapeHtml(term.title)}</option>`;
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
    $(document).on('change', '#wbpg-post-type', function () {
        const $this = $(this);
        const val = $this.val();

        if (!val) {
            currentPostType = '';
            $('#wbpg-generate-row').hide();
            $listWrapper.hide();
            return;
        }

        // Disable placeholder once a selection is made
        $this.find('option[value=""]').prop('disabled', true);

        if (currentPostType && $('.wbpg-row').length > 0) {
            if (!confirm(i18n.confirm_type_change)) {
                $this.val(currentPostType);
                return;
            }
            $rowsContainer.empty();
            $listWrapper.hide();
            $summaryBox.hide();
        }

        currentPostType = val;
        const typeData = availablePostTypes[currentPostType] || {};
        const typeLabel = typeData.name || 'Item';

        $generateBtn.text(i18n.generate_btn.replace('%s', typeLabel));
        $('#wbpg-generate-row').fadeIn(300);

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
            tempTbody.insertAdjacentHTML('beforeend', rowHtml.trim());
        }

        while (tempTbody.firstChild) {
            fragment.appendChild(tempTbody.firstChild);
        }
        $rowsContainer[0].appendChild(fragment);
        initTooltips(); // Re-init for new icons

        $listWrapper.show();
        $summaryBox.hide();
        $('#wbpg-select-all').prop('checked', false);
        $('#wbpg-delete-selected-btn').hide();

        // Removed auto-scroll to summary as requested
        $rowsContainer.find('.wbpg-row-title').first().focus();
    });

    function createRowHtml(data = {}) {
        const rowId = Math.random().toString(36).substring(2, 11);
        const typeData = availablePostTypes[currentPostType] || {};
        const typeLabel = typeData.name || 'Page';

        return `
            <tr id="row-${rowId}" class="wbpg-row">
                <td class="col-check" data-label="Select"><input type="checkbox" class="wbpg-row-check"></td>
                <td class="col-status" data-label="Status"><div class="wbpg-status-icon pending" title="Pending"><i class="fa-regular fa-clock" aria-hidden="true"></i></div></td>
                <td data-label="${i18n.title || 'Title'}"><input type="text" class="wbpg-row-title" placeholder="${i18n.placeholder_title.replace('%s', escapeHtml(typeLabel))}" value="${escapeHtml(data.title || '')}" required></td>
                <td data-label="${i18n.slug || 'Slug'}"><input type="text" class="wbpg-row-slug" placeholder="${i18n.placeholder_slug}" value="${escapeHtml(data.slug || '')}"></td>
                <td class="col-parent" data-label="${i18n.parent || 'Parent'}"><select class="wbpg-row-parent">${parentOptionsHtml}</select></td>
                <td data-label="${i18n.content || 'Content'}"><textarea class="wbpg-row-content" placeholder="${i18n.placeholder_content}">${escapeHtml(data.content || '')}</textarea></td>
                <td class="col-action" data-label="Remove"><span class="wbpg-row-remove fa-solid fa-trash-can" title="Remove" role="button" tabindex="0"></span></td>
            </tr>
        `;
    }


    // Selection Logic
    $('#wbpg-select-all').on('change', function () {
        const isChecked = $(this).is(':checked');
        $('.wbpg-row-check:visible').prop('checked', isChecked).trigger('change');
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
            $('#wbpg-delete-selected-btn').show().html(`<i class="fa-solid fa-trash-can" aria-hidden="true" style="margin-right:4px;"></i> ${i18n.delete_selected.replace('%d', selectedCount)}`);
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

    // Remove row with Accessibility support (Enter/Space)
    $rowsContainer.on('click keydown', '.wbpg-row-remove', function (e) {
        if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;

        $(this).closest('tr').fadeOut(300, function () {
            $(this).remove();
            toggleBulkActions();
            if ($('.wbpg-row').length === 0) {
                $listWrapper.hide();
                $('#wbpg-select-all').prop('checked', false);
            }
        });
    });

    // Create All Pages
    $createBtn.on('click', async function () {
        const rows = $('.wbpg-row');
        const totalInList = rows.length;

        // Filter rows that have a title and are not already successfully created
        const toCreate = rows.filter(function () {
            const $row = $(this);
            const title = $row.find('.wbpg-row-title').val().trim();
            const $statusIcon = $row.find('.wbpg-status-icon');
            const isPendingOrError = $statusIcon.hasClass('pending') || $statusIcon.hasClass('error');
            return title !== '' && isPendingOrError;
        });

        if (toCreate.length === 0) {
            alert(i18n.error_no_title || 'No rows with titles found.');
            return;
        }

        const typeLabel = $('#wbpg-post-type option:selected').text();
        const confirmMsg = i18n.confirm_filled
            ? i18n.confirm_filled.replace('%d', toCreate.length).replace('%d', totalInList)
            : `${toCreate.length} out of ${totalInList} is filled, can I create?`;

        if (!confirm(confirmMsg)) return;

        isCreating = true;
        $createBtn.prop('disabled', true).text(i18n.creating);
        $summaryBox.show();
        $progressBar.css('width', '0%');

        // Removed auto-scroll to summary during creation as requested

        let completed = 0;
        let successCount = 0;
        const total = toCreate.length;

        for (let i = 0; i < toCreate.length; i++) {
            const $row = $(toCreate[i]);
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
            $row.find('.wbpg-row-title, .wbpg-row-slug').css('border-color', 'var(--wbpg-border)');
            $statusIcon.attr('class', 'wbpg-status-icon loading').attr('title', i18n.creating).html('<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>');

            // Quick Client-Side Slug Collision Check (within the current list)
            const slug = data.slug.toLowerCase();
            if (slug && rows.toArray().some((r, idx) => {
                const $otherRow = $(r);
                if ($otherRow.is($row)) return false;
                return $otherRow.find('.wbpg-row-slug').val().trim().toLowerCase() === slug;
            })) {
                $statusIcon.attr('class', 'wbpg-status-icon error').attr('title', i18n.error_duplicate_slug || 'Duplicate slug in list').html('<i class="fa-solid fa-clone"></i>');
                $row.find('.wbpg-row-slug').css('border-color', 'var(--wbpg-error)');
                completed++;
                updateProgress(successCount, total, completed);
                continue;
            }

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
                    $row.find('.wbpg-row-title').after(`<div class="wbpg-view-link" style="font-size:11px; margin-top:4px;"><a href="${escapeHtml(response.link)}" target="_blank">${i18n.view.replace('%s', escapeHtml(typeLabel))}</a></div>`);
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
                } else if (error.statusText) {
                    msg = `${error.status} ${error.statusText}`;
                } else if (error.responseText) {
                    msg = error.responseText.substring(0, 100);
                }
                $statusIcon.attr('class', 'wbpg-status-icon error').attr('title', msg).html('<i class="fa-solid fa-triangle-exclamation"></i>');
            }

            completed++;
            updateProgress(successCount, total, completed);
        }

        // Show skipped status for rows we are not processing
        rows.not(toCreate).each(function () {
            const $row = $(this);
            const $statusIcon = $row.find('.wbpg-status-icon');
            if ($statusIcon.hasClass('pending')) {
                $statusIcon.attr('class', 'wbpg-status-icon skipped').attr('title', i18n.skipped || 'Skipped').html('<i class="fa-solid fa-forward-step" aria-hidden="true"></i>');
            }
        });

        isCreating = false;
        $createBtn.prop('disabled', false).text(i18n.create_btn.replace('%s', typeLabel));

        // UI Transition after creation
        if (successCount > 0) {
            transitionToResults();
        } else {
            $('#wbpg-start-over-btn').show();
        }
    });

    function transitionToResults() {
        const typeLabel = $('#wbpg-post-type option:selected').text();
        const $resultsContainer = $('#wbpg-results-container');
        const $resultsList = $('#wbpg-results-list');

        $resultsList.empty();

        // Hide table container
        $listWrapper.fadeOut(400);

        // Show "Start Over" button
        $('#wbpg-start-over-btn').fadeIn(400);

        // Collect and show successes
        $('.wbpg-row .wbpg-status-icon.success').each(function () {
            const $row = $(this).closest('tr');
            const title = $row.find('.wbpg-row-title').val();
            const link = $row.find('.wbpg-view-link a').attr('href');

            const resultHtml = `
                <div class="wbpg-result-item">
                    <div class="wbpg-result-info">
                        <span class="wbpg-result-title" title="${escapeHtml(title)}">${escapeHtml(title)}</span>
                        <span class="wbpg-result-type">${escapeHtml(typeLabel)}</span>
                    </div>
                    <a href="${escapeHtml(link)}" target="_blank" class="wbpg-result-link" title="Open in new tab" aria-label="Open ${escapeHtml(title)} in new tab">
                        <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
                    </a>
                </div>
            `;
            $resultsList.append(resultHtml);
        });

        $resultsContainer.fadeIn(600);
    }

    // Start Over Logic
    $(document).on('click', '#wbpg-start-over-btn', function () {
        const typeLabel = (availablePostTypes[currentPostType] || {}).name || 'Page';

        // Hide summary and results
        $summaryBox.fadeOut(300);
        $('#wbpg-results-container').hide();
        $('#wbpg-start-over-btn').hide();

        // Reset Table
        $rowsContainer.empty();
        $listWrapper.hide();
        $('#wbpg-select-all').prop('checked', false);
        $('#wbpg-delete-selected-btn').hide();

        // Reset selection
        $('#wbpg-post-type').val('');
        $('#wbpg-generate-row').hide();
        currentPostType = '';

        // Reset Progress
        $progressBar.css('width', '0%');
        updateProgress(0, 0, 0);

        // Reset Create Button
        $createBtn.prop('disabled', false).text(i18n.create_btn.replace('%s', typeLabel));

        // Scroll and focus
        $('html, body').animate({
            scrollTop: $('.wbpg-setup').offset().top - 50
        }, 500, function () {
            $('#wbpg-post-type').focus();
        });
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
        const percentage = total > 0 ? (attempted / total) * 100 : 0;
        const typeLabel = $('#wbpg-post-type option:selected').text();
        const $icon = (attempted === total && successCount === total) ? '<i class="fa-solid fa-circle-check" aria-hidden="true" style="margin-right:8px;"></i>' : '';
        $progressBar.css('width', percentage + '%');
        $('#wbpg-progress-bar-container').attr('aria-valuenow', Math.round(percentage));

        let formatted = i18n.success_msg
            .replace('%d', successCount)
            .replace('%d', total)
            .replace('%s', escapeHtml(typeLabel));

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
