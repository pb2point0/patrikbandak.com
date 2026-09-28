const menuXDemo = document.querySelector(".menu-x-demo");
const menuXDemoButton = menuXDemo?.querySelector(".menu-x-demo__button");

menuXDemoButton?.addEventListener("click", () => {
  const isOpen = menuXDemo.classList.toggle("is-open");
  const nextRotation = Number(menuXDemoButton.dataset.rotation || 0) + 90;

  menuXDemoButton.dataset.rotation = String(nextRotation);
  menuXDemoButton.style.setProperty("--menu-x-demo-rotation", `${nextRotation}deg`);
  menuXDemoButton.setAttribute(
    "aria-label",
    isOpen ? "Show menu icon" : "Show menu close icon"
  );
});
