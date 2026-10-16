/* =========================================================
   script.js
   Professional Developer Portfolio
   Vanilla JavaScript (ES6+)
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* ==================== 1. SELECT ELEMENTS ==================== */

    const header = document.querySelector(".site-header");
    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("primaryNavigation");
    const navLinks = document.querySelectorAll(".nav-link");

    const scrollProgress = document.getElementById("scrollProgress");
    const backToTop = document.getElementById("backToTop");
    const copyrightYear = document.getElementById("copyrightYear");

    const sections = document.querySelectorAll(
        "main section[id]"
    );


    /* ==================== 2. DYNAMIC COPYRIGHT YEAR ==================== */

    if (copyrightYear) {
        copyrightYear.textContent = new Date().getFullYear();
    }


    /* ==================== 3. MOBILE NAVIGATION ==================== */

    if (menuToggle && navMenu) {

        const isMenuOpen = () =>
            menuToggle.getAttribute("aria-expanded") === "true";

        const openMenu = () => {

            navMenu.classList.add("is-open");

            menuToggle.setAttribute("aria-expanded", "true");
            menuToggle.setAttribute("aria-label", "Close navigation menu");

        };

        const closeMenu = ({ restoreFocus = false } = {}) => {

            navMenu.classList.remove("is-open");

            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigation menu");

            if (restoreFocus) {
                menuToggle.focus();
            }

        };

        menuToggle.addEventListener("click", () => {

            if (isMenuOpen()) {
                closeMenu();
            } else {
                openMenu();
            }

        });


        // Close the menu when a navigation link is selected.
        navMenu.querySelectorAll('a[href^="#"]').forEach((link) => {

            link.addEventListener("click", () => {
                closeMenu();
            });

        });


        // Close the menu when clicking outside the navigation.
        document.addEventListener("click", (event) => {

            if (!isMenuOpen()) {
                return;
            }

            const clickedInsideMenu = navMenu.contains(event.target);
            const clickedToggle = menuToggle.contains(event.target);

            if (!clickedInsideMenu && !clickedToggle) {
                closeMenu();
            }

        });


        // Close the menu with Escape and return focus to the toggle.
        document.addEventListener("keydown", (event) => {

            if (event.key === "Escape" && isMenuOpen()) {
                closeMenu({ restoreFocus: true });
            }

        });


        // Close the mobile menu when switching to desktop layout.
        const desktopMediaQuery = window.matchMedia("(min-width: 851px)");

        desktopMediaQuery.addEventListener("change", (event) => {

            if (event.matches) {
                closeMenu();
            }

        });

    }


    /* ==================== 4. ACTIVE NAVIGATION ==================== */

    const setActiveLink = (sectionId) => {

        navLinks.forEach((link) => {

            const isActive = link.getAttribute("href") === `#${sectionId}`;

            link.classList.toggle("active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }

        });

    };


    if ("IntersectionObserver" in window && sections.length > 0) {

        const sectionObserver = new IntersectionObserver(
            (entries) => {

                const visibleSections = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (a, b) =>
                            b.intersectionRatio - a.intersectionRatio
                    );

                if (visibleSections.length > 0) {
                    setActiveLink(visibleSections[0].target.id);
                }

            },
            {
                root: null,
                rootMargin: "-20% 0px -60% 0px",
                threshold: [0, 0.1, 0.25, 0.5]
            }
        );

        sections.forEach((section) => {
            sectionObserver.observe(section);
        });

    } else if (sections.length > 0) {

        // Basic fallback for browsers without IntersectionObserver.
        const updateActiveSection = () => {

            const marker = window.scrollY + window.innerHeight * 0.35;

            let currentSection = sections[0];

            sections.forEach((section) => {

                if (section.offsetTop <= marker) {
                    currentSection = section;
                }

            });

            if (currentSection) {
                setActiveLink(currentSection.id);
            }

        };

        window.addEventListener("scroll", updateActiveSection, {
            passive: true
        });

        updateActiveSection();

    }


    /* ==================== 5. SCROLL PROGRESS ==================== */

    let scrollUpdateScheduled = false;

    const updateScrollProgress = () => {

        if (!scrollProgress) {
            return;
        }

        const scrollableHeight =
            document.documentElement.scrollHeight - window.innerHeight;

        const progress = scrollableHeight > 0
            ? Math.min(
                100,
                Math.max(0, (window.scrollY / scrollableHeight) * 100)
            )
            : 0;

        scrollProgress.style.width = `${progress}%`;

        scrollProgress.setAttribute(
            "aria-valuenow",
            String(Math.round(progress))
        );

    };


    const requestScrollUpdate = () => {

        if (scrollUpdateScheduled) {
            return;
        }

        scrollUpdateScheduled = true;

        window.requestAnimationFrame(() => {

            updateScrollProgress();
            scrollUpdateScheduled = false;

        });

    };


    window.addEventListener("scroll", requestScrollUpdate, {
        passive: true
    });

    window.addEventListener("resize", requestScrollUpdate, {
        passive: true
    });

    updateScrollProgress();


    /* ==================== 6. BACK TO TOP ==================== */

    if (backToTop) {

        backToTop.addEventListener("click", (event) => {

            const reducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

            event.preventDefault();

            window.scrollTo({
                top: 0,
                behavior: reducedMotion ? "auto" : "smooth"
            });

            // Keep keyboard navigation predictable.
            if (window.location.hash !== "#top") {
                history.replaceState(null, "", "#top");
            }

        });

    }


    /* ==================== 7. OPTIONAL PROJECT LINKS ==================== */

    document.querySelectorAll(".project-card").forEach((card) => {

        const optionalLinks = card.querySelectorAll("[data-optional-link]");

        optionalLinks.forEach((link) => {

            const href = link.getAttribute("href");

            const hasValidDestination =
                href &&
                href.trim() !== "" &&
                href.trim() !== "#" &&
                !href.toLowerCase().startsWith("javascript:");

            if (!hasValidDestination) {
                link.hidden = true;
                return;
            }

            link.hidden = false;

            // Open configured external project links safely.
            if (
                link.target === "_blank" &&
                /^https?:\/\//i.test(href)
            ) {
                link.rel = "noopener noreferrer";
            }

        });

    });


    /* ==================== 8. RESUME LINK VALIDATION ==================== */

    const resumeLinks = document.querySelectorAll(
        'a[href="assets/resume.pdf"]'
    );

    resumeLinks.forEach((link) => {

        link.addEventListener("click", (event) => {

            // Prevent navigation to an accidentally empty href.
            const href = link.getAttribute("href");

            if (!href || href.trim() === "") {
                event.preventDefault();
                console.warn("Please configure the resume PDF path.");
            }

        });

    });


    /* ==================== 9. EXTERNAL LINK SECURITY ==================== */

    document.querySelectorAll('a[target="_blank"]').forEach((link) => {

        link.setAttribute("rel", "noopener noreferrer");

    });


    /* ==================== 10. CONTACT EMAIL CONFIGURATION ==================== */

    /*
       Replace this address in index.html:
       your.email@example.com

       Both contact links already use mailto: URLs.
       No fake form or backend is required.
    */

    document.querySelectorAll("[data-contact-email]").forEach((link) => {

        const href = link.getAttribute("href");

        if (!href || !href.startsWith("mailto:")) {
            console.warn("Please configure a valid contact email address.");
        }

    });


    /* ==================== 11. INITIAL STATE ==================== */

    // Keep the page at the top on a fresh load without a URL fragment.
    // Existing section links and browser navigation remain functional.

    if (!window.location.hash) {
        setActiveLink("home");
    }

});


// Custom Cursor

const cursor = document.querySelector(".custom-cursor");

if (cursor && window.matchMedia("(pointer: fine)").matches) {
    document.addEventListener("mousemove", (event) => {
        cursor.style.display = "block";
        cursor.style.left = `${event.clientX}px`;
        cursor.style.top = `${event.clientY}px`;
    });

    document.addEventListener("mouseleave", () => {
        cursor.style.display = "none";
    });

    document.addEventListener("mouseenter", () => {
        cursor.style.display = "block";
    });

    document.querySelectorAll("a, button").forEach((element) => {
        element.addEventListener("mouseenter", () => {
            cursor.classList.add("hover");
        });

        element.addEventListener("mouseleave", () => {
            cursor.classList.remove("hover");
        });
    });
}