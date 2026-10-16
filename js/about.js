(() => {
    const accordion = document.querySelector("[data-about-accordion]");

    if (!accordion) {
        return;
    }


    /* =========================================================
       SETTINGS
       ========================================================= */

    const chapters = Array.from(
        accordion.querySelectorAll("[data-about-chapter]")
    );

    const chapterLinks = Array.from(
        document.querySelectorAll("[data-about-chapter-link]")
    );

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const panelAnimationTime = 500;
    const scrollDuration = 1400;
    const scrollTopOffset = 32;

    let activeScrollFrame = null;
    let activeSpyFrame = null;


    /* =========================================================
       HELPERS
       ========================================================= */

    function getChapterParts(chapter) {
        const trigger = chapter.querySelector(
            ".about-chapter-trigger"
        );

        if (!trigger) {
            return {
                trigger: null,
                panel: null
            };
        }

        const panelId = trigger.getAttribute(
            "aria-controls"
        );

        const panel = document.getElementById(panelId);

        return {
            trigger,
            panel
        };
    }


    function setActiveChapter(chapter) {
        chapterLinks.forEach((link) => {
            if (link.getAttribute("href") === `#${chapter.id}`) {
                link.setAttribute("aria-current", "location");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }


    function updateActiveChapter() {
        if (!chapters.length) {
            return;
        }

        const readingLine = Math.min(window.innerHeight * 0.6, 540);
        let currentChapter = chapters[0];

        chapters.forEach((chapter) => {
            if (chapter.getBoundingClientRect().top <= readingLine) {
                currentChapter = chapter;
            }
        });

        setActiveChapter(currentChapter);
    }


    function scheduleActiveUpdate() {
        if (activeSpyFrame !== null) {
            return;
        }

        activeSpyFrame = requestAnimationFrame(() => {
            activeSpyFrame = null;
            updateActiveChapter();
        });
    }


    /* =========================================================
       OPEN A CHAPTER
       ========================================================= */

    function openChapter(chapter, animate = true) {
        const { trigger, panel } =
            getChapterParts(chapter);

        if (!trigger || !panel) {
            return;
        }


        trigger.setAttribute(
            "aria-expanded",
            "true"
        );

        panel.hidden = false;


        /*
          Reduced motion or initial page setup:
          open immediately.
        */

        if (!animate || reduceMotion.matches) {
            chapter.classList.add("is-open");
            panel.style.height = "auto";

            return;
        }


        /*
          Start at zero height.
        */

        panel.style.height = "0px";

        panel.getBoundingClientRect();


        /*
          Activate the CSS open state.
        */

        chapter.classList.add("is-open");


        /*
          Animate to the panel's natural height.
        */

        requestAnimationFrame(() => {
            panel.style.height =
                `${panel.scrollHeight}px`;
        });


        /*
          Once the animation finishes, return to auto height.
        */

        window.setTimeout(() => {
            if (
                trigger.getAttribute("aria-expanded") ===
                "true"
            ) {
                panel.style.height = "auto";
            }
        }, panelAnimationTime);
    }


    /* =========================================================
       CLOSE A CHAPTER
       ========================================================= */

    function closeChapter(chapter, animate = true) {
        const { trigger, panel } =
            getChapterParts(chapter);

        if (
            !trigger ||
            !panel ||
            panel.hidden
        ) {
            return;
        }


        trigger.setAttribute(
            "aria-expanded",
            "false"
        );


        /*
          Reduced motion or initial setup:
          close immediately.
        */

        if (!animate || reduceMotion.matches) {
            chapter.classList.remove("is-open");

            panel.style.height = "";
            panel.hidden = true;

            return;
        }


        /*
          Convert height:auto into pixels so it can animate.
        */

        panel.style.height =
            `${panel.scrollHeight}px`;

        panel.getBoundingClientRect();


        /*
          Remove the CSS open state.
        */

        chapter.classList.remove("is-open");


        /*
          Collapse to zero.
        */

        requestAnimationFrame(() => {
            panel.style.height = "0px";
        });


        /*
          Hide it when the animation has finished.
        */

        window.setTimeout(() => {
            if (
                trigger.getAttribute("aria-expanded") ===
                "false"
            ) {
                panel.hidden = true;
                panel.style.height = "";
            }
        }, panelAnimationTime);
    }


    /* =========================================================
       GENTLY FOLLOW THE OPENED CHAPTER
       ========================================================= */

    function followChapterToTop(chapter) {
        /*
          Cancel any previous automatic scroll.
        */

        if (activeScrollFrame) {
            cancelAnimationFrame(activeScrollFrame);
            activeScrollFrame = null;
        }


        /*
          Reduced motion:
          position immediately.
        */

        if (reduceMotion.matches) {
            const targetY =
                window.scrollY +
                chapter.getBoundingClientRect().top -
                scrollTopOffset;

            window.scrollTo(0, targetY);

            return;
        }


        const startY = window.scrollY;
        const startTime = performance.now();


        /*
          Smooth acceleration and deceleration.
        */

        function easeOutQuart(progress) {
            return 1 - Math.pow(1 - progress, 4);
        }


        function animateScroll(currentTime) {
            const elapsed =
                currentTime - startTime;

            const progress = Math.min(
                elapsed / scrollDuration,
                1
            );

            const eased =
                easeOutQuart(progress);


            /*
              Recalculate the chapter position every frame.

              This is important because another chapter may still
              be collapsing above it while this one opens.
            */

            const targetY =
                window.scrollY +
                chapter.getBoundingClientRect().top -
                scrollTopOffset;


            const nextY =
                startY +
                (targetY - startY) * eased;


            window.scrollTo(
                0,
                nextY
            );


            if (progress < 1) {
                activeScrollFrame =
                    requestAnimationFrame(animateScroll);
            } else {
                activeScrollFrame = null;
            }
        }


        activeScrollFrame =
            requestAnimationFrame(animateScroll);
    }


    /* =========================================================
       INITIAL PAGE STATE
       ========================================================= */

    chapters.forEach((chapter) => {
        const { trigger, panel } =
            getChapterParts(chapter);

        if (!trigger || !panel) {
            return;
        }


        const startsOpen =
            trigger.getAttribute(
                "aria-expanded"
            ) === "true";


        if (startsOpen) {
            chapter.classList.add("is-open");

            panel.hidden = false;
            panel.style.height = "auto";
        } else {
            chapter.classList.remove("is-open");

            panel.hidden = true;
            panel.style.height = "";
        }
    });


    /* =========================================================
       CHAPTER SELECTION AND NAVIGATION
       ========================================================= */

    function selectChapter(chapter, allowClose = false) {
        const { trigger } = getChapterParts(chapter);

        if (!trigger) {
            return;
        }

        const alreadyOpen =
            trigger.getAttribute("aria-expanded") === "true";

        if (alreadyOpen && allowClose) {
            if (activeScrollFrame !== null) {
                cancelAnimationFrame(activeScrollFrame);
                activeScrollFrame = null;
            }

            closeChapter(chapter);
            scheduleActiveUpdate();
            return;
        }

        chapters.forEach((otherChapter) => {
            if (otherChapter !== chapter) {
                closeChapter(otherChapter);
            }
        });

        setActiveChapter(chapter);
        followChapterToTop(chapter);

        if (!alreadyOpen) {
            openChapter(chapter);
        }
    }

    chapters.forEach((chapter) => {
        const { trigger } = getChapterParts(chapter);

        trigger?.addEventListener("click", () => {
            selectChapter(chapter, true);
        });
    });

    chapterLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const chapter = document.getElementById(
                link.getAttribute("href").slice(1)
            );

            if (!chapter) {
                return;
            }

            event.preventDefault();
            history.pushState(null, "", `#${chapter.id}`);
            selectChapter(chapter);
        });
    });

    function openLinkedChapter() {
        const chapter = chapters.find(
            (item) => `#${item.id}` === window.location.hash
        );

        if (!chapter) {
            scheduleActiveUpdate();
            return;
        }

        chapters.forEach((otherChapter) => {
            if (otherChapter !== chapter) {
                closeChapter(otherChapter, false);
            }
        });

        openChapter(chapter, false);
        setActiveChapter(chapter);

        requestAnimationFrame(() => {
            const previousScrollBehavior =
                document.documentElement.style.scrollBehavior;

            document.documentElement.style.scrollBehavior = "auto";
            window.scrollTo(
                0,
                window.scrollY +
                    chapter.getBoundingClientRect().top -
                    scrollTopOffset
            );
            document.documentElement.style.scrollBehavior =
                previousScrollBehavior;
        });
    }

    window.addEventListener("scroll", scheduleActiveUpdate, { passive: true });
    window.addEventListener("resize", scheduleActiveUpdate);
    window.addEventListener("hashchange", openLinkedChapter);
    window.addEventListener("popstate", openLinkedChapter);

    openLinkedChapter();
})();
