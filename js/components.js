async function loadComponent(id, file) {
  const response = await fetch(file);
  const html = await response.text();

  document.getElementById(id).innerHTML = html;
}


/* =========================================================
   LOAD SHARED COMPONENTS
   ========================================================= */

loadComponent("site-header", "/components/header.html");
loadComponent("site-footer", "/components/footer.html");


/* =========================================================
   CLICK INTERACTIONS
   ========================================================= */

document.addEventListener("click", (event) => {

  /* ---------------------------------------------------------
     MOBILE MENU
     --------------------------------------------------------- */

  const menuButton = event.target.closest(".menu-toggle");

  if (menuButton) {
    const navigation = document.querySelector("#site-nav");
    const isOpen =
      menuButton.getAttribute("aria-expanded") === "true";

    menuButton.setAttribute(
      "aria-expanded",
      String(!isOpen)
    );

    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Open navigation" : "Close navigation"
    );

    navigation.classList.toggle(
      "is-open",
      !isOpen
    );

    const currentRotation = Number(
      menuButton.dataset.rotation || 0
    );

    const nextRotation = currentRotation + 90;

    menuButton.dataset.rotation = String(nextRotation);

    menuButton.style.setProperty(
      "--menu-rotation",
      `${nextRotation}deg`
    );

    /*
      Close Projects whenever the main
      mobile navigation closes.
    */

    if (isOpen) {
      closeProjectsDropdown();
    }

    return;
  }


  /* ---------------------------------------------------------
     PROJECTS DROPDOWN
     --------------------------------------------------------- */

  const dropdownTrigger = event.target.closest(
    ".nav-dropdown__trigger"
  );

  if (dropdownTrigger) {
    event.stopPropagation();

    const dropdown = dropdownTrigger.closest(
      ".nav-dropdown"
    );

    const isOpen = dropdown.classList.contains(
      "is-open"
    );

    setProjectsDropdown(
      dropdown,
      dropdownTrigger,
      !isOpen
    );

    return;
  }


  /* ---------------------------------------------------------
     CLICK OUTSIDE
     --------------------------------------------------------- */

  if (!event.target.closest(".nav-dropdown")) {
    closeProjectsDropdown();
  }

});


/* =========================================================
   KEYBOARD
   ========================================================= */

document.addEventListener("keydown", (event) => {

  if (event.key !== "Escape") {
    return;
  }

  const openDropdown = document.querySelector(
    ".nav-dropdown.is-open"
  );

  if (!openDropdown) {
    return;
  }

  const trigger = openDropdown.querySelector(
    ".nav-dropdown__trigger"
  );

  closeProjectsDropdown();

  trigger?.focus();
});


/* =========================================================
   PROJECTS HELPERS
   ========================================================= */

function setProjectsDropdown(
  dropdown,
  trigger,
  open
) {
  dropdown.classList.toggle(
    "is-open",
    open
  );

  trigger.setAttribute(
    "aria-expanded",
    String(open)
  );
}


function closeProjectsDropdown() {
  const dropdown = document.querySelector(
    ".nav-dropdown.is-open"
  );

  if (!dropdown) {
    return;
  }

  const trigger = dropdown.querySelector(
    ".nav-dropdown__trigger"
  );

  dropdown.classList.remove("is-open");

  trigger?.setAttribute(
    "aria-expanded",
    "false"
  );
}