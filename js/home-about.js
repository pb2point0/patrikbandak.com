(() => {
  const trigger = document.querySelector(".home-about-trigger");
  const invitation = document.getElementById("home-about-invitation");
  const openButton = document.querySelector(".home-about-open");
  const about = document.getElementById("big-about");

  if (!trigger || !invitation || !openButton || !about) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fadeDuration = 900;
  let aboutAnimation = null;
  let invitationAnimation = null;

  function revealInvitation() {
    invitationAnimation?.cancel();
    invitationAnimation = null;
    invitation.hidden = false;
    invitation.inert = false;
    trigger.setAttribute("aria-expanded", "true");
  }

  function collapseInvitation() {
    if (invitationAnimation) return;

    trigger.setAttribute("aria-expanded", "false");
    invitation.inert = true;
    if (invitation.contains(document.activeElement)) {
      trigger.focus({ preventScroll: true });
    }
    if (reduceMotion.matches) {
      invitation.hidden = true;
      return;
    }

    const style = getComputedStyle(invitation);
    const animation = invitation.animate([
      { opacity: style.opacity, transform: style.transform },
      { opacity: 0, transform: "translateY(-0.35rem)" }
    ], { duration: 700, easing: "ease", fill: "forwards" });
    invitationAnimation = animation;
    animation.onfinish = () => {
      if (invitationAnimation !== animation) return;
      invitation.hidden = true;
      animation.cancel();
      invitationAnimation = null;
    };
  }

  function fadeAbout(from, to, onFinish) {
    aboutAnimation?.cancel();
    aboutAnimation = null;

    if (reduceMotion.matches) {
      onFinish?.();
      return;
    }

    const animation = about.animate([{ opacity: from }, { opacity: to }], {
      duration: fadeDuration,
      easing: "ease",
      fill: "forwards"
    });
    aboutAnimation = animation;
    animation.onfinish = () => {
      if (aboutAnimation !== animation) return;
      onFinish?.();
      animation.cancel();
      aboutAnimation = null;
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
      button.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
      button.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
    }

    button.addEventListener("pointerenter", followPointer);
    button.addEventListener("pointermove", followPointer);
  });

  function revealAbout(animate = false) {
    const opacity = about.hidden ? 0 : Number(getComputedStyle(about).opacity);
    revealInvitation();
    openButton.setAttribute("aria-expanded", "true");
    about.hidden = false;
    about.inert = false;
    if (animate) {
      fadeAbout(opacity, 1);
    } else {
      aboutAnimation?.cancel();
      aboutAnimation = null;
    }
    document.querySelector(".home-shell").classList.add("has-about");
  }

  function collapseAbout(animate = false) {
    openButton.setAttribute("aria-expanded", "false");
    if (about.hidden) return;

    if (about.contains(document.activeElement)) {
      trigger.focus({ preventScroll: true });
    }
    about.inert = true;

    if (animate) {
      fadeAbout(Number(getComputedStyle(about).opacity), 0, () => {
        about.hidden = true;
      });
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "instant" : "smooth" });
    } else {
      aboutAnimation?.cancel();
      aboutAnimation = null;
      about.hidden = true;
    }
  }

  trigger.addEventListener("click", () => {
    if (!about.hidden) {
      if (about.inert) return;
      collapseAbout(true);
      if (window.location.hash === "#big-about" ||
          Array.from(about.querySelectorAll("[id]")).some((item) => `#${item.id}` === window.location.hash)) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    } else if (!invitation.hidden) {
      collapseInvitation();
    } else {
      revealInvitation();
    }
  });

  openButton.addEventListener("click", () => {
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
