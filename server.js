require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const PORT = process.env.PORT || 1234;
const DB = process.env.DB_URI;
const userRouter = require('./router/user');
const productRouter = require('./router/product');
const paymentRouter = require('./router/payment');
const session = require('express-session');
const passport = require('passport');
require('./middleware/passport');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());


const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Documentation for our Mini Project',
    version: '1.0.0',
    description:
      'First swagger documentation class.',
    // license: {
    //   name: 'Licensed Under MIT',
    //   url: 'https://spdx.org/licenses/MIT.html',
    // },
    contact: {
      name: 'JSONPlaceholder',
      url: 'https://google.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:1234',
      description: 'Production server',
    },
    {
      url: 'http://localhost:1234',
      description: 'Development server',
    }
  ],
components: {
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT', 
      description: 'Enter your JWT token in the format **Bearer &lt;token&gt;**',
    },
  },
},
security: [
  {
    bearerAuth: [],
  },
],
};

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./router/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/v1', userRouter);
app.use('/api/v1', productRouter);
app.use('/api/v1', paymentRouter)

app.use('/', (req, res) => {
  res.send('Connected to Backend Server')
});

app.use((error, req, res, next) => {
  if (error) {
    return res.status(500).json({
      message: error.message
    })
  };
  next();
});


mongoose.connect(DB).then(() => {
  console.log('Connected to Database')
  app.listen(PORT, () => {
    console.log('Server is running on Port:', PORT)
  })
}).catch((error) => {
  console.log('Error connecting to Database', error.message)
});