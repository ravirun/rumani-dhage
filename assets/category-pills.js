/**
 * Category Pills Component
 * Handles dynamic scroll masks for horizontal navigation
 */
class CategoryPills {
  constructor(container) {
    this.container = container;
    this.scrollWrapper = container.querySelector(".category-pills__container");

    if (!this.scrollWrapper) return;

    this.init();
  }

  init() {
    this.updateMasks();
    this.scrollWrapper.addEventListener("scroll", () => this.updateMasks(), {
      passive: true,
    });
    window.addEventListener("resize", () => this.updateMasks(), {
      passive: true,
    });
  }

  updateMasks() {
    const scrollLeft = this.scrollWrapper.scrollLeft;
    const scrollWidth = this.scrollWrapper.scrollWidth;
    const clientWidth = this.scrollWrapper.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    // Toggle mask classes based on scroll position
    if (scrollLeft > 10) {
      this.container.classList.add("has-scroll-left");
    } else {
      this.container.classList.remove("has-scroll-left");
    }

    if (scrollLeft < maxScroll - 10) {
      this.container.classList.add("has-scroll-right");
    } else {
      this.container.classList.remove("has-scroll-right");
    }
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  const initPills = () => {
    const containers = document.querySelectorAll(".category-pills");
    containers.forEach((container) => new CategoryPills(container));
  };

  initPills();

  // Support for Shopify Theme Editor
  document.addEventListener("shopify:section:load", initPills);
});
