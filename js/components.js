async function loadComponent(id, file) {
  const response = await fetch(file);
  const html = await response.text();

  document.getElementById(id).innerHTML = html;
}

loadComponent("site-header", "/components/header.html");
loadComponent("site-footer", "/components/footer.html");

document.addEventListener("click", (event) => {
  const menuButton = event.target.closest(".menu-toggle");

  if (!menuButton) {
    return;
  }

  const navigation = document.querySelector("#site-nav");
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";

  menuButton.setAttribute("aria-expanded", String(!isOpen));

  menuButton.setAttribute(
    "aria-label",
    isOpen ? "Open navigation" : "Close navigation"
  );

  navigation.classList.toggle("is-open", !isOpen);
});