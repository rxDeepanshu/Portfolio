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


// Website Preloader
window.addEventListener("load", () => {
    const preloader = document.getElementById("preloader");

    if (preloader) {
        setTimeout(() => {
            preloader.classList.add("loaded");
        }, 0);
    }
});

// Music


const music = document.getElementById("backgroundMusic");
const musicToggle = document.getElementById("musicToggle");
const musicIcon = document.getElementById("musicIcon");
const musicLabel = musicToggle?.querySelector(".music-label");

if (music && musicToggle && musicIcon && musicLabel) {
    music.volume = 0.25;

    function updateMusicButton(isPlaying) {
        musicIcon.textContent = isPlaying ? "🔊" : "🔇";
        musicLabel.textContent = isPlaying ? "Music On" : "Music Off";
        musicToggle.setAttribute(
            "aria-label",
            isPlaying ? "Mute background music" : "Turn background music on"
        );
        musicToggle.setAttribute("aria-pressed", String(isPlaying));
        musicToggle.title = isPlaying
            ? "Mute background music"
            : "Turn background music on";
    }

    // Attempt autoplay; browsers may block it.
    music.play()
        .then(() => updateMusicButton(true))
        .catch(() => updateMusicButton(false));

    musicToggle.addEventListener("click", async () => {
        if (!music.paused) {
            music.pause();
            updateMusicButton(false);
            return;
        }

        try {
            await music.play();
            updateMusicButton(true);
        } catch (error) {
            updateMusicButton(false);
            console.warn("Music playback could not start.", error);
        }
    });

    music.addEventListener("play", () => updateMusicButton(true));
    music.addEventListener("pause", () => updateMusicButton(false));
}



/* =========================================
   GITHUB PROFILE AND REPOSITORIES
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const GITHUB_USERNAME = "rxDeepanshu";

    const profileUrl =
        `https://api.github.com/users/${GITHUB_USERNAME}`;

    const repositoriesUrl =
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100&type=owner`;

    const avatar = document.getElementById("githubAvatar");
    const name = document.getElementById("githubName");
    const bio = document.getElementById("githubBio");

    const repoCount = document.getElementById("githubRepos");
    const followers = document.getElementById("githubFollowers");
    const stars = document.getElementById("githubStars");

    const repositoryGrid =
        document.getElementById("githubRepositoryGrid");

    const status = document.getElementById("githubStatus");

    if (!repositoryGrid) return;

    async function fetchGitHubData() {
        try {
            const [profileResponse, repositoriesResponse] =
                await Promise.all([
                    fetch(profileUrl),
                    fetch(repositoriesUrl)
                ]);

            if (!profileResponse.ok || !repositoriesResponse.ok) {
                throw new Error(
                    "GitHub API request failed. Please try again later."
                );
            }

            const profile = await profileResponse.json();
            const repositories = await repositoriesResponse.json();

            // Update profile information.
            if (avatar && profile.avatar_url) {
                avatar.src = profile.avatar_url;
            }

            if (name) {
                name.textContent = profile.name || profile.login;
            }

            if (bio) {
                bio.textContent =
                    profile.bio || "Software developer exploring and building with code.";
            }

            if (repoCount) {
                repoCount.textContent = profile.public_repos;
            }

            if (followers) {
                followers.textContent = profile.followers;
            }

            // Calculate stars across public repositories owned by the user.
            const totalStars = repositories.reduce(
                (total, repository) =>
                    total + repository.stargazers_count,
                0
            );

            if (stars) {
                stars.textContent = totalStars;
            }

            // Sort by stars first, then most recently updated.
            const selectedRepositories = [...repositories]
                .sort((a, b) => {
                    if (b.stargazers_count !== a.stargazers_count) {
                        return b.stargazers_count - a.stargazers_count;
                    }

                    return new Date(b.updated_at) -
                        new Date(a.updated_at);
                })
                .slice(0, 6);

            renderRepositories(selectedRepositories);

            if (status) {
                status.textContent =
                    `Showing ${selectedRepositories.length} public repositories.`;
            }

        } catch (error) {
            console.error("GitHub data error:", error);

            repositoryGrid.innerHTML = `
                <p class="github-status">
                    GitHub data is temporarily unavailable.
                    You can still explore my projects on
                    <a
                        href="https://github.com/${GITHUB_USERNAME}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >my GitHub profile</a>.
                </p>
            `;

            if (status) {
                status.textContent =
                    "Could not load live GitHub data.";
            }
        }
    }

    function renderRepositories(repositories) {
        if (!repositories.length) {
            repositoryGrid.innerHTML = `
                <p class="github-status">
                    No public repositories were found.
                </p>
            `;
            return;
        }

        repositoryGrid.innerHTML = repositories.map(repository => {
            const description = escapeHTML(
                repository.description || "No description provided yet."
            );

            const repositoryName = escapeHTML(repository.name);

            const language = escapeHTML(
                repository.language || "Other"
            );

            const repositoryUrl = repository.html_url;

            return `
                <article class="github-repository-card">

                    <div class="github-repository-title">
                        <span
                            class="github-repository-icon"
                            aria-hidden="true"
                        >◇</span>

                        <a
                            href="${repositoryUrl}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >${repositoryName}</a>
                    </div>

                    <p class="github-repository-description">
                        ${description}
                    </p>

                    <div class="github-repository-meta">

                        <span class="github-language">
                            <span
                                class="github-language-dot"
                                aria-hidden="true"
                            ></span>
                            ${language}
                        </span>

                        <span>
                            ★ ${repository.stargazers_count}
                        </span>

                        <span>
                            Forks: ${repository.forks_count}
                        </span>

                    </div>

                </article>
            `;
        }).join("");
    }

    // Escape API-provided text before inserting it into HTML.
    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    fetchGitHubData();
});


/* ========================================
   LEETCODE LIVE STATISTICS
======================================== */

