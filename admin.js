// Admin Panel JavaScript

// Quill editor instance
let quillEditor = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize tabs
    initTabs();

    // Initialize Quill editor
    initQuillEditor();

    // Load data
    await loadPromotions();
    await loadGuides();
    await loadPopups();
    await loadFaqsAdmin();
});

// ==================== QUILL EDITOR ====================

function initQuillEditor() {
    const editorContainer = document.getElementById('quill-editor');
    if (editorContainer && typeof Quill !== 'undefined') {
        quillEditor = new Quill('#quill-editor', {
            theme: 'snow',
            placeholder: 'เขียนเนื้อหาที่นี่...',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    [{ 'align': [] }],
                    ['link', 'image'],
                    ['clean']
                ]
            }
        });
    }
}

// Toggle content type (page vs external link)
function toggleContentType() {
    const isExternalLink = document.getElementById('content-type-link').checked;
    const externalGroup = document.getElementById('external-link-group');
    const editorGroup = document.getElementById('content-editor-group');

    if (isExternalLink) {
        externalGroup.style.display = 'block';
        editorGroup.style.display = 'none';
    } else {
        externalGroup.style.display = 'none';
        editorGroup.style.display = 'block';
    }
}

// ==================== GUIDE TOGGLE FUNCTIONS ====================

// Toggle guide display type (icon vs image)
function toggleGuideDisplayType() {
    const isImage = document.getElementById('guide-display-image').checked;
    document.getElementById('guide-icon-group').style.display = isImage ? 'none' : 'block';
    document.getElementById('guide-image-group').style.display = isImage ? 'block' : 'none';
}

// Toggle guide background type
function toggleGuideBgType() {
    const isImage = document.getElementById('guide-bg-type-image').checked;
    document.getElementById('guide-bg-color-group').style.display = isImage ? 'none' : 'block';
    document.getElementById('guide-bg-image-group').style.display = isImage ? 'block' : 'none';
}

// Toggle guide content type
function toggleGuideContentType() {
    const isLink = document.getElementById('guide-content-link').checked;
    document.getElementById('guide-external-link-group').style.display = isLink ? 'block' : 'none';
    document.getElementById('guide-content-editor-group').style.display = isLink ? 'none' : 'block';
}

// Quill editor for guides
let quillGuideEditor = null;

function initGuideQuillEditor() {
    const editorContainer = document.getElementById('quill-editor-guide');
    if (editorContainer && typeof Quill !== 'undefined' && !quillGuideEditor) {
        quillGuideEditor = new Quill('#quill-editor-guide', {
            theme: 'snow',
            placeholder: 'เขียนเนื้อหาที่นี่...',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                ]
            }
        });
    }
}

// Quill editor for FAQ
let quillFaqEditor = null;

function initFaqQuillEditor() {
    const wrapper = document.getElementById('faq-answer-wrapper');
    if (!wrapper || typeof Quill === 'undefined') return;

    // Remove ALL existing toolbars (Quill creates them as siblings before the container)
    const parent = wrapper.parentElement;
    if (parent) {
        const existingToolbars = parent.querySelectorAll('.ql-toolbar');
        existingToolbars.forEach(toolbar => toolbar.remove());
    }

    // Clear the wrapper and recreate editor container
    quillFaqEditor = null;
    wrapper.innerHTML = '<div id="faq-answer-editor"></div>';

    // Create fresh Quill instance
    quillFaqEditor = new Quill('#faq-answer-editor', {
        theme: 'snow',
        placeholder: 'พิมพ์คำตอบที่นี่...',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link'],
                ['clean']
            ]
        }
    });
}


// ==================== TAB NAVIGATION ====================

function initTabs() {
    const navItems = document.querySelectorAll('.nav-item[data-tab]');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab');

            // Update nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Update tab content
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.getElementById(`${tabId}-tab`).classList.add('active');

            // Load settings when settings tab is opened
            if (tabId === 'settings') {
                loadSettings();
            }
        });
    });
}

// ==================== POPUP ADS ====================

let popups = [];

async function loadPopups() {
    try {
        popups = await dbService.getPopups();
        renderPopupsTable();
        updateAddPopupButton();
    } catch (error) {
        console.error('Error loading popups:', error);
        showToast('เกิดข้อผิดพลาดในการโหลด Popup', 'error');
    }
}

function updateAddPopupButton() {
    const btn = document.getElementById('add-popup-btn');
    if (btn) {
        btn.disabled = popups.length >= 3;
        btn.style.opacity = popups.length >= 3 ? '0.5' : '1';
    }
}

