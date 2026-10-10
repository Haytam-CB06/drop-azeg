// ==========================================================================
// DROP AZEG — Interactive JavaScript
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    const BUSINESS_WHATSAPP_NUMBER = window.DROP_AZEG_CONFIG?.whatsappNumber;

    // Keep product photos non-draggable, including images added to the grid later.
    document.addEventListener('dragstart', (event) => {
        if (event.target instanceof HTMLImageElement && event.target.closest('.products-grid')) {
            event.preventDefault();
        }
    }, true);

    // Theme preference follows the device by default and can be changed at any time.
    const themeToggle = document.querySelector('[data-theme-toggle]');
    const syncThemeButton = () => {
        if (!themeToggle) return;
        const isDark = document.documentElement.dataset.theme === 'dark';
        const label = isDark ? 'Activer le mode clair' : 'Activer le mode sombre';
        themeToggle.setAttribute('aria-label', label);
        themeToggle.setAttribute('title', label);
        themeToggle.setAttribute('aria-pressed', String(isDark));
    };

    syncThemeButton();
    themeToggle?.addEventListener('click', () => {
        const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = nextTheme;
        try {
            localStorage.setItem('drop-azeg-theme', nextTheme);
        } catch (_) {}
        syncThemeButton();
    });

    // 1. Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = mobileNav.classList.toggle('active');
            mobileToggle.classList.toggle('open', isOpen);
            mobileToggle.setAttribute('aria-expanded', String(isOpen));
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
                mobileToggle.classList.remove('open');
                mobileToggle.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && mobileNav.classList.contains('active')) {
                mobileNav.classList.remove('active');
                mobileToggle.classList.remove('open');
                mobileToggle.setAttribute('aria-expanded', 'false');
                mobileToggle.focus();
            }
        });
    }

    // 2. Active Link Switching & Smooth Scroll
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main > section[id], footer[id]');
    let sectionHashTimer;

    const syncHashToCurrentSection = () => {
        const scrollPosition = window.scrollY + Math.min(window.innerHeight * 0.35, 240);
        let currentSection = sections[0];

        sections.forEach(section => {
            if (scrollPosition >= section.offsetTop) currentSection = section;
        });

        if (currentSection && window.location.hash !== `#${currentSection.id}`) {
            const currentUrl = `${window.location.pathname}${window.location.search}#${currentSection.id}`;
            window.history.replaceState(window.history.state, '', currentUrl);
        }
    };

    window.addEventListener('load', () => {
        if (!window.location.hash) syncHashToCurrentSection();
    }, { once: true });

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.scrollY + 200;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === current) {
                link.classList.add('active');
            }
        });

        window.clearTimeout(sectionHashTimer);
        sectionHashTimer = window.setTimeout(syncHashToCurrentSection, 120);
    }, { passive: true });

    // 3. Category Filter (Tous, Tracksuits, Hoodies)
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            productCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // 4. Quick Order Auto-Select Product Form Fill
    const orderButtons = document.querySelectorAll('.btn-order-item');
    const productSelect = document.getElementById('productSelect');
    const commanderSection = document.getElementById('commander');

    orderButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productName = button.getAttribute('data-product');
            const price = button.getAttribute('data-price');

            // Find matching option in select element
            if (productSelect) {
                for (let option of productSelect.options) {
                    if (option.text.includes(productName)) {
                        productSelect.value = option.value;
                        break;
                    }
                }
            }

            // Smooth scroll to order section
            if (commanderSection) {
                commanderSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // 5. Send the completed order to the business WhatsApp chat.
    const orderForm = document.getElementById('orderForm');
    const whatsappStatus = document.getElementById('whatsappStatus');

    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const product = document.getElementById('productSelect').value;
            const size = document.getElementById('sizeSelect').value;
            const quantity = document.getElementById('quantityInput').value;
            const fullName = document.getElementById('fullName').value.trim();
            const phone = document.getElementById('phoneNumber').value.trim();
            const address = document.getElementById('cityAddress').value.trim();
            const message = [
                'Bonjour DROP AZEG, je souhaite passer cette commande :',
                '',
                `Article : ${product}`,
                `Taille : ${size}`,
                `Quantité : ${quantity}`,
                `Nom : ${fullName}`,
                `Téléphone : ${phone}`,
                `Adresse de livraison : ${address}`,
                '',
                'Merci !'
            ].join('\n');
            if (!BUSINESS_WHATSAPP_NUMBER) {
                if (whatsappStatus) whatsappStatus.textContent = 'La commande WhatsApp est momentanément indisponible.';
                return;
            }
            const whatsappUrl = `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
            const whatsappLink = document.createElement('a');
            whatsappLink.href = whatsappUrl;
            whatsappLink.target = '_blank';
            whatsappLink.rel = 'noopener noreferrer';
            document.body.appendChild(whatsappLink);
            whatsappLink.click();
            whatsappLink.remove();

            if (whatsappStatus) {
                whatsappStatus.textContent = 'WhatsApp s’ouvre avec votre commande. Vérifiez le récapitulatif puis appuyez sur Envoyer.';
            }
        });
    }
});
