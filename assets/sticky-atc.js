document.addEventListener("DOMContentLoaded", () => {
  const stickyAtc = document.querySelector(".sticky-atc");
  if (!stickyAtc) return;

  // Section Rendering API: Identifying section ID
  const sectionId = stickyAtc.id.replace("StickyATC-", "");

  const mainAtc = document.querySelector(
    'form[action*="/cart/add"] button[type="submit"]'
  );
  // Re-select elements inside functions to ensure we get fresh ones after updates
  const getStickyBtn = () => stickyAtc.querySelector(".sticky-atc__btn");
  const getStickySelect = () => stickyAtc.querySelector(".sticky-atc__select");

  const mainForm = document.querySelector('form[action*="/cart/add"]');

  // Throttle Utility
  function throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // 1. Scroll Detection with Throttling
  if (mainAtc) {
    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        // If main ATC is NOT visible (scrolled past), show sticky bar
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          stickyAtc.classList.add("is-visible");
        } else {
          stickyAtc.classList.remove("is-visible");
        }
      });
    };

    // IntersectionObserver is naturally performant, but we can stick to standard logic
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "0px",
      threshold: 0,
    });
    observer.observe(mainAtc);
  }

  // 2. Add to Cart Logic (Event delegation to handle DOM updates)
  stickyAtc.addEventListener("click", (e) => {
    if (e.target.closest(".sticky-atc__btn")) {
      e.preventDefault();
      const stickySelect = getStickySelect();

      if (mainForm) {
        // Ensure correct variant is selected in main form
        if (stickySelect) {
          const variantId = stickySelect.value;
          const mainInput = mainForm.querySelector('input[name="id"]');
          if (mainInput) mainInput.value = variantId;
        }

        // Trigger click on main button or submit form
        if (mainAtc) {
          mainAtc.click();
        } else {
          mainForm.submit();
        }
      }
    }
  });

  // 3. Section Rendering API for Variant Changes
  stickyAtc.addEventListener("change", (e) => {
    if (e.target.matches(".sticky-atc__select")) {
      const variantId = e.target.value;
      const url = `${window.location.pathname}?variant=${variantId}&section_id=${sectionId}`;

      fetch(url)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(
            responseText,
            "text/html"
          );

          // Replace specific parts or the whole inner content
          // We target .sticky-atc__inner to update product info, price, and button status
          const destination = stickyAtc.querySelector(".sticky-atc__inner");
          const source = html.querySelector(".sticky-atc__inner");

          if (source && destination) {
            destination.innerHTML = source.innerHTML;

            // Re-bind specific behaviors if needed?
            // Since we use event delegation on `stickyAtc` (wrapper), we don't need to re-bind listeners!

            // Optimistic UI: Also update main form ID just in case
            if (mainForm) {
              const mainInput = mainForm.querySelector('input[name="id"]');
              if (mainInput) mainInput.value = variantId;
            }
          }
        })
        .catch((e) => {
          console.error(e);
        });
    }
  });
});
