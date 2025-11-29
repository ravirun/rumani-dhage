/**
 * Shopify Search Autocomplete
 * Provides real-time search suggestions using Shopify Ajax API
 */

class SearchAutocomplete {
  constructor(inputSelector, options = {}) {
    this.input = typeof inputSelector === 'string' 
      ? document.querySelector(inputSelector) 
      : inputSelector;
    
    if (!this.input) {
      console.error('Search input not found');
      return;
    }

    this.options = {
      minLength: 2,
      debounceDelay: 300,
      maxResults: 5,
      showCollections: true,
      showProducts: true,
      ...options
    };

    this.container = null;
    this.results = null;
    this.isOpen = false;
    this.debounceTimer = null;
    this.selectedIndex = -1;

    this.init();
  }

  init() {
    // Create results container
    this.createContainer();

    // Event listeners
    this.input.addEventListener('input', (e) => this.handleInput(e));
    this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.input.addEventListener('focus', () => {
      if (this.input.value.length >= this.options.minLength) {
        this.showResults();
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target) && e.target !== this.input) {
        this.close();
      }
    });
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'search-autocomplete';
    this.container.id = 'search-autocomplete';
    
    this.results = document.createElement('div');
    this.results.className = 'search-autocomplete__results';
    this.container.appendChild(this.results);

    // Insert after input
    this.input.parentNode.insertBefore(this.container, this.input.nextSibling);
  }

  getBaseUrl() {
    return window.Shopify?.routes?.root || '/';
  }

  async search(query) {
    if (!query || query.length < this.options.minLength) {
      this.close();
      return;
    }

    try {
      const resources = [];
      if (this.options.showProducts) resources.push('product');
      if (this.options.showCollections) resources.push('collection');

      if (resources.length === 0) {
        this.showNoResults();
        return;
      }

      const url = `${this.getBaseUrl()}search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=${resources.join(',')}&resources[limit]=${this.options.maxResults}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.description || errorMessage;
        } catch (e) {
          // Use default error message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
      }
      
      this.displayResults(data, query);
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      
      // Show user-friendly error message
      if (error instanceof TypeError && error.message.includes('fetch')) {
        this.showError('Network error. Please check your connection.');
      } else {
        this.showError();
      }
    }
  }

  displayResults(data, query) {
    if (!data.resources || (!data.resources.results.products && !data.resources.results.collections)) {
      this.showNoResults();
      return;
    }

    const products = data.resources.results.products || [];
    const collections = data.resources.results.collections || [];
    
    if (products.length === 0 && collections.length === 0) {
      this.showNoResults();
      return;
    }

    let html = '';

    // Products
    if (products.length > 0) {
      html += '<div class="search-autocomplete__section">';
      html += '<h3 class="search-autocomplete__section-title">Products</h3>';
      html += '<div class="search-autocomplete__items">';
      
      products.forEach((product, index) => {
        html += `
          <a href="${product.url}" class="search-autocomplete__item" data-index="${index}">
            ${product.image ? `<img src="${product.image}" alt="${product.title}" class="search-autocomplete__item-image">` : ''}
            <div class="search-autocomplete__item-content">
              <div class="search-autocomplete__item-title">${product.title}</div>
              ${product.price ? `<div class="search-autocomplete__item-price">${this.formatMoney(product.price)}</div>` : ''}
            </div>
          </a>
        `;
      });
      
      html += '</div></div>';
    }

    // Collections
    if (collections.length > 0) {
      html += '<div class="search-autocomplete__section">';
      html += '<h3 class="search-autocomplete__section-title">Collections</h3>';
      html += '<div class="search-autocomplete__items">';
      
      collections.forEach((collection, index) => {
        const itemIndex = products.length + index;
        html += `
          <a href="${collection.url}" class="search-autocomplete__item" data-index="${itemIndex}">
            ${collection.image ? `<img src="${collection.image}" alt="${collection.title}" class="search-autocomplete__item-image">` : ''}
            <div class="search-autocomplete__item-content">
              <div class="search-autocomplete__item-title">${collection.title}</div>
            </div>
          </a>
        `;
      });
      
      html += '</div></div>';
    }

    // View all results link
    html += `
      <div class="search-autocomplete__footer">
        <a href="${this.getBaseUrl()}search?q=${encodeURIComponent(query)}" class="search-autocomplete__view-all">
          View all results for "${query}"
        </a>
      </div>
    `;

    this.results.innerHTML = html;
    this.showResults();
  }

  showNoResults() {
    this.results.innerHTML = `
      <div class="search-autocomplete__empty">
        <p>No results found</p>
      </div>
    `;
    this.showResults();
  }

  showError() {
    this.results.innerHTML = `
      <div class="search-autocomplete__empty">
        <p>Error loading results. Please try again.</p>
      </div>
    `;
    this.showResults();
  }

  showResults() {
    this.container.classList.add('search-autocomplete--open');
    this.isOpen = true;
    this.selectedIndex = -1;
  }

  close() {
    this.container.classList.remove('search-autocomplete--open');
    this.isOpen = false;
    this.selectedIndex = -1;
  }

  handleInput(e) {
    const query = e.target.value.trim();

    // Clear previous debounce
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Debounce search
    this.debounceTimer = setTimeout(() => {
      this.search(query);
    }, this.options.debounceDelay);
  }

  handleKeydown(e) {
    const items = this.results.querySelectorAll('.search-autocomplete__item');
    
    if (!this.isOpen || items.length === 0) return;

    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
        this.updateSelection(items);
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        this.updateSelection(items);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (this.selectedIndex >= 0 && items[this.selectedIndex]) {
          items[this.selectedIndex].click();
        } else {
          // Submit search form if exists
          const form = this.input.closest('form');
          if (form) form.submit();
        }
        break;
      
      case 'Escape':
        this.close();
        this.input.blur();
        break;
    }
  }

  updateSelection(items) {
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('search-autocomplete__item--selected');
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        item.classList.remove('search-autocomplete__item--selected');
      }
    });
  }

  formatMoney(cents) {
    return new Intl.NumberFormat(document.documentElement.lang || 'en', {
      style: 'currency',
      currency: window.Shopify?.currency?.active || 'USD'
    }).format(cents / 100);
  }
}

// Auto-initialize if search input exists
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.querySelector('input[type="search"], input[name*="search"], input[id*="search"]');
  if (searchInput) {
    window.searchAutocomplete = new SearchAutocomplete(searchInput);
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SearchAutocomplete;
}

