document.addEventListener("DOMContentLoaded", () => {
  const stickyAtc = document.querySelector(".sticky-atc");
  if (!stickyAtc) return;

  const mainAtc = document.querySelector(
    'form[action*="/cart/add"] button[type="submit"]'
  );
  const stickyBtn = stickyAtc.querySelector(".sticky-atc__btn");
  const stickySelect = stickyAtc.querySelector(".sticky-atc__select");
  const mainForm = document.querySelector('form[action*="/cart/add"]');

  // 1. Scroll Detection
  if (mainAtc) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // If main ATC is NOT visible (scrolled past), show sticky bar
          if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
            stickyAtc.classList.add("is-visible");
          } else {
            stickyAtc.classList.remove("is-visible");
          }
        });
      },
      { rootMargin: "0px", threshold: 0 }
    );

    observer.observe(mainAtc);
  }

  // 2. Add to Cart Logic
  stickyBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // If we have a connected main form, we can just trigger its submit
    // Or we can fetch directly. Best practice: Trigger main form add.
    if (mainForm) {
      // Ensure correct variant is selected in main form
      if (stickySelect) {
        const variantId = stickySelect.value;
        const mainInput = mainForm.querySelector('input[name="id"]');
        if (mainInput) mainInput.value = variantId;
      }

      // Trigger click on main button or submit form
      // We'll use the main button to trigger any theme-specific AJAX drawer logic
      if (mainAtc) {
        mainAtc.click();
      } else {
        mainForm.submit();
      }
    }
  });

  // 3. Sync Variant Selection (Bidirectional)
  // When sticky select changes, update main select (if possible)
  if (stickySelect) {
    stickySelect.addEventListener("change", () => {
      // Logic to update main product form variant picker would go here
      // This is complex as themes vary (radios vs selects)
      // For now, we update the hidden input before submit (handled in click above)

      // Just update price in sticky bar
      const selectedOption = stickySelect.options[stickySelect.selectedIndex];
      const price = selectedOption.dataset.price;
      const priceEl = stickyAtc.querySelector(".sticky-atc__price");
      if (priceEl) priceEl.innerText = price;
    });
  }
});
