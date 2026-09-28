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
})();