class CustomColorPicker {
  constructor(container) {
    this.container = container;
    this.radioButtons = container.querySelectorAll('input[name="color_mode"]');
    this.dropdown = container.querySelector("[data-custom-dropdown]");
    this.customInputs = container.querySelectorAll('input[name="properties[Custom Color]"]');
    
    // Find the main product form and submit button
    this.productForm = container.closest('product-info');
    this.submitButton = this.productForm ? this.productForm.querySelector('[name="add"]') : null;
    this.submitButtonText = this.submitButton ? this.submitButton.querySelector('span') : null;

    if (!this.radioButtons.length || !this.dropdown || !this.customInputs.length) return;

    this.init();
  }

  init() {
    this.radioButtons.forEach((radio) => {
      radio.addEventListener("change", () => this.handleToggle());
    });
    this.handleToggle();
  }

  handleToggle() {
    const checkedRadio = this.container.querySelector('input[name="color_mode"]:checked');
    if (!checkedRadio) return;

    const isCustom = checkedRadio.value === "custom";

    if (isCustom) {
      this.dropdown.hidden = false;
      this.dropdown.style.display = "block";
      this.customInputs.forEach((input) => (input.disabled = false));
      
      // Force enable button for Custom Order logic
      if (this.submitButton) {
        this.submitButton.disabled = false;
        this.submitButton.removeAttribute('aria-disabled');
        if (this.submitButtonText) {
          this.submitButtonText.textContent = "Pre-order Custom Color";
        }
      }
    } else {
      this.dropdown.hidden = true;
      this.dropdown.style.display = "none";
      this.customInputs.forEach((input) => (input.disabled = true));
      
      // Restore state by triggering variant picker change
      setTimeout(() => {
        const activeRadio = this.container.querySelector('input[name="color_mode"]:checked');
        if (activeRadio && activeRadio.value === 'in-stock') {
           const variantPicker = this.productForm.querySelector('variant-selects, variant-radios');
           if (variantPicker) variantPicker.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, 10);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const initPickers = () => {
    const pickers = document.querySelectorAll("[data-custom-color-picker]");
    pickers.forEach((picker) => new CustomColorPicker(picker));
  };
  initPickers();
  document.addEventListener("shopify:section:load", initPickers);
});