document.addEventListener("DOMContentLoaded", () => {
    const username = "deepanshu__yadav";

    const API_BASE = "https://leetcode-stats.tashif.codes";

    const statusElement = document.getElementById("lc-status");

    // Exit safely if the LeetCode section is not on the page.
    if (!statusElement) return;

    async function fetchStats(endpoint) {
        const response = await fetch(
            `${API_BASE}/${encodeURIComponent(username)}${endpoint}`,
            { signal: AbortSignal.timeout(15000) }
        );

        if (!response.ok) {
            throw new Error(`Statistics request failed: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === "error" || !result.data) {
            throw new Error(result.message || "Statistics unavailable.");
        }

        return result.data;
    }

    function setText(id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }

    function setProgress(barId, solved, total) {
        const bar = document.getElementById(barId);

        if (!bar) return;

        const solvedCount = Number(solved) || 0;
        const totalCount = Number(total) || 0;

        const percentage = totalCount > 0
            ? Math.min(100, (solvedCount / totalCount) * 100)
            : 0;

        bar.style.width = `${percentage}%`;
    }

    function formatNumber(value) {
        const number = Number(value);

        return Number.isFinite(number) && number > 0
            ? number.toLocaleString("en-US")
            : "N/A";
    }

    async function loadLeetCodeStats() {
        try {
            statusElement.textContent =
                "Fetching your latest LeetCode statistics...";

            // Fetch solved counts and ranking.
            const [summary, stats] = await Promise.all([
                fetchStats(""),
                fetchStats("/stats")
            ]);

            const difficulty = stats.byDifficulty || {};

            const easy = Number(difficulty.easy) || 0;
            const medium = Number(difficulty.medium) || 0;
            const hard = Number(difficulty.hard) || 0;

            const total = Number(stats.totalSolved ?? summary.totalSolved)
                || easy + medium + hard;

            setText("lc-total", total.toLocaleString("en-US"));

            setText("lc-easy", easy.toLocaleString("en-US"));
            setText("lc-medium", medium.toLocaleString("en-US"));
            setText("lc-hard", hard.toLocaleString("en-US"));

            setText(
                "lc-easy-total",
                `${easy.toLocaleString("en-US")} solved`
            );

            setText(
                "lc-medium-total",
                `${medium.toLocaleString("en-US")} solved`
            );

            setText(
                "lc-hard-total",
                `${hard.toLocaleString("en-US")} solved`
            );

            setProgress("lc-easy-bar", easy, stats.totalQuestions);
            setProgress("lc-medium-bar", medium, stats.totalQuestions);
            setProgress("lc-hard-bar", hard, stats.totalQuestions);

            // Ranking and acceptance rate.
            setText(
                "lc-ranking",
                formatNumber(summary.ranking ?? summary.globalRanking)
            );

            const acceptance = Number(stats.acceptanceRate);

            setText(
                "lc-acceptance",
                Number.isFinite(acceptance)
                    ? `${acceptance.toFixed(1)}%`
                    : "N/A"
            );

            // Contest rating is optional; fetch separately.
            try {
                const contest = await fetchStats("/contests");

                setText(
                    "lc-rating",
                    formatNumber(contest.rating ?? contest.currentRating)
                );
            } catch {
                setText("lc-rating", "N/A");
            }

            statusElement.textContent =
                "Statistics loaded from a public third-party API. " +
                "Values may be delayed or temporarily unavailable.";

        } catch (error) {
            console.error("LeetCode API error:", error);

            statusElement.textContent =
                "Unable to load live statistics right now. " +
                "You can still view the full profile using the link above.";
        }
    }

    loadLeetCodeStats();
});