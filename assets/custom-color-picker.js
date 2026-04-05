class CustomColorPicker {
  constructor(container) {
    this.container = container;
    // Handle both radio inputs and potentially other toggle types if improved later
    this.radioButtons = container.querySelectorAll('input[name="color_mode"]');
    this.dropdown = container.querySelector("[data-custom-dropdown]");
    this.customInputs = container.querySelectorAll(
      'input[name="properties[Custom Color]"]',
    );

    // Safety check
    if (
      !this.radioButtons.length ||
      !this.dropdown ||
      !this.customInputs.length
    )
      return;

    this.init();
  }

  init() {
    this.radioButtons.forEach((radio) => {
      radio.addEventListener("change", () => this.handleToggle());
    });

    // Initial state check
    this.handleToggle();
  }

  handleToggle() {
    const checkedRadio = this.container.querySelector(
      'input[name="color_mode"]:checked',
    );
    if (!checkedRadio) return;

    const isCustom = checkedRadio.value === "custom";

    if (isCustom) {
      this.dropdown.hidden = false;
      this.dropdown.style.display = "block";
      this.customInputs.forEach((input) => (input.disabled = false));
    } else {
      this.dropdown.hidden = true;
      this.dropdown.style.display = "none";
      this.customInputs.forEach((input) => (input.disabled = true));
    }
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  const initPickers = () => {
    const pickers = document.querySelectorAll("[data-custom-color-picker]");
    pickers.forEach((picker) => new CustomColorPicker(picker));
  };

  initPickers();

  // Re-init for Theme Editor support
  document.addEventListener("shopify:section:load", initPickers);
});
