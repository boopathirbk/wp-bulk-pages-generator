document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // --- Theme Master Engine ---
    const setTheme = (theme) => {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        const themeText = document.getElementById('theme-text');
        if (themeText) {
            themeText.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
        }
    };

    const savedTheme = localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);

        // Haptic feedback simulation (Visual)
        themeToggle.style.transform = 'scale(0.9)';
        setTimeout(() => themeToggle.style.transform = 'scale(1)', 150);
    });

    // --- Master Accordion (FAQ) ---
    const faqButtons = document.querySelectorAll('.faq-btn');

    faqButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const answer = btn.nextElementSibling;
            const isActive = btn.classList.contains('active');

            // Close all others
            document.querySelectorAll('.faq-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-expanded', 'false');
            });
            document.querySelectorAll('.faq-answer').forEach(a => a.style.maxHeight = null);

            if (!isActive) {
                btn.classList.add('active');
                btn.setAttribute('aria-expanded', 'true');
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });

    // --- Scroll Transitions (Intersection Observer) ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // One-time reveal
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('[data-reveal]').forEach(el => {
        revealObserver.observe(el);
    });

    // --- Smooth Scroll Logic ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 100;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                // Respect reduced motion
                const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: shouldReduceMotion ? "auto" : "smooth"
                });
            }
        });
    });

    // --- UI Helpers ---
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // --- Mobile Menu Toggle ---
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                document.body.style.overflow = 'hidden'; // Prevent scroll
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                document.body.style.overflow = '';
            }
        });

        // Close menu when a link is clicked
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.querySelector('i').classList.remove('fa-times');
                menuToggle.querySelector('i').classList.add('fa-bars');
                document.body.style.overflow = '';
            });
        });
    }

    // ── Lightbox ──
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lb = document.getElementById('docs-lightbox');
    const lbImg = document.getElementById('docs-lightbox-img');
    const lbCap = document.getElementById('docs-lightbox-caption');
    let lbIdx = 0;
    const lbImgs = [];

    galleryItems.forEach((item, i) => {
        const img = item.querySelector('img');
        const cap = item.querySelector('span');
        lbImgs.push({ src: img.src, alt: img.alt, caption: cap ? cap.textContent : '' });
        item.addEventListener('click', () => { lbIdx = i; lbShow(); lb.classList.add('active'); document.body.style.overflow = 'hidden'; });
    });

    function lbShow() { lbImg.src = lbImgs[lbIdx].src; lbImg.alt = lbImgs[lbIdx].alt; lbCap.textContent = lbImgs[lbIdx].caption; }
    function lbClose() { lb.classList.remove('active'); document.body.style.overflow = ''; }

    document.getElementById('docs-lightbox-close').addEventListener('click', lbClose);
    document.getElementById('docs-lightbox-prev').addEventListener('click', () => { lbIdx = (lbIdx - 1 + lbImgs.length) % lbImgs.length; lbShow(); });
    document.getElementById('docs-lightbox-next').addEventListener('click', () => { lbIdx = (lbIdx + 1) % lbImgs.length; lbShow(); });
    lb.addEventListener('click', (e) => { if (e.target === lb) lbClose(); });
    document.addEventListener('keydown', (e) => {
        if (!lb.classList.contains('active')) return;
        if (e.key === 'Escape') lbClose();
        if (e.key === 'ArrowLeft') { lbIdx = (lbIdx - 1 + lbImgs.length) % lbImgs.length; lbShow(); }
        if (e.key === 'ArrowRight') { lbIdx = (lbIdx + 1) % lbImgs.length; lbShow(); }
    });

    console.log('🏛️ WBPG Masterpiece Loaded');
});
