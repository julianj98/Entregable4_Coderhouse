import express, { urlencoded } from 'express';
import products from "./routes/products.router.js"
import carts from "./routes/carts.router.js"
import viewsRouter from "./routes/views.router.js";
import handlebars from "express-handlebars";
import __dirname from "./utils.js";
import {Server} from "socket.io"
import { createServer } from 'http';
import ProductManager from "./ProductManager.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const productManager = new ProductManager();

app.use(express.json());
app.use(urlencoded({ extended: true }))
app.use('/api/products',products);
app.use('/api/carts',carts);


app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

app.use("/",viewsRouter)
app.get('/', (req, res) => {
    const products = productManager.getProducts();
    res.render('home', { products });
  });


io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado');
    const products = productManager.getProducts();
      io.emit('updatedProducts', products);
    socket.on('productUpdated', () => {
      const products = productManager.getProducts();
      io.emit('updatedProducts', products);
    });
  });

  httpServer.listen(8080, () => {
    console.log('Server is running on port 8080');
  });
  
export {io};
//RUTA RAIZ (SOLO HANDLEBARS SIN WEBSOCKET): localhost:8080/
//RUTA PARA LOS PRODUCTOS EN TIEMPO REAL CON WEBSOCKET: localhost:8080/realtimeproducts
/** EJEMPLO PARA PROBAR EL POST
 * {
    "title": "producto prueba 11",
    "description": "Este es un producto prueba 11",
    "code": "abc111",
    "price": 300,
    "stock": 8000,
    "category": "cloth",
    "thumbnail": "sim imagen"
  } */


/*CONSULTAS AL ENDPOINT (reemplazar la x por el id)
para PRODUCTS
GET
localhost:8080/api/products
localhost:8080/api/products/x
POST
localhost:8080/api/products/
PUT Y DELETE
localhost:8080/api/products/x

para CARTS
POST
localhost:8080/api/carts
GET
localhost:8080/api/carts/X
POST de un product en un cart
localhost:8080/api/carts/x/product/x  */