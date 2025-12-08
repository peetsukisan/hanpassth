// Main Script - Loads data from Firebase and handles interactions

// Icon SVGs for guides
const iconSvgs = {
    'user-plus': '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>',
    'credit-card': '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>',
    'star': '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v4"/><path d="m16.24 7.76-2.12 2.12"/><path d="M20 12h-4"/><path d="m16.24 16.24-2.12-2.12"/><path d="M12 20v-4"/><path d="m7.76 16.24 2.12-2.12"/><path d="M4 12h4"/><path d="m7.76 7.76 2.12 2.12"/></svg>',
    'check': '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>',
    'settings': '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    'search': '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    'gift': '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/></svg>'
};

// Card visual templates
const cardVisuals = {
    'credit-card': `
        <div class="card-visual card-visual-1">
            <div class="credit-card">
                <div class="card-chip"></div>
                <div class="card-number">•••• •••• •••• 1234</div>
            </div>
        </div>
    `,
    'bonus': `
        <div class="card-visual card-visual-2">
            <div class="bonus-tag">รับสูงสุด <strong>25,000฿</strong></div>
            <div class="emoji-container">
                <span class="emoji">😊</span>
                <span class="emoji">😄</span>
            </div>
        </div>
    `,
    'lifestyle': `
        <div class="card-visual card-visual-3">
            <div class="lifestyle-card">
                <span class="lifestyle-text">MyLife</span>
            </div>
        </div>
    `
};

let promotions = [];
let guides = [];
let currentIndex = 0;
let cardsPerView = 3;
let autoPlayInterval = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Load data from Firebase
    await loadPromotions();
    await loadGuides();

    // Initialize carousel
    initCarousel();

    // Initialize smooth scroll
    initSmoothScroll();

    // Initialize search
    initSearch();
});

// ==================== DATA LOADING ====================

async function loadPromotions() {
    try {
        promotions = await dbService.getPromotions(true); // Only active
        renderPromotions();
    } catch (error) {
        console.error('Error loading promotions:', error);
        document.getElementById('promo-carousel').innerHTML = `
            <div class="loading-placeholder error">
                <p>ไม่สามารถโหลดข้อมูลได้ กรุณารีเฟรชหน้า</p>
            </div>
        `;
    }
}

async function loadGuides() {
    try {
        guides = await dbService.getGuides(true); // Only active
        renderGuides();
    } catch (error) {
        console.error('Error loading guides:', error);
        document.getElementById('steps-grid').innerHTML = `
            <div class="loading-placeholder error">
                <p>ไม่สามารถโหลดข้อมูลได้ กรุณารีเฟรชหน้า</p>
            </div>
        `;
    }
}

// ==================== RENDERING ====================

function renderPromotions() {
    const carousel = document.getElementById('promo-carousel');

    if (promotions.length === 0) {
        carousel.innerHTML = `
            <div class="loading-placeholder">
                <p>ยังไม่มีโปรโมชั่น</p>
            </div>
        `;
        return;
    }

    // All cards are now emart banner style
    carousel.innerHTML = promotions.map(promo => {
        const textClass = promo.textColor === 'dark' ? 'dark-text' : '';
        const badgeClass = promo.badgeStyle === 'light' ? 'light' : '';
        const isImageOnly = promo.displayMode === 'image-only';

        // Build background style
        let bgStyle = '';
        if (promo.backgroundImage) {
            bgStyle = `background-image: url('${promo.backgroundImage}'); background-size: cover; background-position: center;`;
        } else {
            bgStyle = `background: ${promo.backgroundColor || 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'};`;
        }

        // Format date range
        let dateRange = '';
        if (promo.startDate || promo.endDate) {
            const start = promo.startDate ? formatDisplayDate(promo.startDate) : '';
            const end = promo.endDate ? formatDisplayDate(promo.endDate) : '';
            dateRange = `<span class="card-date">행사기간 | ${start} ~ ${end}</span>`;
        }

        // Image-only mode
        if (isImageOnly && promo.backgroundImage) {
            return `
                <a href="promo-detail.html?id=${promo.id}" class="promo-card banner-card image-only" style="${bgStyle}">
                </a>
            `;
        }

        // All cards use emart banner style
        return `
            <a href="promo-detail.html?id=${promo.id}" class="promo-card banner-card ${textClass}" style="${bgStyle}">
                <div class="banner-content">
                    <span class="card-badge ${badgeClass}">${promo.badge || 'EVENT'}</span>
                    <h3 class="card-title">${promo.title || ''}</h3>
                    <p class="card-subtitle">${promo.subtitle || ''}</p>
                    ${dateRange}
                </div>
            </a>
        `;
    }).join('');

    // Update page indicator
    const totalIndicator = document.querySelector('.page-indicator .total');
    if (totalIndicator) {
        totalIndicator.textContent = promotions.length;
    }

    // Re-init carousel after rendering
    setTimeout(() => initCarousel(), 100);
}

