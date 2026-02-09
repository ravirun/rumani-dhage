/**
 * Premium Product Card Functionality
 * Handles image slider, dynamic badges, heart animation, and cart feedback.
 */

class PremiumProductCard {
  constructor(cardElement) {
    this.card = cardElement;
    this.slider = this.card.querySelector(".premium-image-slider");
    this.dots = this.card.querySelectorAll(".premium-dot");
    this.imageSection = this.card.querySelector(".premium-image-section");
    this.heart = this.card.querySelector(".premium-heart-icon");
    this.badgeText = this.card.querySelector(".premium-badge-text");
    this.badgeAvatar = this.card.querySelector(".premium-badge-avatar");
    this.form = this.card.querySelector("form");
    this.addBtn = this.card.querySelector(".premium-add-btn");

    this.badges = JSON.parse(this.card.dataset.badges || '["New Arrival"]');
    this.lastBadgeIndex = 0;
    this.lastTap = 0;

    this.init();
  }

  init() {
    if (this.slider) {
      this.slider.addEventListener("scroll", () => this.handleScroll());
    }

    if (this.dots.length > 0) {
      this.dots.forEach((dot, index) => {
        dot.addEventListener("click", (e) => {
          e.preventDefault();
          this.scrollToIndex(index);
        });
      });
    }

    if (this.imageSection) {
      this.imageSection.addEventListener("touchend", (e) =>
        this.handleDoubleTap(e),
      );
      this.imageSection.addEventListener("dblclick", () => this.showHeart());
    }

    if (this.addBtn) {
      this.addBtn.addEventListener("click", (e) => this.handleCartClick(e));
    }
  }

  handleScroll() {
    const index = Math.round(this.slider.scrollLeft / this.slider.offsetWidth);

    // Update dots
    this.dots.forEach((d, i) => d.classList.toggle("active", i === index));

    // Update badge text dynamically based on image index
    if (index !== this.lastBadgeIndex && this.badges[index]) {
      this.badgeText.classList.add("updating");
      if (this.badgeAvatar) this.badgeAvatar.style.transform = "rotate(360deg)";

      setTimeout(() => {
        this.badgeText.innerText = this.badges[index];
        this.badgeText.classList.remove("updating");
        if (this.badgeAvatar) this.badgeAvatar.style.transform = "";
      }, 300);

      this.lastBadgeIndex = index;
    }
  }

  scrollToIndex(index) {
    const scrollWidth = this.slider.offsetWidth;
    this.slider.scrollTo({
      left: index * scrollWidth,
      behavior: "smooth",
    });
  }

  handleDoubleTap(e) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - this.lastTap;
    if (tapLength < 300 && tapLength > 0) {
      this.showHeart();
    }
    this.lastTap = currentTime;
  }

  showHeart() {
    if (!this.heart) return;
    this.heart.classList.remove("animate");
    void this.heart.offsetWidth;
    this.heart.classList.add("animate");

    // Optional: Trigger wishlist logic here if implemented
    console.log("Product added to wishlist");
  }

  handleCartClick(e) {
    // If there's a form, we might want to submit it via AJAX
    // For now, let's provide visual feedback as requested
    const originalText = this.addBtn.innerText;

    // Check if it's a direct add to cart or just a link
    if (this.form) {
      e.preventDefault();
      const formData = new FormData(this.form);

      // Basic Shopify AJAX Add to Cart
      fetch(window.Shopify.routes.root + "cart/add.js", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          this.updateButtonFeedback(true, originalText);
          // Dispatch event for cart to update (standard Shopify pubsub if available)
          if (window.publish)
            window.publish("cart-updated", { sectionId: "cart-drawer" });
        })
        .catch((error) => {
          console.error("Error adding to cart:", error);
          this.updateButtonFeedback(false, originalText);
        });
    } else {
      // Just visual feedback if it's a placeholder
      this.updateButtonFeedback(true, originalText);
    }
  }

  updateButtonFeedback(success, originalText) {
    if (success) {
      this.addBtn.innerText = "Added ✓";
      this.addBtn.style.backgroundColor = "#2d5a27";
    } else {
      this.addBtn.innerText = "Error!";
      this.addBtn.style.backgroundColor = "#000000";
    }

    setTimeout(() => {
      this.addBtn.innerText = originalText;
      this.addBtn.style.backgroundColor = "";
    }, 1500);
  }
}

// Initialize all premium cards on the page
document.addEventListener("DOMContentLoaded", () => {
  const premiumCards = document.querySelectorAll(".premium-product-card");
  premiumCards.forEach((card) => new PremiumProductCard(card));
});

// Also initialize on Shopify Theme Editor reloads
if (Shopify.designMode) {
  document.addEventListener("shopify:section:load", (event) => {
    const premiumCards = event.target.querySelectorAll(".premium-product-card");
    premiumCards.forEach((card) => new PremiumProductCard(card));
  });
}
