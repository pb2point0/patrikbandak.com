(() => {
  document.documentElement.classList.add(
    "has-case-study-js"
  );


  const comparisons = Array.from(
    document.querySelectorAll(
      "[data-comparison]"
    )
  );


  comparisons.forEach((comparison) => {
    const buttons = Array.from(
      comparison.querySelectorAll(
        "[data-comparison-target]"
      )
    );

    const panels = Array.from(
      comparison.querySelectorAll(
        "[data-comparison-panel]"
      )
    );


    if (
      !buttons.length ||
      !panels.length
    ) {
      return;
    }


    function showComparison(target) {
      buttons.forEach((button) => {
        const isActive =
          button.dataset.comparisonTarget ===
          target;


        button.setAttribute(
          "aria-pressed",
          String(isActive)
        );
      });


      panels.forEach((panel) => {
        const isActive =
          panel.dataset.comparisonPanel ===
          target;


        panel.hidden =
          !isActive;
      });
    }


    buttons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          showComparison(
            button.dataset.comparisonTarget
          );
        }
      );
    });


    const defaultButton =
      buttons.find(
        (button) =>
          button.getAttribute(
            "aria-pressed"
          ) === "true"
      );


    showComparison(
      defaultButton
        ?.dataset
        .comparisonTarget ??
      buttons[0]
        .dataset
        .comparisonTarget
    );
  });


  /* =========================================================
     IMAGE VIEWER
     ========================================================= */

  const precisePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );


  if (
    !precisePointer.matches ||
    !("HTMLDialogElement" in window)
  ) {
    return;
  }


  const figures = Array.from(
    document.querySelectorAll(
      ".case-study figure"
    )
  );

  const expandableFigures = figures
    .map((figure) => ({
      figure,
      image: Array.from(figure.children)
        .find((child) =>
          child.tagName === "IMG"
        )
    }))
    .filter(({ image }) => image);


  if (!expandableFigures.length) {
    return;
  }


  const viewer = document.createElement(
    "dialog"
  );

  viewer.className = "image-viewer";
  viewer.setAttribute(
    "aria-label",
    "Expanded project image"
  );

  viewer.innerHTML = [
    '<div class="image-viewer__toolbar">',
    '<button class="image-viewer__zoom" type="button" aria-pressed="false">',
    "Actual size",
    "</button>",
    '<button class="image-viewer__close" type="button">',
    "Close",
    "</button>",
    "</div>",
    '<div class="image-viewer__stage">',
    '<figure class="image-viewer__figure">',
    '<img class="image-viewer__image" alt="">',
    '<figcaption class="image-viewer__caption"></figcaption>',
    "</figure>",
    "</div>"
  ].join("");

  document.body.appendChild(viewer);


  const stage = viewer.querySelector(
    ".image-viewer__stage"
  );

  const viewerImage = viewer.querySelector(
    ".image-viewer__image"
  );

  const viewerCaption = viewer.querySelector(
    ".image-viewer__caption"
  );

  const zoomButton = viewer.querySelector(
    ".image-viewer__zoom"
  );

  const closeButton = viewer.querySelector(
    ".image-viewer__close"
  );

  let activeTrigger = null;
  let closing = false;


  expandableFigures.forEach(({
    figure,
    image
  }) => {
    const trigger = document.createElement(
      "button"
    );

    trigger.type = "button";
    trigger.className = "case-media-trigger";
    trigger.setAttribute(
      "aria-haspopup",
      "dialog"
    );
    trigger.setAttribute(
      "aria-label",
      "Expand image: " +
        (image.alt || "Project image")
    );

    image.before(trigger);
    trigger.appendChild(image);

    trigger.addEventListener(
      "click",
      () => openViewer(
        figure,
        image,
        trigger
      )
    );
  });


  async function openViewer(
    figure,
    sourceImage,
    trigger
  ) {
    if (viewer.open) {
      return;
    }

    activeTrigger = trigger;
    closing = false;

    clearViewerAnimations();

    viewer.classList.remove(
      "is-closing",
      "is-actual-size"
    );

    zoomButton.setAttribute(
      "aria-pressed",
      "false"
    );
    zoomButton.textContent = "Actual size";

    viewerImage.src =
      sourceImage.currentSrc ||
      sourceImage.src;
    viewerImage.alt = sourceImage.alt;

    const caption = figure.querySelector(
      "figcaption"
    )?.textContent.trim() ?? "";

    viewerCaption.textContent = caption;
    viewerCaption.hidden = !caption;

    const sourceRect =
      sourceImage.getBoundingClientRect();


    try {
      await viewerImage.decode();
    } catch {
      /* The browser can still display a cached image. */
    }


    viewer.showModal();

    await nextFrame();


    if (!reducedMotion.matches) {
      const targetRect =
        viewerImage.getBoundingClientRect();

      animateBetween(
        sourceRect,
        targetRect,
        false
      );
    }

    closeButton.focus({
      preventScroll: true
    });
  }


  async function closeViewer() {
    if (
      !viewer.open ||
      closing
    ) {
      return;
    }

    closing = true;
    viewer.classList.add(
      "is-closing"
    );


    if (
      !reducedMotion.matches &&
      activeTrigger
    ) {
      const sourceRect =
        viewerImage.getBoundingClientRect();

      const targetRect =
        activeTrigger
          .querySelector("img")
          .getBoundingClientRect();

      const targetIsVisible =
        targetRect.bottom > 0 &&
        targetRect.top < window.innerHeight;


      if (targetIsVisible) {
        await animateBetween(
          sourceRect,
          targetRect,
          true
        ).finished.catch(() => {});
      } else {
        await viewer.animate(
          [
            { opacity: 1 },
            { opacity: 0 }
          ],
          {
            duration: 180,
            easing: "ease",
            fill: "both"
          }
        ).finished.catch(() => {});
      }
    }


    viewer.close();
    clearViewerAnimations();

    viewer.classList.remove(
      "is-closing",
      "is-actual-size"
    );

    viewerImage.removeAttribute("src");

    activeTrigger?.focus({
      preventScroll: true
    });

    activeTrigger = null;
    closing = false;
  }


  function animateBetween(
    sourceRect,
    targetRect,
    reverse
  ) {
    const deltaX =
      sourceRect.left - targetRect.left;

    const deltaY =
      sourceRect.top - targetRect.top;

    const scaleX =
      sourceRect.width / targetRect.width;

    const scaleY =
      sourceRect.height / targetRect.height;

    const transformed = {
      transform:
        "translate(" +
        deltaX +
        "px, " +
        deltaY +
        "px) scale(" +
        scaleX +
        ", " +
        scaleY +
        ")"
    };

    const settled = {
      transform: "none"
    };


    return viewerImage.animate(
      reverse
        ? [settled, transformed]
        : [transformed, settled],
      {
        duration: reverse ? 220 : 360,
        easing:
          "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "both"
      }
    );
  }


  function nextFrame() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });
  }


  function clearViewerAnimations() {
    [
      viewer,
      viewerImage
    ].forEach((element) => {
      element
        .getAnimations()
        .forEach((animation) => {
          animation.cancel();
        });
    });
  }


  zoomButton.addEventListener(
    "click",
    () => {
      const actualSize =
        viewer.classList.toggle(
          "is-actual-size"
        );

      zoomButton.setAttribute(
        "aria-pressed",
        String(actualSize)
      );

      zoomButton.textContent =
        actualSize
          ? "Fit image"
          : "Actual size";

      stage.scrollTo({
        top: 0,
        left: 0,
        behavior: reducedMotion.matches
          ? "auto"
          : "smooth"
      });
    }
  );


  closeButton.addEventListener(
    "click",
    closeViewer
  );


  stage.addEventListener(
    "click",
    closeViewer
  );


  viewer.addEventListener(
    "cancel",
    (event) => {
      event.preventDefault();
      closeViewer();
    }
  );
})();
