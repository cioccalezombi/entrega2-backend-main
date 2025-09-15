const fs = require('fs').promises;
const path = require('path');

class ProductManager {
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

  async #writeFile(products) {
    await fs.writeFile(this.path, JSON.stringify(products, null, 2), 'utf-8');
  }

  async getProducts() {
    return await this.#readFile();
  }

  async getProductById(id) {
    const products = await this.#readFile();
    return products.find(p => String(p.id) === String(id)) || null;
  }

  async addProduct(data) {
    const required = ['title', 'description', 'code', 'price', 'status', 'stock', 'category', 'thumbnails'];
    for (const f of required) {
      if (data[f] === undefined) throw new Error(`Falta el campo requerido: ${f}`);
    }

    const products = await this.#readFile();


    if (products.some(p => p.code === data.code)) {
      throw new Error(`El código "${data.code}" ya existe`);
    }

    const nextId = products.length ? Math.max(...products.map(p => Number(p.id))) + 1 : 1;

    const newProduct = {
      id: nextId, // autogenerado
      title: String(data.title),
      description: String(data.description),
      code: String(data.code),
      price: Number(data.price),
      status: Boolean(data.status),
      stock: Number(data.stock),
      category: String(data.category),
      thumbnails: Array.isArray(data.thumbnails) ? data.thumbnails.map(String) : []
    };

    products.push(newProduct);
    await this.#writeFile(products);
    return newProduct;
  }

  async updateProduct(id, fields) {
    const products = await this.#readFile();
    const idx = products.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return null;

    
    if ('id' in fields) delete fields.id;

    // thumbnails
    if ('thumbnails' in fields && !Array.isArray(fields.thumbnails)) {
      throw new Error('El campo thumbnails debe ser un array de strings');
    }

    const updated = {
      ...products[idx],
      ...fields,
    };


    if ('price' in fields) updated.price = Number(fields.price);
    if ('status' in fields) updated.status = Boolean(fields.status);
    if ('stock' in fields) updated.stock = Number(fields.stock);
    if ('thumbnails' in fields) updated.thumbnails = fields.thumbnails.map(String);

    products[idx] = updated;
    await this.#writeFile(products);
    return updated;
  }

  async deleteProduct(id) {
    const products = await this.#readFile();
    const newList = products.filter(p => String(p.id) !== String(id));
    if (newList.length === products.length) return false;
    await this.#writeFile(newList);
    return true;
  }
}

module.exports = ProductManager;
