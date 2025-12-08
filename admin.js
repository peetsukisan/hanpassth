// Admin Panel JavaScript

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize tabs
    initTabs();

    // Load data
    await loadPromotions();
    await loadGuides();
});

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
        });
    });
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
                <td colspan="5">ยังไม่มีโปรโมชั่น <a href="#" onclick="openPromoModal()">เพิ่มโปรโมชั่นแรก</a></td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = promotions.map(promo => `
        <tr>
            <td>
                <strong>${promo.title || '-'}</strong>
                ${promo.subtitle ? `<br><small style="color: #999;">${promo.subtitle}</small>` : ''}
            </td>
            <td><span class="status-badge" style="background: rgba(43, 74, 207, 0.1); color: var(--primary-blue);">${promo.badge || 'EVENT'}</span></td>
            <td><span class="status-badge ${promo.isActive ? 'active' : 'inactive'}">${promo.isActive ? 'เปิดใช้งาน' : 'ปิด'}</span></td>
            <td>${formatDate(promo.createdAt)}</td>
            <td>
                <div class="action-buttons">
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
        document.getElementById('promo-description').value = promoData.description || '';
        document.getElementById('promo-start-date').value = promoData.startDate || '';
        document.getElementById('promo-end-date').value = promoData.endDate || '';
        document.getElementById('promo-active').checked = promoData.isActive !== false;

        // Set background type
        if (promoData.backgroundImage) {
            document.getElementById('bg-type-image').checked = true;
            toggleBgType();
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

    const div = document.createElement('div');
    div.className = 'section-item';
    div.innerHTML = `
        <input type="text" placeholder="หัวข้อ Section" class="section-title" value="${data?.title || ''}">
        <textarea placeholder="เนื้อหา" class="section-content" rows="3">${data?.content || ''}</textarea>
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">ลบ Section</button>
    `;
    container.appendChild(div);
}

async function savePromotion(e) {
    e.preventDefault();

    const id = document.getElementById('promo-id').value;
    const isImageBg = document.getElementById('bg-type-image').checked;

    // Collect sections
    const sectionsElements = document.querySelectorAll('#promo-sections .section-item');
    const sections = Array.from(sectionsElements).map(el => ({
        title: el.querySelector('.section-title').value,
        content: el.querySelector('.section-content').value
    })).filter(s => s.title || s.content);

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
        description: document.getElementById('promo-description').value,
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
        showToast('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
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
                <td colspan="5">ยังไม่มีขั้นตอน <a href="#" onclick="openGuideModal()">เพิ่มขั้นตอนแรก</a></td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = guides.map(guide => `
        <tr>
            <td><strong style="color: var(--primary-blue);">${guide.order || '-'}</strong></td>
            <td><strong>${guide.title || '-'}</strong></td>
            <td>${guide.description || '-'}</td>
            <td><span class="status-badge ${guide.isActive ? 'active' : 'inactive'}">${guide.isActive ? 'เปิดใช้งาน' : 'ปิด'}</span></td>
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
    document.getElementById('guide-steps').innerHTML = '';

    if (guideData) {
        title.textContent = 'แก้ไขขั้นตอน';
        document.getElementById('guide-id').value = guideData.id;
        document.getElementById('guide-order').value = guideData.order || 1;
        document.getElementById('guide-title').value = guideData.title || '';
        document.getElementById('guide-description').value = guideData.description || '';
        document.getElementById('guide-icon').value = guideData.icon || 'user-plus';
        document.getElementById('guide-active').checked = guideData.isActive !== false;

        // Load steps
        if (guideData.steps && guideData.steps.length > 0) {
            guideData.steps.forEach(step => addGuideStep(step));
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

    const data = {
        order: parseInt(document.getElementById('guide-order').value) || 1,
        title: document.getElementById('guide-title').value,
        description: document.getElementById('guide-description').value,
        icon: document.getElementById('guide-icon').value,
        isActive: document.getElementById('guide-active').checked,
        steps: steps
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
