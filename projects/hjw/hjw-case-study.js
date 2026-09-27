document.documentElement.classList.add("has-case-study-js");

const comparisonButtons = [...document.querySelectorAll("[data-comparison-target]")];
const comparisonPanels = [...document.querySelectorAll("[data-comparison-panel]")];

function showComparison(target) {
  comparisonButtons.forEach((button) => {
    const isActive = button.dataset.comparisonTarget === target;
    button.setAttribute("aria-pressed", String(isActive));
  });

  comparisonPanels.forEach((panel) => {
    const isActive = panel.dataset.comparisonPanel === target;
    panel.hidden = !isActive;
    panel.classList.toggle("is-active", isActive);
  });
}

comparisonButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showComparison(button.dataset.comparisonTarget);
  });
});

showComparison("after");

// The shared header is injected asynchronously by /js/components.js.
// Mark Projects as the active section once it appears.
const headerRoot = document.querySelector("#site-header");

if (headerRoot) {
  const markProjectsCurrent = () => {
    const projectsLink = headerRoot.querySelector('a[href="/projects/"]');

    if (!projectsLink) {
      return false;
    }

    projectsLink.setAttribute("aria-current", "page");
    return true;
  };

  if (!markProjectsCurrent()) {
    const observer = new MutationObserver(() => {
      if (markProjectsCurrent()) {
        observer.disconnect();
      }
    });

    observer.observe(headerRoot, { childList: true, subtree: true });
  }
}
