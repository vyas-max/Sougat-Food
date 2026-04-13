/**
 * Updates the recently viewed products in localStorage.
 */
export class RecentlyViewed {
  static #STORAGE_KEY = 'viewedProducts';
  static #DATA_STORAGE_KEY = 'viewedProductsData';
  static #MAX_PRODUCTS = 4;

  static addProduct(productId) {
    let viewedProducts = this.getProducts();

    viewedProducts = viewedProducts.filter((/** @type {string} */ id) => id !== productId);
    viewedProducts.unshift(productId);
    viewedProducts = viewedProducts.slice(0, this.#MAX_PRODUCTS);

    localStorage.setItem(this.#STORAGE_KEY, JSON.stringify(viewedProducts));
  }

  static addProductData(productData) {
    let products = this.getProductsData();

    products = products.filter((/** @type {{ id: string }} */ p) => p.id !== productData.id);
    products.unshift(productData);
    products = products.slice(0, this.#MAX_PRODUCTS);

    localStorage.setItem(this.#DATA_STORAGE_KEY, JSON.stringify(products));
  }

  static clearProducts() {
    localStorage.removeItem(this.#STORAGE_KEY);
    localStorage.removeItem(this.#DATA_STORAGE_KEY);
  }

  static getProducts() {
    return JSON.parse(localStorage.getItem(this.#STORAGE_KEY) || '[]');
  }

  static getProductsData() {
    return JSON.parse(localStorage.getItem(this.#DATA_STORAGE_KEY) || '[]');
  }
}
