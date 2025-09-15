const { Router } = require('express');
const CartManager = require('../managers/CartManager');
const ProductManager = require('../managers/ProductManager');

const router = Router();
const cm = new CartManager('./data/carts.json');
const pm = new ProductManager('./data/products.json');


router.post('/', async (req, res) => {
  try {
    const cart = await cm.createCart();
    res.status(201).json({ status: 'ok', data: cart });
  } catch (e) {
    res.status(500).json({ status: 'error', message: 'Error al crear carrito' });
  }
});


router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cm.getCartById(cid);
    if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    res.json({ status: 'ok', data: cart.products });
  } catch (e) {
    res.status(500).json({ status: 'error', message: 'Error al obtener carrito' });
  }
});

// agregar producto (incrementa quantity si ya existe)
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;

    // Verificar producto 
    const product = await pm.getProductById(pid);
    if (!product) return res.status(404).json({ status: 'error', message: 'Producto no existe' });

    const updatedCart = await cm.addProductToCart(cid, pid, 1);
    if (!updatedCart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });

    res.status(201).json({ status: 'ok', data: updatedCart });
  } catch (e) {
    res.status(500).json({ status: 'error', message: 'Error al agregar producto al carrito' });
  }
});

module.exports = router;
