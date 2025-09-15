const { Router } = require('express');
const ProductManager = require('../managers/ProductManager');

const router = Router();
const pm = new ProductManager('./data/products.json');

// GET /api/products/  → listar todos
router.get('/', async (req, res) => {
  try {
    const products = await pm.getProducts();
    res.json({ status: 'ok', data: products });
  } catch (e) {
    res.status(500).json({ status: 'error', message: 'Error al listar productos' });
  }
});

// GET /api/products/:pid  → traer por id
router.get('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await pm.getProductById(pid);
    if (!product) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    res.json({ status: 'ok', data: product });
  } catch (e) {
    res.status(500).json({ status: 'error', message: 'Error al obtener producto' });
  }
});

// POST /api/products/ → crear producto (id autogenerado)
router.post('/', async (req, res) => {
  try {
    const created = await pm.addProduct(req.body);

    // Emitir actualización en tiempo real
    const io = req.app.get('io');
    const products = await pm.getProducts();
    io.emit('productsUpdated', products);

    res.status(201).json({ status: 'ok', data: created });
  } catch (e) {
    res.status(400).json({ status: 'error', message: e.message });
  }
});

// PUT /api/products/:pid → actualizar (no tocar id)
router.put('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const updated = await pm.updateProduct(pid, req.body);
    if (!updated) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });

    // Emitir actualización en tiempo real
    const io = req.app.get('io');
    const products = await pm.getProducts();
    io.emit('productsUpdated', products);

    res.json({ status: 'ok', data: updated });
  } catch (e) {
    res.status(400).json({ status: 'error', message: e.message });
  }
});

// DELETE /api/products/:pid → eliminar
router.delete('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const ok = await pm.deleteProduct(pid);
    if (!ok) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });

    // Emitir actualización en tiempo real
    const io = req.app.get('io');
    const products = await pm.getProducts();
    io.emit('productsUpdated', products);

    res.json({ status: 'ok', message: 'Producto eliminado' });
  } catch (e) {
    res.status(500).json({ status: 'error', message: 'Error al eliminar producto' });
  }
});

module.exports = router;
