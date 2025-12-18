document.addEventListener("DOMContentLoaded", () => {
  const initInteractiveFeatures = () => {
    const section = document.querySelector(".interactive-features");
    if (!section) return;

    const cards = section.querySelectorAll(".feature-card");

    const observerOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // Only animate once
        }
      });
    }, observerOptions);

    cards.forEach((card) => {
      observer.observe(card);
    });
  };

  initInteractiveFeatures();

  // Re-run if Shopify Design Mode fires an event (for Theme Editor support)
  document.addEventListener("shopify:section:load", initInteractiveFeatures);
});
