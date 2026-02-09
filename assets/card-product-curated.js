/**
 * Curated Product Card Functionality
 * Handles image slider, dots synchronization, and cart animations.
 */

class CuratedProductCard {
  constructor(cardElement) {
    this.card = cardElement;
    this.slider = this.card.querySelector(".curated-image-slider");
    this.dots = this.card.querySelectorAll(".curated-dot");
    this.addBtn = this.card.querySelector(".curated-add-btn");
    this.waBtn = this.card.querySelector(".curated-wa-btn");
    this.form = this.card.querySelector("form");

    this.init();
  }

  init() {
    if (this.slider) {
      this.slider.addEventListener("scroll", () => {
        const index = Math.round(
          this.slider.scrollLeft / this.slider.offsetWidth,
        );
        this.dots.forEach((d, i) => d.classList.toggle("active", i === index));
      });
    }

    if (this.dots.length > 0) {
      this.dots.forEach((dot, i) => {
        dot.addEventListener("click", (e) => {
          e.preventDefault();
          this.slider.scrollTo({
            left: i * this.slider.offsetWidth,
            behavior: "smooth",
          });
        });
      });
    }

    if (this.addBtn) {
      this.addBtn.addEventListener("click", (e) => this.handleCartClick(e));
    }

    if (this.waBtn) {
      this.waBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const productTitle =
          this.card.querySelector(".curated-title").innerText;
        const productUrl =
          window.location.origin +
          this.card.querySelector(".curated-title").getAttribute("href");
        const message = `Namaste! I'm interested in the ${productTitle}. You can see it here: ${productUrl}`;
        const waUrl = `https://wa.me/+919876543210?text=${encodeURIComponent(message)}`;
        window.open(waUrl, "_blank");
      });
    }
  }

  handleCartClick(e) {
    if (this.form) {
      e.preventDefault();
      const originalText = this.addBtn.innerText;
      this.addBtn.innerText = "✓ Adding...";

      const formData = new FormData(this.form);

      fetch(window.Shopify.routes.root + "cart/add.js", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          this.addBtn.innerText = "✓ In Cart";
          this.addBtn.style.backgroundColor = "#2d5a27";

          // Dispatch event for cart to update
          if (window.publish)
            window.publish("cart-updated", { sectionId: "cart-drawer" });

          setTimeout(() => {
            this.addBtn.innerText = originalText;
            this.addBtn.style.backgroundColor = "";
          }, 2000);
        })
        .catch((error) => {
          console.error("Error adding to cart:", error);
          this.addBtn.innerText = "Error!";
          setTimeout(() => {
            this.addBtn.innerText = originalText;
          }, 1500);
        });
    }
  }
}

// Initialize all curated cards on the page
document.addEventListener("DOMContentLoaded", () => {
  const curatedCards = document.querySelectorAll(".curated-product-card");
  curatedCards.forEach((card) => new CuratedProductCard(card));
});

// Also initialize on Shopify Theme Editor reloads
if (Shopify.designMode) {
  document.addEventListener("shopify:section:load", (event) => {
    const curatedCards = event.target.querySelectorAll(".curated-product-card");
    curatedCards.forEach((card) => new CuratedProductCard(card));
  });
}
