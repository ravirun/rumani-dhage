/**
 * Product Recommendations
 * Fetches and displays product recommendations using Shopify Ajax API
 */

class ProductRecommendations {
  constructor(containerSelector, options = {}) {
    this.container = typeof containerSelector === 'string'
      ? document.querySelector(containerSelector)
      : containerSelector;

    if (!this.container) {
      console.error('Product recommendations container not found');
      return;
    }

    this.options = {
      productHandle: null,
      limit: 4,
      sectionId: null,
      ...options
    };

    this.products = [];
    this.init();
  }

  init() {
    // Get product handle from URL if not provided
    if (!this.options.productHandle) {
      const path = window.location.pathname;
      const match = path.match(/\/products\/([^\/]+)/);
      if (match) {
        this.options.productHandle = match[1];
      }
    }

    if (this.options.productHandle) {
      this.loadRecommendations();
    }
  }

  getBaseUrl() {
    return window.Shopify?.routes?.root || '/';
  }

  async loadRecommendations() {
    try {
      this.showLoading();

      // Validate product handle
      if (!this.options.productHandle) {
        throw new Error('Product handle is required');
      }

      // Fetch product data
      const productUrl = `${this.getBaseUrl()}products/${this.options.productHandle}.js`;
      const productResponse = await fetch(productUrl);
      
      if (!productResponse.ok) {
        let errorMessage = 'Failed to fetch product';
        try {
          const errorData = await productResponse.json();
          errorMessage = errorData.message || errorData.description || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${productResponse.status}: ${productResponse.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const product = await productResponse.json();
      
      // Validate product data
      if (!product || !product.id) {
        throw new Error('Invalid product data received');
      }

      // Get recommendations (using product type or tags)
      const recommendations = await this.getRecommendedProducts(product);

      this.products = recommendations;
      this.render();
    } catch (error) {
      console.error('Error loading recommendations:', error);
      
      // Show user-friendly error message
      if (error instanceof TypeError && error.message.includes('fetch')) {
        this.showError('Network error. Please check your connection.');
      } else {
        this.showError();
      }
    }
  }

  async getRecommendedProducts(product) {
    // Strategy: Get products from same collection or with similar tags
    const products = [];
    const seenIds = new Set([product.id]);

    // Try to get products from the same collection
    if (product.collections && product.collections.length > 0) {
      const collectionHandle = product.collections[0].handle;
      if (collectionHandle) {
        const collectionUrl = `${this.getBaseUrl()}collections/${collectionHandle}/products.js?limit=${this.options.limit + 5}`;
        
        try {
          const response = await fetch(collectionUrl);
          if (response.ok) {
            const collectionProducts = await response.json();
            
            // Validate response is an array
            if (Array.isArray(collectionProducts)) {
              for (const p of collectionProducts) {
                if (p && p.id && !seenIds.has(p.id) && products.length < this.options.limit) {
                  products.push(p);
                  seenIds.add(p.id);
                }
              }
            }
          } else {
            console.warn(`Failed to fetch collection products: HTTP ${response.status}`);
          }
        } catch (error) {
          console.warn('Error fetching collection products:', error);
        }
      }
    }

    // If we need more, get products with similar tags
    if (products.length < this.options.limit && product.tags && product.tags.length > 0) {
      const tag = product.tags[0];
      if (tag) {
        const searchUrl = `${this.getBaseUrl()}search?q=${encodeURIComponent(`tag:${tag}`)}&type=product&limit=${this.options.limit}`;
        
        try {
          const response = await fetch(searchUrl);
          if (response.ok) {
            const data = await response.json();
            if (data && data.results && Array.isArray(data.results)) {
              for (const p of data.results) {
                if (p && p.id && !seenIds.has(p.id) && products.length < this.options.limit) {
                  products.push(p);
                  seenIds.add(p.id);
                }
              }
            }
          } else {
            console.warn(`Failed to fetch tagged products: HTTP ${response.status}`);
          }
        } catch (error) {
          console.warn('Error fetching tagged products:', error);
        }
      }
    }

    return products.slice(0, this.options.limit);
  }

  showLoading() {
    this.container.innerHTML = `
      <div class="product-recommendations__loading">
        <div class="ajax-cart-spinner"></div>
        <p>Loading recommendations...</p>
      </div>
    `;
  }

  showError() {
    this.container.innerHTML = `
      <div class="product-recommendations__error">
        <p>Unable to load recommendations</p>
      </div>
    `;
  }

  render() {
    if (this.products.length === 0) {
      this.container.innerHTML = '';
      return;
    }

    const html = `
      <div class="product-recommendations__grid">
        ${this.products.map(product => this.renderProduct(product)).join('')}
      </div>
    `;

    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  renderProduct(product) {
    const productId = product.id || product.product_id;
    const image = product.featured_image || product.images?.[0] || product.image;
    const variants = product.variants || [];
    const firstVariant = variants[0] || {};
    const price = firstVariant.price || product.price || 0;
    const comparePrice = firstVariant.compare_at_price;
    const productUrl = product.url || `${this.getBaseUrl()}products/${product.handle || ''}`;

    return `
      <div class="product-recommendations__item" data-product-id="${productId}">
        <a href="${productUrl}" class="product-recommendations__link">
          ${image ? `
            <div class="product-recommendations__image">
              <img 
                src="${image}" 
                alt="${product.title || ''}"
                loading="lazy"
                width="300"
                height="300"
              >
            </div>
          ` : ''}
          <div class="product-recommendations__content">
            <h3 class="product-recommendations__title">${product.title || ''}</h3>
            <div class="product-recommendations__price">
              ${comparePrice && comparePrice > price ? `
                <span class="product-recommendations__price-compare">${this.formatMoney(comparePrice)}</span>
              ` : ''}
              <span class="product-recommendations__price-current">${this.formatMoney(price)}</span>
            </div>
          </div>
        </a>
        ${firstVariant.id ? `
          <button 
            type="button"
            class="product-recommendations__add-to-cart"
            data-variant-id="${firstVariant.id}"
            aria-label="Add ${product.title || 'product'} to cart"
          >
            Add to Cart
          </button>
        ` : ''}
      </div>
    `;
  }

  attachEventListeners() {
    // Add to cart buttons
    this.container.querySelectorAll('[data-variant-id]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const variantId = btn.getAttribute('data-variant-id');
        if (variantId && window.AjaxCart) {
          btn.disabled = true;
          btn.textContent = 'Adding...';
          await window.AjaxCart.addItem(parseInt(variantId), 1);
          btn.disabled = false;
          btn.textContent = 'Add to Cart';
        }
      });
    });
  }

  formatMoney(cents) {
    return new Intl.NumberFormat(document.documentElement.lang || 'en', {
      style: 'currency',
      currency: window.Shopify?.currency?.active || 'USD'
    }).format(cents / 100);
  }
}

// Auto-initialize product recommendations on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  const containers = document.querySelectorAll('[data-recommendations-container]');
  containers.forEach(container => {
    const section = container.closest('.product-recommendations');
    const limit = section ? parseInt(section.dataset.limit) || 4 : 4;
    if (typeof ProductRecommendations !== 'undefined') {
      new ProductRecommendations(container, { limit });
    }
  });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProductRecommendations;
}

