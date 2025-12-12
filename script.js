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
let faqs = [];
let currentIndex = 0;
let cardsPerView = 3;
let autoPlayInterval = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize mobile view toggle (check saved preference)
    initMobileViewToggle();

    // Load site settings first
    await loadSiteSettings();

    // Load data from Firebase
    await loadPromotions();
    await loadGuides();
    await loadFaqs();

    // Initialize carousel
    initCarousel();

    // Initialize smooth scroll
    initSmoothScroll();

    // Initialize search
    initSearch();

    // Initialize bottom navigation (mobile)
    initBottomNav();
});

// ==================== SITE SETTINGS ====================

async function loadSiteSettings() {
    try {
        const settings = await dbService.getSiteSettings();
        if (settings) {
            // Update brand name
            const brandEl = document.getElementById('brand-name-display');
            if (brandEl) brandEl.textContent = settings.brandName || 'MyBrand';

            // Update section titles
            const guidesTitle = document.getElementById('guides-title');
            if (guidesTitle) guidesTitle.textContent = settings.sectionTitles?.guides || 'ขั้นตอนการใช้งาน';

            const faqsTitle = document.getElementById('faqs-title');
            if (faqsTitle) faqsTitle.textContent = settings.sectionTitles?.faqs || 'ปัญหาที่พบบ่อย';

            // Update page title
            document.title = (settings.brandName || 'MyBrand') + ' - โปรโมชั่นและขั้นตอนการใช้งาน';
        }
    } catch (error) {
        console.error('Error loading site settings:', error);
    }
}

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

async function loadFaqs() {
    try {
        faqs = await dbService.getFaqs(true); // Only active - store in global for search
        renderFaqs(faqs);
    } catch (error) {
        console.error('Error loading FAQs:', error);
        const faqGrid = document.getElementById('faq-grid');
        if (faqGrid) {
            faqGrid.innerHTML = `
                <div class="loading-placeholder error">
                    <p>ไม่สามารถโหลด FAQ ได้ กรุณารีเฟรชหน้า</p>
                </div>
            `;
        }
    }
}

function renderFaqs(faqs) {
    const faqGrid = document.getElementById('faq-grid');
    if (!faqGrid) return;

    if (faqs.length === 0) {
        faqGrid.innerHTML = `
            <div class="loading-placeholder">
                <p>ยังไม่มี FAQ</p>
            </div>
        `;
        return;
    }

    faqGrid.innerHTML = faqs.map((faq, index) => `
        <div class="faq-item" id="faq-${index}">
            <button class="faq-question" onclick="toggleFaq(${index})">
                <span>${faq.question}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                </svg>
            </button>
            <div class="faq-answer">
                <div class="faq-answer-content">${faq.answer}</div>
            </div>
        </div>
    `).join('');
}

function toggleFaq(index) {
    const faqItem = document.getElementById(`faq-${index}`);
    if (faqItem) {
        faqItem.classList.toggle('active');
    }
}

