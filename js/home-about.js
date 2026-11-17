(() => {
  const trigger = document.querySelector(".home-about-trigger");
  const invitation = document.getElementById("home-about-invitation");
  const openButton = document.querySelector(".home-about-open");
  const about = document.getElementById("big-about");

  if (!trigger || !invitation || !openButton || !about) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const discovery = trigger.closest(".home-about-discovery");
  const fadeDuration = 900;
  const entranceDuration = 2600;
  let aboutAnimation = null;
  let aboutOpacityAnimation = null;
  let invitationAnimation = null;

  function stopAboutAnimation() {
    aboutAnimation?.cancel();
    aboutOpacityAnimation?.cancel();
    aboutAnimation = null;
    aboutOpacityAnimation = null;
    about.classList.remove("is-animating");
  }

  function animateInvitation(keyframes, onFinish) {
    invitationAnimation?.cancel();
    invitationAnimation = null;
    if (reduceMotion.matches) {
      onFinish?.();
      return;
    }

    const animation = invitation.animate(keyframes, {
      duration: 1000,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      fill: "both"
    });
    invitationAnimation = animation;
    animation.onfinish = () => {
      if (invitationAnimation !== animation) return;
      onFinish?.();
      animation.cancel();
      invitationAnimation = null;
    };
  }

  function revealInvitation() {
    if (!invitation.hidden && !invitation.inert) return;
    const opacity = invitation.hidden ? 0 : getComputedStyle(invitation).opacity;
    const transform = invitation.hidden ? "translateY(0)" : getComputedStyle(invitation).transform;
    invitation.hidden = false;
    invitation.inert = false;
    trigger.setAttribute("aria-expanded", "true");
    discovery.classList.add("is-expanded");
    animateInvitation([
      { opacity, transform },
      { opacity: 1, transform: "translateY(0.5rem)" }
    ]);
  }

  function collapseInvitation() {
    if (invitation.inert) return;

    trigger.setAttribute("aria-expanded", "false");
    discovery.classList.remove("is-expanded");
    invitation.inert = true;
    if (invitation.contains(document.activeElement)) {
      trigger.focus({ preventScroll: true });
    }
    const style = getComputedStyle(invitation);
    animateInvitation([
      { opacity: style.opacity, transform: style.transform },
      { opacity: 0, transform: "translateY(0)" }
    ], () => {
      invitation.hidden = true;
    });
  }

  function fadeAbout(from, to, fromHeight, toHeight, onFinish) {
    stopAboutAnimation();

    if (reduceMotion.matches) {
      onFinish?.();
      return;
    }

    const opening = to === 1;
    about.classList.add("is-animating");
    const animation = about.animate([
      { height: `${fromHeight}px` },
      { height: `${toHeight}px` }
    ], {
      duration: opening ? entranceDuration : fadeDuration,
      easing: opening ? "cubic-bezier(0.4, 0, 0.2, 1)" : "ease",
      fill: "both"
    });
    aboutOpacityAnimation = about.animate([
      { opacity: from },
      { opacity: to }
    ], {
      duration: opening ? 2200 : fadeDuration,
      delay: opening && from === 0 ? 250 : 0,
      easing: "ease-in-out",
      fill: "both"
    });
    aboutAnimation = animation;
    animation.onfinish = () => {
      if (aboutAnimation !== animation) return;
      onFinish?.();
      stopAboutAnimation();
    };
  }

  [trigger, openButton].forEach((button) => {
    const shimmer = document.createElement("span");
    shimmer.className = "home-about-shimmer";
    shimmer.setAttribute("aria-hidden", "true");
    shimmer.textContent = button.textContent.trim();
    button.append(shimmer);

    function followPointer(event) {
      const bounds = button.getBoundingClientRect();
      const position = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
      button.style.setProperty("--shimmer-position", `${75 - position * 50}%`);
    }

    button.addEventListener("pointerenter", followPointer);
    button.addEventListener("pointermove", followPointer);
  });

  function revealAbout(animate = false) {
    const opacity = about.hidden ? 0 : Number(getComputedStyle(about).opacity);
    const height = about.hidden ? 0 : about.getBoundingClientRect().height;
    stopAboutAnimation();
    revealInvitation();
    openButton.setAttribute("aria-expanded", "true");
    about.hidden = false;
    about.inert = false;
    document.querySelector(".home-shell").classList.add("has-about");
    if (animate) {
      fadeAbout(opacity, 1, height, about.getBoundingClientRect().height);
    }
  }

  function collapseAbout(animate = false) {
    openButton.setAttribute("aria-expanded", "false");
    if (about.hidden) return;

    if (about.contains(document.activeElement)) {
      trigger.focus({ preventScroll: true });
    }
    about.inert = true;
    document.querySelector(".home-shell").classList.remove("has-about");

    if (animate) {
      fadeAbout(Number(getComputedStyle(about).opacity), 0, about.getBoundingClientRect().height, 0, () => {
        about.hidden = true;
      });
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "instant" : "smooth" });
    } else {
      stopAboutAnimation();
      about.hidden = true;
    }
  }

  function clearAboutLink() {
    if (window.location.hash === "#big-about" ||
        Array.from(about.querySelectorAll("[id]")).some((item) => `#${item.id}` === window.location.hash)) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  trigger.addEventListener("click", () => {
    if (trigger.getAttribute("aria-expanded") === "true") {
      collapseAbout(true);
      collapseInvitation();
      clearAboutLink();
    } else {
      revealInvitation();
    }
  });

  openButton.addEventListener("click", () => {
    if (openButton.getAttribute("aria-expanded") === "true") {
      collapseAbout(true);
      clearAboutLink();
      return;
    }
    revealAbout(true);
    if (window.location.hash !== "#big-about") {
      history.pushState(null, "", "#big-about");
    }
    const heading = document.getElementById("big-about-title");
    heading.focus({ preventScroll: true });
  });

  function revealLinkedAbout() {
    if (window.location.hash === "#big-about" ||
        Array.from(about.querySelectorAll("[id]")).some((item) => `#${item.id}` === window.location.hash)) {
      if (about.hidden || about.inert) {
        revealAbout(true);
      }
    } else if (!window.location.hash) {
      collapseAbout();
    }
  }

  window.addEventListener("hashchange", revealLinkedAbout);
  window.addEventListener("popstate", revealLinkedAbout);
  revealLinkedAbout();
})();
