const fs = require('fs').promises;
const path = require('path');

class CartManager {
  constructor(filePath) {
    this.path = path.resolve(filePath);
  }

  async #readFile() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      if (!data.trim()) return [];
      return JSON.parse(data);
    } catch (err) {
      if (err.code === 'ENOENT') return [];
      throw err;
    }
  }

  async #writeFile(carts) {
    await fs.writeFile(this.path, JSON.stringify(carts, null, 2), 'utf-8');
  }

  async getCarts() {
    return await this.#readFile();
  }

  async getCartById(id) {
    const carts = await this.#readFile();
    return carts.find(c => String(c.id) === String(id)) || null;
  }

  async createCart() {
    const carts = await this.#readFile();
    const nextId = carts.length ? Math.max(...carts.map(c => Number(c.id))) + 1 : 1;
    const newCart = { id: nextId, products: [] };
    carts.push(newCart);
    await this.#writeFile(carts);
    return newCart;
  }

  /**
   * Agrega/incrementa un producto en el carrito
   * @param {string|number} cid - cart id
   * @param {string|number} pid - product id
   * @param {number} qty - cantidad a sumar (default 1)
   */
  async addProductToCart(cid, pid, qty = 1) {
    const carts = await this.#readFile();
    const idx = carts.findIndex(c => String(c.id) === String(cid));
    if (idx === -1) return null;

    const cart = carts[idx];
    const itemIdx = cart.products.findIndex(it => String(it.product) === String(pid));
    if (itemIdx === -1) {
      cart.products.push({ product: pid, quantity: Number(qty) || 1 });
    } else {
      cart.products[itemIdx].quantity += Number(qty) || 1;
    }

    carts[idx] = cart;
    await this.#writeFile(carts);
    return cart;
  }
}

module.exports = CartManager;
