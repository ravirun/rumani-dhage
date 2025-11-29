/**
 * Shopify Ajax Cart API
 * Handles all cart operations using Shopify's Ajax API
 */

class AjaxCart {
  constructor() {
    this.cart = null;
    this.listeners = [];
    this.isUpdating = false;
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
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
   * Fetch current cart contents
   */
  async getCart() {
    try {
      const response = await fetch(this.getBaseUrl() + 'cart.js');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.cart = await response.json();
      this.notifyListeners();
      return this.cart;
    } catch (error) {
      console.error('Error fetching cart:', error);
      this.handleError(error);
      return null;
    }
  }

  /**
   * Add item to cart
   */
  async addItem(variantId, quantity = 1, properties = {}) {
    if (this.isUpdating) return null;
    
    this.isUpdating = true;
    this.showLoading();

    try {
      const response = await fetch(this.getBaseUrl() + 'cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: variantId,
          quantity: quantity,
          properties: properties
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.description || 'Failed to add item to cart');
      }

      const item = await response.json();
      await this.getCart();
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
   */
  async updateItem(line, quantity) {
    if (this.isUpdating) return null;
    
    this.isUpdating = true;
    this.showLoading();

    try {
      const response = await fetch(this.getBaseUrl() + 'cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          line: line,
          quantity: quantity
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.description || 'Failed to update cart');
      }

      await this.getCart();
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

      await this.getCart();
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

      await this.getCart();
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
   * Handle errors
   */
  handleError(error) {
    const message = error.message || 'An error occurred. Please try again.';
    this.showError(message);
  }
}

// Initialize global instance
window.AjaxCart = new AjaxCart();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AjaxCart;
}