// Format date for display (D.M format like emart)
function formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}.${date.getDate()}`;
    } catch (e) {
        return dateStr;
    }
}

function renderGuides() {
    const grid = document.getElementById('steps-grid');

    if (guides.length === 0) {
        grid.innerHTML = `
            <div class="loading-placeholder">
                <p>ยังไม่มีขั้นตอน</p>
            </div>
        `;
        return;
    }

    // Update subtitle
    const subtitle = document.querySelector('.section-subtitle');
    if (subtitle) {
        subtitle.textContent = `เริ่มต้นใช้งานง่ายๆ เพียง ${guides.length} ขั้นตอน`;
    }

    grid.innerHTML = guides.map(guide => {
        const iconSvg = iconSvgs[guide.icon] || iconSvgs['star'];

        return `
            <a href="guide-detail.html?id=${guide.id}" class="step-card">
                <div class="step-number">${guide.order || ''}</div>
                <div class="step-icon">
                    ${iconSvg}
                </div>
                <h3 class="step-title">${guide.title || ''}</h3>
                <p class="step-desc">${guide.description || ''}</p>
            </a>
        `;
    }).join('');

    // Initialize step card animations
    initStepAnimations();
}

// ==================== CAROUSEL ====================

function initCarousel() {
    const track = document.querySelector('.carousel-track');
    const cards = document.querySelectorAll('.promo-card');
    const prevBtn = document.querySelector('.carousel-arrow.prev');
    const nextBtn = document.querySelector('.carousel-arrow.next');
    const currentIndicator = document.querySelector('.page-indicator .current');
    const totalIndicator = document.querySelector('.page-indicator .total');
    const dotsContainer = document.querySelector('.dots');

    if (cards.length === 0) return;

    // Clear previous interval
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
    }

    // For banner mode, always 1 per view
    cardsPerView = 1;

    // Update total indicator
    if (totalIndicator) {
        totalIndicator.textContent = cards.length;
    }

    // Generate dots dynamically
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < cards.length; i++) {
            const dot = document.createElement('span');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => {
                currentIndex = i;
                updateCarousel();
            });
            dotsContainer.appendChild(dot);
        }
    }

    function updateCarousel() {
        // For banner cards, move by percentage
        const offset = currentIndex * 100;
        track.style.transform = `translateX(-${offset}%)`;

        if (currentIndicator) {
            currentIndicator.textContent = currentIndex + 1;
        }

        // Update dots
        const dots = dotsContainer?.querySelectorAll('.dot');
        dots?.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function nextSlide() {
        currentIndex++;
        if (currentIndex >= cards.length) {
            currentIndex = 0;
        }
        updateCarousel();
    }

    function prevSlide() {
        currentIndex--;
        if (currentIndex < 0) {
            currentIndex = cards.length - 1;
        }
        updateCarousel();
    }

    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    // Auto-play every 4 seconds
    autoPlayInterval = setInterval(nextSlide, 4000);

    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => {
            clearInterval(autoPlayInterval);
        });

        carouselContainer.addEventListener('mouseleave', () => {
            autoPlayInterval = setInterval(nextSlide, 5000);
        });
    }

    // Resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            cardsPerView = getCardsPerView();
            currentIndex = 0;
            updateCarousel();
        }, 200);
    });

    updateCarousel();
}

// ==================== SMOOTH SCROLL ====================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = target.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ==================== SEARCH ====================

function initSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');

    async function handleSearch() {
        const query = searchInput?.value.trim().toLowerCase();
        if (!query) return;

        // Search in promotions
        const matchedPromos = promotions.filter(p =>
            (p.title && p.title.toLowerCase().includes(query)) ||
            (p.subtitle && p.subtitle.toLowerCase().includes(query)) ||
            (p.description && p.description.toLowerCase().includes(query))
        );

        // Search in guides
        const matchedGuides = guides.filter(g =>
            (g.title && g.title.toLowerCase().includes(query)) ||
            (g.description && g.description.toLowerCase().includes(query))
        );

        // Show search results
        if (matchedPromos.length > 0) {
            // Go to first matched promo
            window.location.href = `promo-detail.html?id=${matchedPromos[0].id}`;
        } else if (matchedGuides.length > 0) {
            // Go to first matched guide
            window.location.href = `guide-detail.html?id=${matchedGuides[0].id}`;
        } else {
            // Show alert or scroll to sections
            alert(`ไม่พบผลลัพธ์สำหรับ "${query}"`);
        }
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
}

// ==================== ANIMATIONS ====================

function initStepAnimations() {
    const stepCards = document.querySelectorAll('.step-card');

    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const index = Array.from(stepCards).indexOf(entry.target);
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, observerOptions);

    stepCards.forEach((card) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.5s ease';
        observer.observe(card);
    });
}
