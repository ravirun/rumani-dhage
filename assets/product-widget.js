document.addEventListener("DOMContentLoaded", () => {
  // --- Tabbed Recommendations Logic ---
  const tabContainers = document.querySelectorAll(".tabbed-recs");

  tabContainers.forEach((container) => {
    const tabs = container.querySelectorAll(".tabbed-recs__tab-btn");
    const grids = container.querySelectorAll(".tabbed-recs__grid");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        // Deactivate all
        tabs.forEach((t) => t.classList.remove("is-active"));
        grids.forEach((g) => g.classList.remove("is-active"));

        // Activate clicked
        tab.classList.add("is-active");
        const targetId = tab.dataset.target;
        const targetGrid = container.querySelector(targetId);
        if (targetGrid) targetGrid.classList.add("is-active");
      });
    });
  });

  // --- Product Offer Widget Logic (Luxury Trust Block) ---
  const offerWidgets = document.querySelectorAll(".product-offer-widget");

  offerWidgets.forEach((widget) => {
    // Bridal Bundle Selection
    const bridalOptions = widget.querySelectorAll(".bridal-option");

    bridalOptions.forEach((opt) => {
      opt.addEventListener("click", (e) => {
        // Find the radio input inside the clicked option
        const radio = opt.querySelector('input[type="radio"]');

        // If the click wasn't on the radio itself, check it manually
        if (e.target !== radio) {
          radio.checked = true;
        }

        // Update visual state
        bridalOptions.forEach((o) => o.classList.remove("is-selected"));
        opt.classList.add("is-selected");
      });
    });
  });
});
