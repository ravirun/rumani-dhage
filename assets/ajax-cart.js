/**
 * Shopify Ajax Cart API
 * Handles all cart operations using Shopify's Ajax API
 */

class AjaxCart {
  constructor() {
    this.cart = null;
    this.listeners = [];
    this.isUpdating = false;
    this.sectionIds = [];
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    // Extract section IDs from the page for bundled section rendering
    this.extractSectionIds();
    
    // Fetch initial cart state
    this.getCart();
    
    // Listen for cart updates from other sources
    document.addEventListener('cart:updated', () => this.getCart());
  }

  /**
   * Get the base URL for Ajax requests (locale-aware)
   */
  getBaseUrl() {
    return window.Shopify?.routes?.root || '/';
  }

  /**
   * Extract section IDs from the page for bundled section rendering
   * Sections are wrapped in divs with id="shopify-section-{section-id}"
   */
  extractSectionIds() {
    const sectionElements = document.querySelectorAll('[id^="shopify-section-"]');
    this.sectionIds = Array.from(sectionElements).map(el => {
      // Extract section ID from id attribute (format: shopify-section-{section-id})
      const id = el.id.replace('shopify-section-', '');
      return id;
    }).filter(id => id);
  }

  /**
   * Get section IDs that should be updated when cart changes
   * Returns array of section IDs for cart-related sections
   */
  getCartSectionIds() {
    // Filter to only cart-related sections
    return this.sectionIds.filter(id => {
      const idLower = id.toLowerCase();
      return idLower.includes('cart') || 
             idLower.includes('floating') ||
             idLower.includes('drawer');
    });
  }

