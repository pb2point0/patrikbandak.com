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

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const panelAnimationTime = 500;
    const scrollDuration = 1400;
    const scrollTopOffset = 16;

    let activeScrollFrame = null;


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
       CLICK BEHAVIOR
       ========================================================= */

    chapters.forEach((chapter) => {
        const { trigger } =
            getChapterParts(chapter);

        if (!trigger) {
            return;
        }


        trigger.addEventListener("click", () => {
            const alreadyOpen =
                trigger.getAttribute(
                    "aria-expanded"
                ) === "true";


            /*
              Clicking the currently open chapter closes it.
            */

            if (alreadyOpen) {
                if (activeScrollFrame) {
                    cancelAnimationFrame(activeScrollFrame);
                    activeScrollFrame = null;
                }

                closeChapter(chapter);

                return;
            }


            /*
              Close any other open chapter.
            */

            chapters.forEach((otherChapter) => {
                if (otherChapter !== chapter) {
                    closeChapter(otherChapter);
                }
            });


            /*
              Follow the chapter toward the top while
              the accordion is rearranging the page.
            */

            followChapterToTop(chapter);


            /*
              Open the selected chapter.
            */

            openChapter(chapter);
        });
    });
})();