function renderPopupsTable() {
    const tbody = document.getElementById('popups-table-body');
    if (!tbody) return;

    if (popups.length === 0) {
        tbody.innerHTML = `
            <tr class="loading-row">
                <td colspan="5">ยังไม่มี Popup <a href="#" onclick="openPopupModal()">เพิ่ม Popup แรก</a></td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = popups.map(popup => `
        <tr>
            <td>
                <input type="number" class="order-input" value="${popup.order || 1}" 
                    min="1" onchange="updatePopupOrder('${popup.id}', this.value)" title="แก้ไขลำดับ">
            </td>
            <td>
                <strong>${popup.title || 'ไม่มีชื่อ'}</strong>
                <small style="display:block;color:#888;">${popup.type === 'image' ? '🖼️ รูปภาพ' : '📝 ข้อความ'}</small>
            </td>
            <td>
                <label class="toggle-switch">
                    <input type="checkbox" ${popup.isActive ? 'checked' : ''} onchange="togglePopupStatus('${popup.id}', this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </td>
            <td>${formatDate(popup.createdAt)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon edit" onclick="editPopup('${popup.id}')" title="แก้ไข">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        </svg>
                    </button>
                    <button class="btn-icon delete" onclick="deletePopup('${popup.id}')" title="ลบ">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function togglePopupType() {
    const isImage = document.getElementById('popup-type-image').checked;
    document.getElementById('popup-image-group').style.display = isImage ? 'block' : 'none';
    document.getElementById('popup-text-group').style.display = isImage ? 'none' : 'block';
}

function openPopupModal(popupData = null) {
    if (!popupData && popups.length >= 3) {
        showToast('สามารถมี Popup ได้สูงสุด 3 อัน', 'error');
        return;
    }

    const modal = document.getElementById('popup-modal');
    const form = document.getElementById('popup-form');
    const title = document.getElementById('popup-modal-title');

    form.reset();
    document.getElementById('popup-type-image').checked = true;
    togglePopupType();

    if (popupData) {
        title.textContent = 'แก้ไข Popup';
        document.getElementById('popup-id').value = popupData.id;
        document.getElementById('popup-order').value = popupData.order || 1;
        document.getElementById('popup-title').value = popupData.title || '';
        document.getElementById('popup-image').value = popupData.image || '';
        document.getElementById('popup-heading').value = popupData.heading || '';
        document.getElementById('popup-message').value = popupData.message || '';
        document.getElementById('popup-button-text').value = popupData.buttonText || 'ดูเพิ่มเติม';
        document.getElementById('popup-link').value = popupData.link || '';
        document.getElementById('popup-active').checked = popupData.isActive !== false;

        if (popupData.type === 'text') {
            document.getElementById('popup-type-text').checked = true;
            togglePopupType();
        }
    } else {
        title.textContent = 'เพิ่ม Popup';
        document.getElementById('popup-id').value = '';
        document.getElementById('popup-order').value = popups.length + 1;
        document.getElementById('popup-active').checked = true;
    }

    modal.classList.add('active');
}

function closePopupModal() {
    document.getElementById('popup-modal').classList.remove('active');
}

async function savePopup(e) {
    e.preventDefault();

    const id = document.getElementById('popup-id').value;
    const isImage = document.getElementById('popup-type-image').checked;

    const data = {
        order: parseInt(document.getElementById('popup-order').value) || 1,
        title: document.getElementById('popup-title').value,
        type: isImage ? 'image' : 'text',
        image: isImage ? document.getElementById('popup-image').value : '',
        heading: !isImage ? document.getElementById('popup-heading').value : '',
        message: !isImage ? document.getElementById('popup-message').value : '',
        buttonText: document.getElementById('popup-button-text').value || 'ดูเพิ่มเติม',
        link: document.getElementById('popup-link').value,
        isActive: document.getElementById('popup-active').checked
    };

    try {
        if (id) {
            await dbService.updatePopup(id, data);
            showToast('อัพเดท Popup สำเร็จ', 'success');
        } else {
            await dbService.addPopup(data);
            showToast('เพิ่ม Popup สำเร็จ', 'success');
        }
        closePopupModal();
        await loadPopups();
    } catch (error) {
        console.error('Error saving popup:', error);
        showToast('เกิดข้อผิดพลาด', 'error');
    }
}

function editPopup(id) {
    const popup = popups.find(p => p.id === id);
    if (popup) openPopupModal(popup);
}

async function deletePopup(id) {
    if (!confirm('ต้องการลบ Popup นี้?')) return;

    try {
        await dbService.deletePopup(id);
        showToast('ลบ Popup สำเร็จ', 'success');
        await loadPopups();
    } catch (error) {
        console.error('Error deleting popup:', error);
        showToast('เกิดข้อผิดพลาด', 'error');
    }
}

async function togglePopupStatus(id, isActive) {
    try {
        await dbService.updatePopup(id, { isActive });
        showToast(isActive ? 'เปิด Popup แล้ว' : 'ปิด Popup แล้ว', 'success');
        const popup = popups.find(p => p.id === id);
        if (popup) popup.isActive = isActive;
    } catch (error) {
        console.error('Error:', error);
        showToast('เกิดข้อผิดพลาด', 'error');
        await loadPopups();
    }
}

// ==================== PROMOTIONS ====================

let promotions = [];

async function loadPromotions() {
    try {
        promotions = await dbService.getPromotions();
        renderPromotionsTable();
    } catch (error) {
        console.error('Error loading promotions:', error);
        showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    }
}

function renderPromotionsTable() {
    const tbody = document.getElementById('promotions-table-body');

    if (promotions.length === 0) {
        tbody.innerHTML = `
            <tr class="loading-row">
                <td colspan="7">ยังไม่มีโปรโมชั่น <a href="#" onclick="openPromoModal()">เพิ่มโปรโมชั่นแรก</a></td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = promotions.map((promo, index) => `
        <tr>
            <td>
                <input type="number" class="order-input" value="${promo.order || index + 1}" 
                    min="1" onchange="updatePromoOrder('${promo.id}', this.value)" title="แก้ไขลำดับ">
            </td>
            <td>
                <strong>${promo.title || '-'}</strong>
                ${promo.subtitle ? `<br><small style="color: #999;">${promo.subtitle}</small>` : ''}
            </td>
            <td>
                <select class="inline-badge-select" onchange="updatePromoBadge('${promo.id}', this.value)">
                    <option value="EVENT" ${promo.badge === 'EVENT' ? 'selected' : ''}>EVENT</option>
                    <option value="HOT" ${promo.badge === 'HOT' ? 'selected' : ''}>HOT</option>
                    <option value="NEW" ${promo.badge === 'NEW' ? 'selected' : ''}>NEW</option>
                    <option value="SALE" ${promo.badge === 'SALE' ? 'selected' : ''}>SALE</option>
                    <option value="SPECIAL" ${promo.badge === 'SPECIAL' ? 'selected' : ''}>SPECIAL</option>
                </select>
            </td>
            <td>
                <label class="toggle-switch">
                    <input type="checkbox" ${promo.isActive ? 'checked' : ''} onchange="togglePromoStatus('${promo.id}', this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </td>
            <td>${promo.startDate || '-'}</td>
            <td>${promo.endDate || '-'}</td>
            <td>
                <div class="action-buttons">
                    <a href="promo-detail.html?id=${promo.id}" target="_blank" class="btn-icon preview" title="ดูตัวอย่าง">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </a>
                    <button class="btn-icon edit" onclick="editPromotion('${promo.id}')" title="แก้ไข">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        </svg>
                    </button>
                    <button class="btn-icon delete" onclick="deletePromotion('${promo.id}')" title="ลบ">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openPromoModal(promoData = null) {
    const modal = document.getElementById('promo-modal');
    const form = document.getElementById('promo-form');
    const title = document.getElementById('promo-modal-title');

    // Reset form
    form.reset();
    document.getElementById('promo-sections').innerHTML = '';

    // Reset background type
    document.getElementById('bg-type-color').checked = true;
    toggleBgType();

    // Reset content type
    document.getElementById('content-type-page').checked = true;
    toggleContentType();

    // Reset Quill editor
    if (quillEditor) {
        quillEditor.root.innerHTML = '';
    }
    document.getElementById('promo-external-url').value = '';

    if (promoData) {
        title.textContent = 'แก้ไขโปรโมชั่น';
        document.getElementById('promo-id').value = promoData.id;
        document.getElementById('promo-title').value = promoData.title || '';
        document.getElementById('promo-subtitle').value = promoData.subtitle || '';
        document.getElementById('promo-badge').value = promoData.badge || '';
        document.getElementById('promo-badge-style').value = promoData.badgeStyle || 'default';
        document.getElementById('promo-bg').value = promoData.backgroundColor || '';
        document.getElementById('promo-bg-image').value = promoData.backgroundImage || '';
        document.getElementById('promo-display-mode').value = promoData.displayMode || 'text-overlay';
        document.getElementById('promo-card-type').value = promoData.cardType || 'banner';
        document.getElementById('promo-text-color').value = promoData.textColor || 'light';
        document.getElementById('promo-start-date').value = promoData.startDate || '';
        document.getElementById('promo-end-date').value = promoData.endDate || '';
        document.getElementById('promo-active').checked = promoData.isActive !== false;

        // Set background type
        if (promoData.backgroundImage) {
            document.getElementById('bg-type-image').checked = true;
            toggleBgType();
        }

        // Set content type
        if (promoData.contentType === 'link') {
            document.getElementById('content-type-link').checked = true;
            toggleContentType();
            document.getElementById('promo-external-url').value = promoData.externalUrl || '';
        } else {
            // Load rich content into Quill
            if (quillEditor && promoData.richContent) {
                quillEditor.root.innerHTML = promoData.richContent;
            }
        }

        // Load sections
        if (promoData.sections && promoData.sections.length > 0) {
            promoData.sections.forEach(section => addPromoSection(section));
        }
    } else {
        title.textContent = 'เพิ่มโปรโมชั่น';
        document.getElementById('promo-id').value = '';
        document.getElementById('promo-active').checked = true;
        document.getElementById('promo-card-type').value = 'banner';
    }

    modal.classList.add('active');
}

// Toggle background type (color vs image)
function toggleBgType() {
    const isImage = document.getElementById('bg-type-image').checked;
    document.getElementById('bg-color-group').style.display = isImage ? 'none' : 'block';
    document.getElementById('bg-image-group').style.display = isImage ? 'block' : 'none';
}

function closePromoModal() {
    document.getElementById('promo-modal').classList.remove('active');
}

function addPromoSection(data = null) {
    const container = document.getElementById('promo-sections');
    const index = container.children.length;
    const editorId = `section-editor-${index}`;

    const div = document.createElement('div');
    div.className = 'section-item';
    div.innerHTML = `
        <input type="text" placeholder="หัวข้อ Section" class="section-title" value="${data?.title || ''}">
        <div class="section-editor-container">
            <div id="${editorId}" class="section-quill"></div>
        </div>
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">ลบ Section</button>
    `;
    container.appendChild(div);

    // Initialize Quill for this section with WordPress-like toolbar
    const quill = new Quill(`#${editorId}`, {
        theme: 'snow',
        placeholder: 'เนื้อหา Section...',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });

    // Set initial content if data exists
    if (data?.content) {
        quill.root.innerHTML = data.content;
    }

    // Store quill reference on the div
    div.quillEditor = quill;
}

async function savePromotion(e) {
    e.preventDefault();

    const id = document.getElementById('promo-id').value;
    const isImageBg = document.getElementById('bg-type-image').checked;

    // Collect sections from Quill editors
    const sectionsElements = document.querySelectorAll('#promo-sections .section-item');
    const sections = Array.from(sectionsElements).map(el => ({
        title: el.querySelector('.section-title').value,
        content: el.quillEditor ? el.quillEditor.root.innerHTML : ''
    })).filter(s => s.title || (s.content && s.content !== '<p><br></p>'));

    const data = {
        title: document.getElementById('promo-title').value,
        subtitle: document.getElementById('promo-subtitle').value,
        badge: document.getElementById('promo-badge').value || 'EVENT',
        badgeStyle: document.getElementById('promo-badge-style').value,
        backgroundColor: isImageBg ? '' : (document.getElementById('promo-bg').value || 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'),
        backgroundImage: isImageBg ? document.getElementById('promo-bg-image').value : '',
        displayMode: document.getElementById('promo-display-mode').value,
        cardType: document.getElementById('promo-card-type').value,
        textColor: document.getElementById('promo-text-color').value,
        contentType: document.getElementById('content-type-link').checked ? 'link' : 'page',
        externalUrl: document.getElementById('content-type-link').checked ? document.getElementById('promo-external-url').value : '',
        richContent: quillEditor ? quillEditor.root.innerHTML : '',
        startDate: document.getElementById('promo-start-date').value,
        endDate: document.getElementById('promo-end-date').value,
        isActive: document.getElementById('promo-active').checked,
        sections: sections
    };

    try {
        if (id) {
            await dbService.updatePromotion(id, data);
            showToast('อัปเดตโปรโมชั่นสำเร็จ', 'success');
        } else {
            await dbService.addPromotion(data);
            showToast('เพิ่มโปรโมชั่นสำเร็จ', 'success');
        }

        closePromoModal();
        await loadPromotions();
    } catch (error) {
        console.error('Error saving promotion:', error);
        showToast('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
    }
}

function editPromotion(id) {
    const promo = promotions.find(p => p.id === id);
    if (promo) {
        openPromoModal(promo);
    }
}

async function deletePromotion(id) {
    if (!confirm('ต้องการลบโปรโมชั่นนี้?')) return;

    try {
        await dbService.deletePromotion(id);
        showToast('ลบโปรโมชั่นสำเร็จ', 'success');
        await loadPromotions();
    } catch (error) {
        console.error('Error deleting promotion:', error);
        showToast('เกิดข้อผิดพลาด', 'error');
    }
}

// Toggle promotion active status
async function togglePromoStatus(id, isActive) {
    try {
        await dbService.updatePromotion(id, { isActive: isActive });
        showToast(isActive ? 'เปิดใช้งานแล้ว' : 'ปิดใช้งานแล้ว', 'success');
        const promo = promotions.find(p => p.id === id);
        if (promo) promo.isActive = isActive;
    } catch (error) {
        console.error('Error updating status:', error);
        showToast('เกิดข้อผิดพลาด', 'error');
        await loadPromotions();
    }
}

// Update promotion badge inline
async function updatePromoBadge(id, badge) {
    try {
        await dbService.updatePromotion(id, { badge: badge });
        showToast('อัพเดท Badge สำเร็จ', 'success');
        const promo = promotions.find(p => p.id === id);
        if (promo) promo.badge = badge;
    } catch (error) {
        console.error('Error updating badge:', error);
        showToast('เกิดข้อผิดพลาด', 'error');
        await loadPromotions();
    }
}

// ==================== GUIDES ====================

let guides = [];

async function loadGuides() {
    try {
        guides = await dbService.getGuides();
        renderGuidesTable();
    } catch (error) {
        console.error('Error loading guides:', error);
        showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    }
}

function renderGuidesTable() {
    const tbody = document.getElementById('guides-table-body');

    if (guides.length === 0) {
        tbody.innerHTML = `
            <tr class="loading-row">
                <td colspan="6">ยังไม่มีขั้นตอน <a href="#" onclick="openGuideModal()">เพิ่มขั้นตอนแรก</a></td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = guides.map(guide => `
        <tr>
            <td>
                <input type="number" class="order-input" value="${guide.order || 1}" 
                    min="1" onchange="updateGuideOrder('${guide.id}', this.value)" title="แก้ไขลำดับ">
            </td>
            <td><strong>${guide.title || '-'}</strong></td>
            <td>${guide.description || '-'}</td>
            <td>
                <label class="toggle-switch">
                    <input type="checkbox" ${guide.isActive ? 'checked' : ''} onchange="toggleGuideStatus('${guide.id}', this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </td>
            <td>${formatDate(guide.createdAt)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon edit" onclick="editGuide('${guide.id}')" title="แก้ไข">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        </svg>
                    </button>
                    <button class="btn-icon delete" onclick="deleteGuide('${guide.id}')" title="ลบ">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openGuideModal(guideData = null) {
    const modal = document.getElementById('guide-modal');
    const form = document.getElementById('guide-form');
    const title = document.getElementById('guide-modal-title');

    // Reset form
    form.reset();

    // Initialize Quill editor for guide
    initGuideQuillEditor();
    if (quillGuideEditor) {
        quillGuideEditor.root.innerHTML = '';
    }

    // Reset toggles
    document.getElementById('guide-display-icon').checked = true;
    toggleGuideDisplayType();
    document.getElementById('guide-bg-type-color').checked = true;
    toggleGuideBgType();
    document.getElementById('guide-content-page').checked = true;
    toggleGuideContentType();

    if (guideData) {
        title.textContent = 'แก้ไขขั้นตอน';
        document.getElementById('guide-id').value = guideData.id;
        document.getElementById('guide-order').value = guideData.order || 1;
        document.getElementById('guide-title').value = guideData.title || '';
        document.getElementById('guide-description').value = guideData.description || '';
        document.getElementById('guide-icon').value = guideData.icon || 'user-plus';
        document.getElementById('guide-active').checked = guideData.isActive !== false;

        // Display type
        if (guideData.displayType === 'image') {
            document.getElementById('guide-display-image').checked = true;
            toggleGuideDisplayType();
            document.getElementById('guide-image').value = guideData.image || '';
        }

        // Background
        if (guideData.backgroundImage) {
            document.getElementById('guide-bg-type-image').checked = true;
            toggleGuideBgType();
            document.getElementById('guide-bg-image').value = guideData.backgroundImage || '';
        } else {
            document.getElementById('guide-bg').value = guideData.backgroundColor || '';
        }

        // Content type
        if (guideData.contentType === 'link') {
            document.getElementById('guide-content-link').checked = true;
            toggleGuideContentType();
            document.getElementById('guide-external-url').value = guideData.externalUrl || '';
        } else {
            if (quillGuideEditor && guideData.richContent) {
                quillGuideEditor.root.innerHTML = guideData.richContent;
            }
        }
    } else {
        title.textContent = 'เพิ่มขั้นตอน';
        document.getElementById('guide-id').value = '';
        document.getElementById('guide-order').value = guides.length + 1;
        document.getElementById('guide-active').checked = true;
    }

    modal.classList.add('active');
}

function closeGuideModal() {
    document.getElementById('guide-modal').classList.remove('active');
}

function addGuideStep(data = null) {
    const container = document.getElementById('guide-steps');
    const index = container.children.length + 1;

    const div = document.createElement('div');
    div.className = 'step-item';
    div.innerHTML = `
        <input type="text" placeholder="หัวข้อขั้นตอนที่ ${index}" class="step-title" value="${data?.title || ''}">
        <textarea placeholder="รายละเอียด" class="step-content" rows="2">${data?.content || ''}</textarea>
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">ลบขั้นตอน</button>
    `;
    container.appendChild(div);
}

async function saveGuide(e) {
    e.preventDefault();

    const id = document.getElementById('guide-id').value;

    // Collect steps
    const stepsElements = document.querySelectorAll('#guide-steps .step-item');
    const steps = Array.from(stepsElements).map(el => ({
        title: el.querySelector('.step-title').value,
        content: el.querySelector('.step-content').value
    })).filter(s => s.title || s.content);

    const isImageDisplay = document.getElementById('guide-display-image').checked;
    const isImageBg = document.getElementById('guide-bg-type-image').checked;
    const isExternalLink = document.getElementById('guide-content-link').checked;

    const data = {
        order: parseInt(document.getElementById('guide-order').value) || 1,
        title: document.getElementById('guide-title').value,
        description: document.getElementById('guide-description').value,
        displayType: isImageDisplay ? 'image' : 'icon',
        icon: isImageDisplay ? '' : document.getElementById('guide-icon').value,
        image: isImageDisplay ? document.getElementById('guide-image').value : '',
        backgroundColor: isImageBg ? '' : (document.getElementById('guide-bg').value || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'),
        backgroundImage: isImageBg ? document.getElementById('guide-bg-image').value : '',
        contentType: isExternalLink ? 'link' : 'page',
        externalUrl: isExternalLink ? document.getElementById('guide-external-url').value : '',
        richContent: quillGuideEditor ? quillGuideEditor.root.innerHTML : '',
        isActive: document.getElementById('guide-active').checked
    };

    try {
        if (id) {
            await dbService.updateGuide(id, data);
            showToast('อัปเดตขั้นตอนสำเร็จ', 'success');
        } else {
            await dbService.addGuide(data);
            showToast('เพิ่มขั้นตอนสำเร็จ', 'success');
        }

        closeGuideModal();
        await loadGuides();
    } catch (error) {
        console.error('Error saving guide:', error);
        showToast('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
    }
}

function editGuide(id) {
    const guide = guides.find(g => g.id === id);
    if (guide) {
        openGuideModal(guide);
    }
}

async function deleteGuide(id) {
    if (!confirm('ต้องการลบขั้นตอนนี้?')) return;

    try {
        await dbService.deleteGuide(id);
        showToast('ลบขั้นตอนสำเร็จ', 'success');
        await loadGuides();
    } catch (error) {
        console.error('Error deleting guide:', error);
        showToast('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
    }
}

// Toggle guide active status
async function toggleGuideStatus(id, isActive) {
    try {
        await dbService.updateGuide(id, { isActive: isActive });
        showToast(isActive ? 'เปิดใช้งานแล้ว' : 'ปิดใช้งานแล้ว', 'success');
        const guide = guides.find(g => g.id === id);
        if (guide) guide.isActive = isActive;
    } catch (error) {
        console.error('Error updating status:', error);
        showToast('เกิดข้อผิดพลาด', 'error');
        await loadGuides();
    }
}

// ==================== UTILITY ====================

function formatDate(timestamp) {
    if (!timestamp) return '-';
    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return '-';
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==================== FAQ MANAGEMENT ====================

let faqs = [];

async function loadFaqsAdmin() {
    try {
        faqs = await dbService.getFaqs(false);
        renderFaqsTable();
    } catch (error) {
        console.error('Error loading FAQs:', error);
        showToast('เกิดข้อผิดพลาดในการโหลด FAQ', 'error');
    }
}

function renderFaqsTable() {
    const tbody = document.getElementById('faq-table-body');

    if (!tbody) return;

    if (faqs.length === 0) {
        tbody.innerHTML = `
            <tr class="loading-row">
                <td colspan="5">ยังไม่มี FAQ <a href="#" onclick="openFaqModal()">เพิ่ม FAQ แรก</a></td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = faqs.map((faq, index) => `
        <tr>
            <td>
                <input type="number" class="order-input" value="${faq.order || index + 1}" 
                    min="1" onchange="updateFaqOrder('${faq.id}', this.value)" title="แก้ไขลำดับ">
            </td>
            <td><strong>${faq.question || '-'}</strong></td>
            <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${faq.answer || '-'}</td>
            <td>
                <label class="toggle-switch">
                    <input type="checkbox" ${faq.isActive ? 'checked' : ''} onchange="toggleFaqStatus('${faq.id}', this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon edit" onclick="editFaq('${faq.id}')" title="แก้ไข">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        </svg>
                    </button>
                    <button class="btn-icon delete" onclick="deleteFaq('${faq.id}')" title="ลบ">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openFaqModal(faqData = null) {
    const modal = document.getElementById('faq-modal');
    const form = document.getElementById('faq-form');
    const title = document.getElementById('faq-modal-title');

    // Reset form
    form.reset();
    document.getElementById('faq-id').value = '';

    // Initialize Quill editor for FAQ
    initFaqQuillEditor();

    if (faqData) {
        title.textContent = 'แก้ไข FAQ';
        document.getElementById('faq-id').value = faqData.id;
        document.getElementById('faq-order').value = faqData.order || 1;
        document.getElementById('faq-question').value = faqData.question || '';
        // Load content into Quill editor
        if (quillFaqEditor) {
            quillFaqEditor.root.innerHTML = faqData.answer || '';
        }
        document.getElementById('faq-active').checked = faqData.isActive !== false;
    } else {
        title.textContent = 'เพิ่ม FAQ ใหม่';
        document.getElementById('faq-order').value = faqs.length + 1;
        document.getElementById('faq-active').checked = true;
        // Clear Quill editor
        if (quillFaqEditor) {
            quillFaqEditor.root.innerHTML = '';
        }
    }

    modal.classList.add('active');
}

function closeFaqModal() {
    const modal = document.getElementById('faq-modal');
    modal.classList.remove('active');
}

async function saveFaq() {
    const id = document.getElementById('faq-id').value;
    const order = parseInt(document.getElementById('faq-order').value) || 1;
    const question = document.getElementById('faq-question').value.trim();
    // Get answer from Quill editor
    const answer = quillFaqEditor ? quillFaqEditor.root.innerHTML : '';
    const isActive = document.getElementById('faq-active').checked;

    // Check if answer is empty (Quill returns <p><br></p> for empty content)
    const isAnswerEmpty = !answer || answer === '<p><br></p>' || answer.trim() === '';

    if (!question || isAnswerEmpty) {
        showToast('กรุณากรอกคำถามและคำตอบ', 'error');
        return;
    }

    try {
        const faqData = {
            order,
            question,
            answer,
            isActive
        };

        if (id) {
            await dbService.updateFaq(id, faqData);
            showToast('แก้ไข FAQ สำเร็จ', 'success');
        } else {
            await dbService.addFaq(faqData);
            showToast('เพิ่ม FAQ สำเร็จ', 'success');
        }

        closeFaqModal();
        await loadFaqsAdmin();
    } catch (error) {
        console.error('Error saving FAQ:', error);
        showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
    }
}

function editFaq(id) {
    const faq = faqs.find(f => f.id === id);
    if (faq) {
        openFaqModal(faq);
    }
}

async function deleteFaq(id) {
    if (!confirm('คุณต้องการลบ FAQ นี้ใช่หรือไม่?')) return;

    try {
        await dbService.deleteFaq(id);
        showToast('ลบ FAQ สำเร็จ', 'success');
        await loadFaqsAdmin();
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        showToast('เกิดข้อผิดพลาดในการลบ', 'error');
    }
}

async function toggleFaqStatus(id, isActive) {
    try {
        await dbService.updateFaq(id, { isActive });
        showToast(isActive ? 'เปิด FAQ แล้ว' : 'ปิด FAQ แล้ว', 'success');
        const faq = faqs.find(f => f.id === id);
        if (faq) faq.isActive = isActive;
    } catch (error) {
        console.error('Error:', error);
        showToast('เกิดข้อผิดพลาด', 'error');
        await loadFaqsAdmin();
    }
}

// Expose functions globally
window.openPromoModal = openPromoModal;
window.closePromoModal = closePromoModal;
window.addPromoSection = addPromoSection;
window.savePromotion = savePromotion;
window.editPromotion = editPromotion;
window.deletePromotion = deletePromotion;

window.openGuideModal = openGuideModal;
window.closeGuideModal = closeGuideModal;
window.addGuideStep = addGuideStep;
window.saveGuide = saveGuide;
window.editGuide = editGuide;
window.deleteGuide = deleteGuide;
window.toggleBgType = toggleBgType;
window.toggleContentType = toggleContentType;
window.togglePromoStatus = togglePromoStatus;
window.updatePromoBadge = updatePromoBadge;
window.toggleGuideDisplayType = toggleGuideDisplayType;
window.toggleGuideBgType = toggleGuideBgType;
window.toggleGuideContentType = toggleGuideContentType;
window.toggleGuideStatus = toggleGuideStatus;

// Popup exports
window.openPopupModal = openPopupModal;
window.closePopupModal = closePopupModal;
window.savePopup = savePopup;
window.editPopup = editPopup;
window.deletePopup = deletePopup;
window.togglePopupType = togglePopupType;
window.togglePopupStatus = togglePopupStatus;

// FAQ exports
window.openFaqModal = openFaqModal;
window.closeFaqModal = closeFaqModal;
window.saveFaq = saveFaq;
window.editFaq = editFaq;
window.deleteFaq = deleteFaq;
window.toggleFaqStatus = toggleFaqStatus;

// Inline order update functions
async function updateFaqOrder(id, newOrder) {
    try {
        await dbService.updateFaq(id, { order: parseInt(newOrder) });
        showToast('อัพเดทลำดับเรียบร้อย', 'success');
        await loadFaqsAdmin();
    } catch (error) {
        console.error('Error updating order:', error);
        showToast('เกิดข้อผิดพลาด', 'error');
    }
}

async function updatePopupOrder(id, newOrder) {
    try {
        await dbService.updatePopup(id, { order: parseInt(newOrder) });
        showToast('อัพเดทลำดับเรียบร้อย', 'success');
        await loadPopupsAdmin();
    } catch (error) {
        console.error('Error updating order:', error);
        showToast('เกิดข้อผิดพลาด', 'error');
    }
}

async function updatePromoOrder(id, newOrder) {
    try {
        await dbService.updatePromotion(id, { order: parseInt(newOrder) });
        showToast('อัพเดทลำดับเรียบร้อย', 'success');
        await loadPromotionsAdmin();
    } catch (error) {
        console.error('Error updating order:', error);
        showToast('เกิดข้อผิดพลาด', 'error');
    }
}

async function updateGuideOrder(id, newOrder) {
    try {
        await dbService.updateGuide(id, { order: parseInt(newOrder) });
        showToast('อัพเดทลำดับเรียบร้อย', 'success');
        await loadGuidesAdmin();
    } catch (error) {
        console.error('Error updating order:', error);
        showToast('เกิดข้อผิดพลาด', 'error');
    }
}

window.updateFaqOrder = updateFaqOrder;
window.updatePopupOrder = updatePopupOrder;
window.updatePromoOrder = updatePromoOrder;
window.updateGuideOrder = updateGuideOrder;

// ==================== SITE SETTINGS ====================

async function loadSettings() {
    try {
        const settings = await dbService.getSiteSettings();
        if (settings) {
            document.getElementById('brand-name').value = settings.brandName || 'MyBrand';
            document.getElementById('logo-url').value = settings.logoUrl || '';
            document.getElementById('title-promotions').value = settings.sectionTitles?.promotions || 'โปรโมชั่นพิเศษ';
            document.getElementById('title-guides').value = settings.sectionTitles?.guides || 'ขั้นตอนการใช้งาน';
            document.getElementById('title-faqs').value = settings.sectionTitles?.faqs || 'ปัญหาที่พบบ่อย';
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

async function saveSettings(e) {
    e.preventDefault();

    const data = {
        brandName: document.getElementById('brand-name').value.trim() || 'MyBrand',
        logoUrl: document.getElementById('logo-url').value.trim(),
        sectionTitles: {
            promotions: document.getElementById('title-promotions').value.trim() || 'โปรโมชั่นพิเศษ',
            guides: document.getElementById('title-guides').value.trim() || 'ขั้นตอนการใช้งาน',
            faqs: document.getElementById('title-faqs').value.trim() || 'ปัญหาที่พบบ่อย'
        }
    };

    try {
        await dbService.updateSiteSettings(data);
        showToast('บันทึกการตั้งค่าเรียบร้อย', 'success');
    } catch (error) {
        console.error('Error saving settings:', error);
        showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
    }
}

window.loadSettings = loadSettings;
window.saveSettings = saveSettings;