  /**
   * Render sections using Section Rendering API
   * @param {string[]} sectionIds - Array of section IDs to render
   * @param {string} contextUrl - URL context for rendering (default: current page)
   */
  async renderSections(sectionIds, contextUrl = null) {
    if (!sectionIds || sectionIds.length === 0) {
      return null;
    }

    // Limit to 5 sections (Shopify API limit)
    const limitedIds = sectionIds.slice(0, 5);
    const sectionsParam = limitedIds.join(',');

    try {
      const baseUrl = contextUrl || window.location.pathname;
      const url = `${this.getBaseUrl()}${baseUrl.replace(/^\//, '')}?sections=${sectionsParam}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update sections in the DOM
      Object.keys(data).forEach(sectionId => {
        if (data[sectionId] === null) {
          console.warn(`Section ${sectionId} failed to render`);
          return;
        }

        const sectionElement = document.getElementById(`shopify-section-${sectionId}`);
        if (sectionElement) {
          // Parse the HTML and extract the inner content
          const parser = new DOMParser();
          const doc = parser.parseFromString(data[sectionId], 'text/html');
          const newSectionContent = doc.querySelector(`#shopify-section-${sectionId}`);
          
          if (newSectionContent) {
            sectionElement.innerHTML = newSectionContent.innerHTML;
            
            // Reinitialize any scripts/icons that might be in the section
            if (typeof lucide !== 'undefined') {
              lucide.createIcons();
            }
            
            // Dispatch event for section update
            sectionElement.dispatchEvent(new CustomEvent('section:updated', {
              detail: { sectionId }
            }));
          }
        }
      });

      return data;
    } catch (error) {
      console.error('Error rendering sections:', error);
      return null;
    }
  }

  /**
   * Fetch current cart contents with retry logic
   * @param {boolean} updateSections - Whether to update sections using bundled rendering (default: false)
   * @param {number} retries - Number of retry attempts (default: 2)
   */
  async getCart(updateSections = false, retries = 2) {
    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(this.getBaseUrl() + 'cart.js');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        this.cart = await response.json();
        
        // Use bundled section rendering if requested and section IDs are available
        if (updateSections && this.sectionIds.length > 0) {
          const cartSectionIds = this.getCartSectionIds();
          if (cartSectionIds.length > 0) {
            await this.renderSections(cartSectionIds);
          }
        }
        
        this.notifyListeners();
        return this.cart;
      } catch (error) {
        lastError = error;
        
        // Don't retry on the last attempt
        if (attempt < retries) {
          // Exponential backoff: wait 100ms, 200ms, 400ms
          await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
          continue;
        }
      }
    }
    
    // All retries failed
    console.error('Error fetching cart after retries:', lastError);
    this.handleError(lastError);
    return null;
  }

  /**
   * Add item to cart
   * @param {number|string} variantId - Product variant ID
   * @param {number} quantity - Quantity to add (default: 1)
   * @param {object} properties - Line item properties (optional)
   * @returns {Promise<object|null>} Added item or null on error
   */
  async addItem(variantId, quantity = 1, properties = {}) {
    // Validate inputs
    if (!variantId) {
      this.showError('Variant ID is required');
      return null;
    }
    
    const variantIdNum = parseInt(variantId);
    if (isNaN(variantIdNum) || variantIdNum <= 0) {
      this.showError('Invalid variant ID');
      return null;
    }
    
    const quantityNum = parseInt(quantity) || 1;
    if (quantityNum <= 0) {
      this.showError('Quantity must be greater than 0');
      return null;
    }
    
    if (this.isUpdating) {
      console.warn('Cart update already in progress');
      return null;
    }
    
    this.isUpdating = true;
    this.showLoading();

    try {
      // Retry logic for add item
      let response;
      let lastError;
      const maxRetries = 2;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          response = await fetch(this.getBaseUrl() + 'cart/add.js', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: variantIdNum,
              quantity: quantityNum,
              properties: properties
            })
          });

          if (!response.ok) {
            let errorData;
            try {
              errorData = await response.json();
            } catch (e) {
              errorData = { description: `HTTP ${response.status}: ${response.statusText}` };
            }
            throw new Error(errorData.description || errorData.message || 'Failed to add item to cart');
          }
          
          // Success - break out of retry loop
          break;
        } catch (error) {
          lastError = error;
          
          // Don't retry on the last attempt or for client errors (4xx)
          if (attempt < maxRetries && (!response || response.status < 400 || response.status >= 500)) {
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
            continue;
          }
          
          // Re-throw on last attempt or client errors
          throw error;
        }
      }

      const item = await response.json();
      
      // Use bundled section rendering for cart updates
      await this.getCart(true);
      
      this.showSuccess('Item added to cart');
      return item;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      this.handleError(error);
      return null;
    } finally {
      this.isUpdating = false;
      this.hideLoading();
    }
  }

  /**
   * Update cart line item quantity
   * @param {number} line - Line item number (1-based)
   * @param {number} quantity - New quantity (0 to remove)
   * @returns {Promise<boolean>} Success status
   */
  async updateItem(line, quantity) {
    // Validate inputs
    const lineNum = parseInt(line);
    if (isNaN(lineNum) || lineNum < 1) {
      this.showError('Invalid line item number');
      return false;
    }
    
    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum < 0) {
      this.showError('Quantity must be 0 or greater');
      return false;
    }
    
    if (this.isUpdating) {
      console.warn('Cart update already in progress');
      return false;
    }
    
    this.isUpdating = true;
    this.showLoading();

    try {
      const response = await fetch(this.getBaseUrl() + 'cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          line: lineNum,
          quantity: quantityNum
        })
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { description: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.description || errorData.message || 'Failed to update cart');
      }

      // Use bundled section rendering for cart updates
      await this.getCart(true);
      return true;
    } catch (error) {
      console.error('Error updating cart:', error);
      this.handleError(error);
      return false;
    } finally {
      this.isUpdating = false;
      this.hideLoading();
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem(line) {
    return this.updateItem(line, 0);
  }

  /**
   * Clear entire cart
   */
  async clearCart() {
    if (this.isUpdating) return false;
    
    this.isUpdating = true;
    this.showLoading();

    try {
      const response = await fetch(this.getBaseUrl() + 'cart/clear.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      // Use bundled section rendering for cart updates
      await this.getCart(true);
      this.showSuccess('Cart cleared');
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      this.handleError(error);
      return false;
    } finally {
      this.isUpdating = false;
      this.hideLoading();
    }
  }

  /**
   * Update cart note
   */
  async updateNote(note) {
    if (this.isUpdating) return false;
    
    this.isUpdating = true;

    try {
      const response = await fetch(this.getBaseUrl() + 'cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note: note
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update cart note');
      }

      // Use bundled section rendering for cart updates
      await this.getCart(true);
      return true;
    } catch (error) {
      console.error('Error updating cart note:', error);
      this.handleError(error);
      return false;
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Subscribe to cart updates
   */
  onUpdate(callback) {
    this.listeners.push(callback);
  }

  /**
   * Unsubscribe from cart updates
   */
  offUpdate(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  /**
   * Notify all listeners of cart update
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.cart);
      } catch (error) {
        console.error('Error in cart update listener:', error);
      }
    });
    
    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('cart:updated', {
      detail: { cart: this.cart }
    }));
  }

  /**
   * Format money value
   */
  formatMoney(cents, format = '{{amount}}') {
    if (!cents) return '0';
    const value = (cents / 100).toFixed(2);
    return format.replace('{{amount}}', value);
  }

  /**
   * Show loading state
   */
  showLoading() {
    document.body.classList.add('ajax-cart-loading');
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    document.body.classList.remove('ajax-cart-loading');
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  /**
   * Show error message
   */
  showError(message) {
    this.showNotification(message, 'error');
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    // Create or get notification container
    let container = document.getElementById('ajax-cart-notifications');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ajax-cart-notifications';
      container.className = 'ajax-cart-notifications';
      document.body.appendChild(container);
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = `ajax-cart-notification ajax-cart-notification--${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
      notification.classList.add('ajax-cart-notification--show');
    });

    // Remove after delay
    setTimeout(() => {
      notification.classList.remove('ajax-cart-notification--show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  /**
   * Handle errors with improved error messages
   */
  handleError(error) {
    let message = 'An error occurred. Please try again.';
    
    if (error.message) {
      message = error.message;
    } else if (error instanceof TypeError && error.message.includes('fetch')) {
      message = 'Network error. Please check your connection and try again.';
    } else if (error instanceof SyntaxError) {
      message = 'Invalid response from server. Please try again.';
    }
    
    this.showError(message);
    
    // Log detailed error for debugging
    if (console && console.error) {
      console.error('AjaxCart Error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
  }
}

// Initialize global instance
window.AjaxCart = new AjaxCart();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AjaxCart;
}

