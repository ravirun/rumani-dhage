/**
 * Premium Instagram Story Viewer
 * Handles story progression, Luxury Quick Buy panel, and AJAX Cart.
 */

class InstaStoryViewer {
  constructor() {
    this.selectors = {
      modal: "#InstaStoryModal",
      storyTrigger: "[data-open-story]",
      closeBtn: "[data-close-modal]",
      prevBtn: "[data-story-prev]",
      nextBtn: "[data-story-next]",
      mediaContainer: ".insta-story-full-view__media",
      progressFill: ".insta-story-full-view__progress-fill",
      quickBuyPanel: "[data-quick-buy-panel]",
      toggleQuickBuy: "[data-toggle-quick-buy]",
      atcBtn: "[data-pb-atc]",
      detailsLink: "[data-pb-details-link]",
      title: "[data-pb-title]",
      price: "[data-pb-price]",
      fabric: "[data-pb-fabric]",
      titleOuter: "[data-story-title]",
    };

    this.modal = document.querySelector(this.selectors.modal);
    if (!this.modal) return;

    this.stories = Array.from(
      document.querySelectorAll(this.selectors.storyTrigger),
    );
    this.currentIndex = 0;
    this.duration = 5000; // 5 seconds
    this.timer = null;
    this.progressStartTime = null;
    this.paused = false;
    this.pausedAt = 0;

    this.init();
  }

  init() {
    // Open Story
    this.stories.forEach((trigger, index) => {
      trigger.addEventListener("click", () => this.openStory(index));
    });

    // Close Modal
    this.modal
      .querySelector(this.selectors.closeBtn)
      .addEventListener("click", () => this.closeStory());

    // Navigation
    this.modal
      .querySelector(this.selectors.prevBtn)
      .addEventListener("click", () => this.prevStory());
    this.modal
      .querySelector(this.selectors.nextBtn)
      .addEventListener("click", () => this.nextStory());
    this.modal.querySelectorAll(this.selectors.nextBtn).forEach((el) => {
      el.addEventListener("click", () => this.nextStory());
    });

    // Quick Buy Toggle
    const toggleBtn = this.modal.querySelector(this.selectors.toggleQuickBuy);
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => this.toggleQuickBuy());
    }

    // ATC
    const atcBtn = this.modal.querySelector(this.selectors.atcBtn);
    if (atcBtn) {
      atcBtn.addEventListener("click", () => this.addToCart());
    }

    // Pause on hold
    const media = this.modal.querySelector(this.selectors.mediaContainer);
    media.addEventListener("mousedown", () => this.pause());
    media.addEventListener("mouseup", () => this.resume());
    media.addEventListener("touchstart", () => this.pause(), { passive: true });
    media.addEventListener("touchend", () => this.resume(), { passive: true });

    // Keyboard
    document.addEventListener("keydown", (e) => {
      if (!this.modal.hasAttribute("open")) return;
      if (e.key === "ArrowRight") this.nextStory();
      if (e.key === "ArrowLeft") this.prevStory();
      if (e.key === "Escape") this.closeStory();
    });
  }

  openStory(index) {
    this.currentIndex = index;
    const data = this.stories[index].dataset;

    this.updateMedia(data);
    this.updateQuickBuy(data);

    this.modal.setAttribute("open", "");
    document.body.style.overflow = "hidden";

    this.startTimer();
  }

  updateMedia(data) {
    const container = this.modal.querySelector(this.selectors.mediaContainer);
    container.innerHTML = "";

    if (data.video) {
      const video = document.createElement("video");
      video.src = `https://cdn.shopify.com/videos/c/vp/${data.video}/${data.video}.mp4`;
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      container.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.src = data.image;
      container.appendChild(img);
    }

    // Update title in top bar
    const titleOuter = this.modal.querySelector(this.selectors.titleOuter);
    if (titleOuter) titleOuter.textContent = data.title;
  }

  updateQuickBuy(data) {
    const panel = this.modal.querySelector(this.selectors.quickBuyPanel);
    panel.classList.remove("active");

    this.modal.querySelector(this.selectors.title).textContent = data.title;
    this.modal.querySelector(this.selectors.price).textContent = data.price;
    this.modal.querySelector(
      this.selectors.highlights || this.selectors.fabric,
    ).textContent = data.fabric;

    const detailsLink = this.modal.querySelector(this.selectors.detailsLink);
    detailsLink.href = `/products/${data.productHandle}`;

    const atcBtn = this.modal.querySelector(this.selectors.atcBtn);
    atcBtn.dataset.productHandle = data.productHandle;
  }

  toggleQuickBuy() {
    const panel = this.modal.querySelector(this.selectors.quickBuyPanel);
    const isActive = panel.classList.toggle("active");

    if (isActive) {
      this.pause();
    } else {
      this.resume();
    }
  }

  async addToCart() {
    const btn = this.modal.querySelector(this.selectors.atcBtn);
    const handle = btn.dataset.productHandle;

    btn.classList.add("loading");
    btn.querySelector(".loading-overlay__spinner").classList.remove("hidden");

    try {
      const response = await fetch("/products/" + handle + ".js");
      const product = await response.json();
      const variantId = product.variants[0].id; // Simple implementation, can be extended for selection

      await fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] }),
      });

      // Refresh cart or show notification
      document.dispatchEvent(new CustomEvent("cart:refresh"));
      if (window.location.pathname !== "/cart") {
        // Optionally open cart drawer if theme supports it
        const cartDrawer = document.querySelector("cart-drawer");
        if (cartDrawer) {
          this.closeStory();
          cartDrawer.open();
        }
      }

      this.nextStory();
    } catch (e) {
      console.error("ATC failed", e);
    } finally {
      btn.classList.remove("loading");
      btn.querySelector(".loading-overlay__spinner").classList.add("hidden");
    }
  }

  startTimer() {
    this.stopTimer();
    this.paused = false;
    this.progressStartTime = Date.now();
    this.animate();
  }

  stopTimer() {
    if (this.timer) {
      cancelAnimationFrame(this.timer);
      this.timer = null;
    }
  }

  pause() {
    if (this.paused) return;
    this.paused = true;
    this.pausedAt = Date.now() - this.progressStartTime;
    this.stopTimer();
  }

  resume() {
    if (!this.paused) return;
    this.paused = false;
    this.progressStartTime = Date.now() - this.pausedAt;
    this.animate();
  }

  animate() {
    if (this.paused) return;

    const elapsed = Date.now() - this.progressStartTime;
    const progress = (elapsed / this.duration) * 100;

    this.updateProgress(progress);

    if (progress >= 100) {
      this.nextStory();
    } else {
      this.timer = requestAnimationFrame(() => this.animate());
    }
  }

  updateProgress(progress) {
    const fills = this.modal.querySelectorAll(this.selectors.progressFill);
    fills.forEach((fill, index) => {
      if (index < this.currentIndex) {
        fill.style.width = "100%";
      } else if (index === this.currentIndex) {
        fill.style.width = `${progress}%`;
      } else {
        fill.style.width = "0%";
      }
    });
  }

  nextStory() {
    if (this.currentIndex < this.stories.length - 1) {
      this.openStory(this.currentIndex + 1);
    } else {
      this.closeStory();
    }
  }

  prevStory() {
    if (this.currentIndex > 0) {
      this.openStory(this.currentIndex - 1);
    }
  }

  closeStory() {
    this.stopTimer();
    this.modal.removeAttribute("open");
    document.body.style.overflow = "";
    const panel = this.modal.querySelector(this.selectors.quickBuyPanel);
    panel.classList.remove("active");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new InstaStoryViewer();
});
