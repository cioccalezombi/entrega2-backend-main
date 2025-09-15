const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');
const ProductManager = require('./managers/ProductManager');

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Rutas API
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Vistas
app.get('/', async (req, res) => {
  const pm = new ProductManager('./data/products.json');
  const products = await pm.getProducts();
  res.render('home', { products });
});

app.get('/realtimeproducts', async (req, res) => {
  const pm = new ProductManager('./data/products.json');
  const products = await pm.getProducts();
  res.render('realTimeProducts', { products });
});

// HTTP server + Socket.io
const server = http.createServer(app);
const io = new Server(server);

// Hacemos io accesible desde los routers sin require cíclico
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Cliente conectado via WebSocket');
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