// Scroll to FAQ and open it (used by search)
function scrollToFaq(index) {
    // Close search dropdown
    const dropdown = document.getElementById('search-dropdown');
    if (dropdown) dropdown.style.display = 'none';

    // Scroll to FAQ section first
    const faqSection = document.getElementById('faq');
    if (faqSection) {
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = faqSection.offsetTop - headerHeight - 20;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    // Wait for scroll then open the FAQ item
    setTimeout(() => {
        const faqItem = document.getElementById(`faq-${index}`);
        if (faqItem) {
            // Close any open FAQs first
            document.querySelectorAll('.faq-item.active').forEach(item => {
                item.classList.remove('active');
            });
            // Open this one
            faqItem.classList.add('active');
            // Scroll to the specific item
            faqItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 500);
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

        // Determine link URL - external or detail page
        const linkUrl = (promo.contentType === 'link' && promo.externalUrl)
            ? promo.externalUrl
            : `promo-detail.html?id=${promo.id}`;
        const linkTarget = (promo.contentType === 'link' && promo.externalUrl) ? ' target="_blank"' : '';

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
                <a href="${linkUrl}"${linkTarget} class="promo-card banner-card image-only" style="${bgStyle}">
                </a>
            `;
        }

        // All cards use emart banner style
        return `
            <a href="${linkUrl}"${linkTarget} class="promo-card banner-card ${textClass}" style="${bgStyle}">
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

    // Clone buttons to remove old event listeners
    let prevBtn = document.getElementById('prev-btn');
    let nextBtn = document.getElementById('next-btn');
    let pauseBtn = document.getElementById('pause-btn');

    if (prevBtn) {
        const newPrev = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrev, prevBtn);
        prevBtn = newPrev;
    }
    if (nextBtn) {
        const newNext = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNext, nextBtn);
        nextBtn = newNext;
    }
    if (pauseBtn) {
        const newPause = pauseBtn.cloneNode(true);
        pauseBtn.parentNode.replaceChild(newPause, pauseBtn);
        pauseBtn = newPause;
    }

    const pauseIcon = pauseBtn?.querySelector('#pause-icon') || document.getElementById('pause-icon');
    const playIcon = pauseBtn?.querySelector('#play-icon') || document.getElementById('play-icon');
    const currentIndicator = document.getElementById('page-current');
    const totalIndicator = document.getElementById('page-total');
    const progressFill = document.getElementById('progress-fill');

    if (cards.length === 0) return;

    // Clear previous interval
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
    }

    // State
    let isPaused = false;
    cardsPerView = 1;
    currentIndex = 0;

    // Update total indicator
    if (totalIndicator) {
        totalIndicator.textContent = cards.length;
    }

    function updateCarousel() {
        // For banner cards, move by percentage
        const offset = currentIndex * 100;
        track.style.transform = `translateX(-${offset}%)`;

        if (currentIndicator) {
            currentIndicator.textContent = currentIndex + 1;
        }
    }

    // Reset and restart progress animation
    function resetProgress() {
        if (progressFill) {
            progressFill.classList.remove('animating');
            void progressFill.offsetWidth;
            progressFill.classList.add('animating');
        }
    }

    // Stop progress animation
    function stopProgress() {
        if (progressFill) {
            progressFill.classList.remove('animating');
            progressFill.style.width = '0%';
        }
    }

    // Start auto-play with progress bar
    function startAutoPlay() {
        if (isPaused) return;

        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
        }

        resetProgress();

        autoPlayInterval = setInterval(() => {
            nextSlide();
            resetProgress();
        }, 4000);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
        stopProgress();
    }

    function goToSlide(index) {
        currentIndex = index;
        updateCarousel();
        if (!isPaused) startAutoPlay();
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

    // Pause/Play button
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            isPaused = !isPaused;
            if (isPaused) {
                stopAutoPlay();
                if (pauseIcon) pauseIcon.style.display = 'none';
                if (playIcon) playIcon.style.display = 'block';
            } else {
                if (pauseIcon) pauseIcon.style.display = 'block';
                if (playIcon) playIcon.style.display = 'none';
                startAutoPlay();
            }
        });
    }

    // Arrow button clicks
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            if (!isPaused) startAutoPlay();
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            if (!isPaused) startAutoPlay();
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

    // Start auto-play on init
    startAutoPlay();
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
    const searchBox = document.querySelector('.search-box');

    // Create dropdown container
    let dropdown = document.createElement('div');
    dropdown.className = 'search-dropdown';
    dropdown.id = 'search-dropdown';
    searchBox?.appendChild(dropdown);

    function showResults(query) {
        if (!query || query.length < 1) {
            dropdown.style.display = 'none';
            return;
        }

        const q = query.toLowerCase();

        // Search in promotions
        const matchedPromos = promotions.filter(p =>
            (p.title && p.title.toLowerCase().includes(q)) ||
            (p.subtitle && p.subtitle.toLowerCase().includes(q))
        ).slice(0, 3); // Max 3 results

        // Search in guides
        const matchedGuides = guides.filter(g =>
            (g.title && g.title.toLowerCase().includes(q)) ||
            (g.description && g.description.toLowerCase().includes(q))
        ).slice(0, 3); // Max 3 results

        // Search in FAQs
        const matchedFaqs = faqs.filter(f =>
            (f.question && f.question.toLowerCase().includes(q)) ||
            (f.answer && f.answer.toLowerCase().includes(q))
        ).slice(0, 3); // Max 3 results

        // Build dropdown HTML
        let html = '';

        if (matchedPromos.length > 0) {
            html += '<div class="search-category">โปรโมชั่น</div>';
            matchedPromos.forEach(p => {
                html += `
                    <a href="promo-detail.html?id=${p.id}" class="search-result-item">
                        <span class="result-icon">🎉</span>
                        <div class="result-text">
                            <strong>${p.title}</strong>
                            <small>${p.subtitle || ''}</small>
                        </div>
                    </a>
                `;
            });
        }

        if (matchedGuides.length > 0) {
            html += '<div class="search-category">ขั้นตอนการใช้งาน</div>';
            matchedGuides.forEach(g => {
                html += `
                    <a href="guide-detail.html?id=${g.id}" class="search-result-item">
                        <span class="result-icon">📖</span>
                        <div class="result-text">
                            <strong>${g.title}</strong>
                            <small>${g.description || ''}</small>
                        </div>
                    </a>
                `;
            });
        }

        if (matchedFaqs.length > 0) {
            html += '<div class="search-category">ปัญหาที่พบบ่อย</div>';
            matchedFaqs.forEach((f, idx) => {
                // Find the original index in faqs array
                const originalIndex = faqs.indexOf(f);
                html += `
                    <a href="#faq" class="search-result-item" onclick="scrollToFaq(${originalIndex}); return false;">
                        <span class="result-icon">❓</span>
                        <div class="result-text">
                            <strong>${f.question}</strong>
                            <small>${f.answer ? f.answer.substring(0, 50) + '...' : ''}</small>
                        </div>
                    </a>
                `;
            });
        }

        if (html === '') {
            html = '<div class="search-no-result">ไม่พบผลลัพธ์สำหรับ "' + query + '"</div>';
        }

        dropdown.innerHTML = html;
        dropdown.style.display = 'block';
    }

    // Live search on typing
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            showResults(e.target.value.trim());
        });

        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim()) {
                showResults(searchInput.value.trim());
            }
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchBox?.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });

    // Search button click
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput?.value.trim();
            if (query) {
                showResults(query);
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

// ==================== BOTTOM NAVIGATION ====================

function initBottomNav() {
    const bottomNav = document.getElementById('bottom-nav');
    if (!bottomNav) return;

    const navItems = bottomNav.querySelectorAll('.bottom-nav-item');
    const sections = ['top', 'promotions', 'how-to-use', 'faq'];

    // Handle click events
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            const target = item.getAttribute('data-target');

            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Scroll to section
            if (target === 'top') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const section = document.getElementById(target);
                if (section) {
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                    const targetPosition = section.offsetTop - headerHeight - 10;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            }
        });
    });

    // Update active state on scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            updateActiveNavItem(navItems, sections);
        }, 50);
    });

    // Initial check
    updateActiveNavItem(navItems, sections);
}

