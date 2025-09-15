Ecommerce API – Entrega 1 & 2

Backend en Node.js + Express con persistencia en archivos JSON y vistas con Handlebars. La vista realTimeProducts usa Socket.io para actualizar la lista al crear/editar/eliminar productos.

Requisitos

Node.js 18+ (recomendado)

npm

Instalación
npm install

Correr el proyecto
# Desarrollo 
npm run dev

# Producción
npm start


Por defecto corre en: http://localhost:8080

Estructura
src/
  app.js
  routes/
    products.router.js
    carts.router.js
  managers/
    ProductManager.js
    CartManager.js
  views/
    layouts/main.handlebars
    home.handlebars
    realTimeProducts.handlebars
data/
  products.json
  carts.json

Vistas

Home: GET /
Lista todos los productos existentes.

Real-time: GET /realtimeproducts
Muestra la lista y se actualiza vía WebSocket cuando se crea/actualiza/borra un producto.

API de Productos (/api/products)

GET /api/products – Lista todos

GET /api/products/:pid – Obtiene uno por ID

POST /api/products – Crea (id autogenerado). Campos:

title (string)

description (string)

code (string, único)

price (number)

status (boolean)

stock (number)

category (string)

thumbnails (string[])

PUT /api/products/:pid – Actualiza campos (no toca id)

DELETE /api/products/:pid – Elimina por ID

Tras POST/PUT/DELETE, el servidor emite productsUpdated por Socket.io; la vista /realtimeproducts se refresca sola.

API de Carritos (/api/carts)

POST /api/carts – Crea carrito { id, products: [] }

GET /api/carts/:cid – Lista productos del carrito

POST /api/carts/:cid/product/:pid – Agrega/incrementa { product, quantity }

Notas

Persistencia en data/products.json y data/carts.json

Handlebars configurado en src/app.js

Socket.io expuesto a rutas con app.set('io', io) para emitir desde los handlers

Testing rápido (opcional)

Abrí http://localhost:8080/realtimeproducts

En Postman:

POST /api/products con un JSON válido → aparece en la vista

PUT /api/products/:id → se actualiza en vivo

DELETE /api/products/:id → desaparece en vivo
