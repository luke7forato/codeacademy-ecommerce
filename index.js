const express = require('express')
var swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const app = express()

var swaggerDefinition = {
    info: {
      title: 'ecommerce API',
      version: '1.0.0',
      description: 'A simplified ecommerce API',
    },
    host: 'https://codeacademy-ecommerce.herokuapp.com/',
    basePath: '/',
  };
  
  // options for the swagger docs
  var options = {
    // import swaggerDefinitions
    swaggerDefinition: swaggerDefinition,
    // path to the API docs
    apis: ['./routes/*.js'],
  };
  
  // initialize swagger-jsdoc
  var swaggerSpec = swaggerJSDoc(options);

    // serve swagger
    app.get('/swagger.json', function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
  


//IMPORT ROUTES
const authRoute = require('./routes/auth')
const modifyAccountRoute = require('./routes/modifyAccount')
const productsRoute = require('./routes/products')
const cartRoute = require('./routes/cart')
const ordersRoute = require('./routes/orders');
const { use } = require('bcrypt/promises');

//MIDDLEWARES
app.use(express.json())
app.use('/api/user', authRoute);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec))
app.use('/api/user/modify', modifyAccountRoute);
app.use('/api/products', productsRoute);
app.use('/api/cart', cartRoute);
app.use('/api/orders', ordersRoute);

//SERVER LISTENER
app.listen(process.env.PORT || 3000, () => {
    console.log('SERVER UP AND RUNNING');
})