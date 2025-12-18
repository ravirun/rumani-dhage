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

  // --- Product Offer Widget Logic ---
  const offerWidgets = document.querySelectorAll(".product-offer-widget");

  offerWidgets.forEach((widget) => {
    const priceElement = widget.querySelector("[data-price-display]");
    const basePrice = parseFloat(widget.dataset.basePrice);
    const volumeOptions = widget.querySelectorAll(".volume-option");
    const purchaseOptions = widget.querySelectorAll(".purchase-option");
    const quantityInput = widget.querySelector('input[name="quantity"]');
    const sellingPlanInput = widget.querySelector('input[name="selling_plan"]');
    const shippingFill = widget.querySelector(".shipping-progress__fill");
    const threshold = parseFloat(widget.dataset.shippingThreshold); // e.g. 5000 (cents) or 50 (dollars)

    let currentMultiplier = 1; // 1x, 2x, 3x
    let currentDiscount = 0; // percentage decimal e.g. 0.10
    let isSubscription = false;

    // Volume Selection
    volumeOptions.forEach((opt) => {
      opt.addEventListener("click", () => {
        volumeOptions.forEach((o) => o.classList.remove("is-selected"));
        opt.classList.add("is-selected");

        currentMultiplier = parseInt(opt.dataset.qty);
        quantityInput.value = currentMultiplier; // Update hidden form input
        updateTotal();
      });
    });

    // Purchase Type Selection
    purchaseOptions.forEach((opt) => {
      opt.addEventListener("click", () => {
        const radio = opt.querySelector('input[type="radio"]');
        radio.checked = true;

        purchaseOptions.forEach((o) => o.classList.remove("is-selected"));
        opt.classList.add("is-selected");

        if (radio.value === "sub") {
          isSubscription = true;
          sellingPlanInput.value = radio.dataset.planId || "";
        } else {
          isSubscription = false;
          sellingPlanInput.value = "";
        }
        updateTotal();
      });
    });

    function updateTotal() {
      let unitPrice = basePrice;

      // Logic: if sub, apply sub discount. If volume, apply volume discount?
      // For simplicity, let's assume sub gives X% off
      if (isSubscription) {
        const subDiscount = parseFloat(widget.dataset.subDiscount) || 0; // e.g 10
        unitPrice = unitPrice * ((100 - subDiscount) / 100);
      }

      const total = unitPrice * currentMultiplier;

      // Format currency (simplified)
      priceElement.innerText = (total / 100).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
      });

      // Update Shipping Bar
      // Assuming threshold is in cents. If price is 1000, 100%
      let percent = (total / threshold) * 100;
      if (percent > 100) percent = 100;
      shippingFill.style.width = percent + "%";
    }

    // Init
    updateTotal();
  });
});