function updateActiveNavItem(navItems, sections) {
    const scrollPosition = window.scrollY;
    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
    const windowHeight = window.innerHeight;

    // Check if at top
    if (scrollPosition < 100) {
        setActiveNavItem(navItems, 'top');
        return;
    }

    // Find current section
    for (let i = sections.length - 1; i >= 0; i--) {
        const sectionId = sections[i];
        if (sectionId === 'top') continue;

        const section = document.getElementById(sectionId);
        if (section) {
            const sectionTop = section.offsetTop - headerHeight - 50;
            if (scrollPosition >= sectionTop) {
                setActiveNavItem(navItems, sectionId);
                return;
            }
        }
    }

    // Default to top
    setActiveNavItem(navItems, 'top');
}

function setActiveNavItem(navItems, targetId) {
    navItems.forEach(item => {
        const itemTarget = item.getAttribute('data-target');
        if (itemTarget === targetId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// ==================== MOBILE VIEW TOGGLE ====================

// Toggle between desktop and mobile view
function toggleMobileView() {
    const body = document.body;
    const toggleBtn = document.getElementById('view-toggle-btn');
    const isMobileMode = body.classList.toggle('mobile-view-mode');

    // Update button icons
    if (toggleBtn) {
        const mobileIcon = toggleBtn.querySelector('.icon-mobile');
        const desktopIcon = toggleBtn.querySelector('.icon-desktop');

        if (isMobileMode) {
            mobileIcon.style.display = 'none';
            desktopIcon.style.display = 'block';
            toggleBtn.title = 'สลับเป็นโหมดเดสก์ท็อป';
        } else {
            mobileIcon.style.display = 'block';
            desktopIcon.style.display = 'none';
            toggleBtn.title = 'สลับเป็นโหมดมือถือ';
        }
    }

    // Save preference to localStorage
    localStorage.setItem('mobileViewMode', isMobileMode ? 'true' : 'false');

    // Re-initialize bottom nav if switching to mobile mode
    if (isMobileMode) {
        initBottomNav();
    }
}

// Check and apply saved mobile view preference on page load
function initMobileViewToggle() {
    const savedMode = localStorage.getItem('mobileViewMode');
    const toggleBtn = document.getElementById('view-toggle-btn');

    if (savedMode === 'true') {
        document.body.classList.add('mobile-view-mode');

        // Update button icons
        if (toggleBtn) {
            const mobileIcon = toggleBtn.querySelector('.icon-mobile');
            const desktopIcon = toggleBtn.querySelector('.icon-desktop');
            mobileIcon.style.display = 'none';
            desktopIcon.style.display = 'block';
            toggleBtn.title = 'สลับเป็นโหมดเดสก์ท็อป';
        }
    }
}
