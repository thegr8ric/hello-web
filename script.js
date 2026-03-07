(function () {
    const root = document.documentElement;
    const body = document.body;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function getInitialTheme() {
        const saved = localStorage.getItem('theme');
        if (saved === 'light' || saved === 'dark') {
            return saved;
        }
        return 'light';
    }

    function renderSharedLayout() {
        const headerMount = document.getElementById('site-header');
        const footerMount = document.getElementById('site-footer');

        if (headerMount) {
            headerMount.innerHTML = [
                '<header class="site-header" id="top">',
                '<a class="logo" href="index.html" aria-label="RiCreative home">',
                '<img class="logo-wordmark" src="logo.svg" alt="RiCreative logo">',
                '</a>',
                '<div class="header-right">',
                '<nav class="site-nav" aria-label="Main navigation">',
                '<a href="work.html">Work</a>',
                '<a href="services.html">Services</a>',
                '<a href="about.html">About</a>',
                '<a href="contact.html">Contact</a>',
                '</nav>',
                '</div>',
                '</header>'
            ].join('');
        }

        if (footerMount) {
            footerMount.innerHTML = '<footer class="site-footer"><p>&copy; 2026 RiCreative. All rights reserved.</p></footer>';
        }
    }

    function applyTheme(mode, persist) {
        root.setAttribute('data-theme', mode);
        if (persist) {
            localStorage.setItem('theme', mode);
        }
    }

    renderSharedLayout();

    let currentTheme = getInitialTheme();
    applyTheme(currentTheme, false);

    const currentFile = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.site-nav a').forEach(function (link) {
        const href = (link.getAttribute('href') || '').toLowerCase();
        if (href === currentFile) {
            link.classList.add('current');
        }
    });

    let targetX = 0.5;
    let targetY = 0.3;
    let currentX = 0.5;
    let currentY = 0.3;

    function applyBackgroundPointer() {
        currentX += (targetX - currentX) * 0.09;
        currentY += (targetY - currentY) * 0.09;

        const x1 = 16 + currentX * 66;
        const y1 = 6 + currentY * 42;
        const x2 = 84 - currentX * 66;
        const y2 = 16 + (1 - currentY) * 34;
        root.style.setProperty('--mx', x1.toFixed(2) + '%');
        root.style.setProperty('--my', y1.toFixed(2) + '%');
        root.style.setProperty('--mx2', x2.toFixed(2) + '%');
        root.style.setProperty('--my2', y2.toFixed(2) + '%');
        requestAnimationFrame(applyBackgroundPointer);
    }

    window.addEventListener('mousemove', function (event) {
        targetX = event.clientX / window.innerWidth;
        targetY = event.clientY / window.innerHeight;
    });

    requestAnimationFrame(applyBackgroundPointer);

    document.querySelectorAll('h1').forEach(function (heading) {
        heading.addEventListener('mouseenter', function () {
            heading.style.setProperty('--h1-r', '40%');
        });

        heading.addEventListener('mousemove', function (event) {
            const rect = heading.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            heading.style.setProperty('--h1-x', x.toFixed(2) + '%');
            heading.style.setProperty('--h1-y', y.toFixed(2) + '%');
        });

        heading.addEventListener('mouseleave', function () {
            heading.style.setProperty('--h1-r', '0%');
        });
    });

    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('mouseenter', function () {
            if (reduceMotion) {
                return;
            }
            logo.style.setProperty('--logo-r', '44%');
        });

        logo.addEventListener('mousemove', function (event) {
            if (reduceMotion) {
                return;
            }
            const rect = logo.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            logo.style.setProperty('--logo-x', x.toFixed(2) + '%');
            logo.style.setProperty('--logo-y', y.toFixed(2) + '%');
        });

        logo.addEventListener('mouseleave', function () {
            logo.style.setProperty('--logo-r', '0%');
        });
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const statusEl = document.getElementById('contactFormStatus');
        const sendBtn = document.getElementById('contactSendBtn');
        const endpoint = 'https://formsubmit.co/ajax/thegr8ric@gmail.com';

        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();

            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }

            const formData = new FormData(contactForm);
            contactForm.classList.remove('is-success');
            contactForm.classList.add('is-sending');
            if (statusEl) {
                statusEl.textContent = 'Sending your message...';
            }

            fetch(endpoint, {
                method: 'POST',
                headers: { Accept: 'application/json' },
                body: formData
            }).then(function (response) {
                if (!response.ok) {
                    throw new Error('Request failed');
                }
                return response.json();
            }).then(function () {
                contactForm.classList.remove('is-sending');
                contactForm.classList.add('is-success');
                if (statusEl) {
                    statusEl.textContent = 'Message sent successfully. I will get back to you soon.';
                }
                contactForm.reset();
                window.setTimeout(function () {
                    contactForm.classList.remove('is-success');
                }, 1800);
            }).catch(function () {
                contactForm.classList.remove('is-sending');
                if (statusEl) {
                    statusEl.textContent = 'Could not send right now. Please try again in a moment.';
                }
            }).finally(function () {
                if (sendBtn) {
                    sendBtn.blur();
                }
            });
        });
    }

    const internalLinks = document.querySelectorAll('a[href]');
    internalLinks.forEach(function (link) {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            return;
        }
        if (link.target === '_blank' || link.hasAttribute('download')) {
            return;
        }
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) {
            return;
        }

        link.addEventListener('click', function (event) {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || reduceMotion) {
                return;
            }
            event.preventDefault();
            body.classList.add('page-exit');
            window.setTimeout(function () {
                window.location.href = url.href;
            }, 220);
        });
    });

    const revealItems = Array.from(document.querySelectorAll('.reveal'));
    revealItems.forEach(function (item, index) {
        item.style.transitionDelay = Math.min(index * 55, 330) + 'ms';
    });

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.18 });

    revealItems.forEach(function (item) {
        observer.observe(item);
    });

    const tiltItems = document.querySelectorAll('[data-tilt]');
    tiltItems.forEach(function (el) {
        el.addEventListener('mousemove', function (event) {
            if (reduceMotion) {
                return;
            }
            const rect = el.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width;
            const y = (event.clientY - rect.top) / rect.height;
            const rotateY = (x - 0.5) * 8;
            const rotateX = (0.5 - y) * 8;
            el.style.transform = 'rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg)';
        });

        el.addEventListener('mouseleave', function () {
            el.style.transform = 'rotateX(0deg) rotateY(0deg)';
        });
    });
})();
