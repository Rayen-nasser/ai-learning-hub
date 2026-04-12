var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const http = require('http');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const { connectToMongoDB } = require('./config/db');
require('dotenv').config();

var app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
};
app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const publicPath = path.join(__dirname, 'public');
app.use('/images', express.static(path.join(publicPath, 'images')));
app.use('/uploads', express.static(path.join(publicPath, 'uploads')));
app.use(express.static(publicPath));

// ── Routes ──────────────────────────────────────────────
var usersRouter           = require('./routes/users.routes');
var centreFormationRouter = require('./routes/centreFormation.route');
var formationRouter       = require('./routes/formation.route');
var leconRouter           = require('./routes/lecon.routes');
var leconContentRouter    = require('./routes/leconContent.route');
var inscriptionRouter     = require('./routes/inscription.routes');
var paiementRouter        = require('./routes/paiement.routes');
var avisRouter            = require('./routes/avis.routes');
var favoriRouter          = require('./routes/favori.route');
var categorieRouter       = require('./routes/categorie.route');
var adminRouter           = require('./routes/admin.routes');

// ── Enregistrement des routes ────────────────────────────
app.use('/users',        usersRouter);
app.use('/centres',      centreFormationRouter);
app.use('/formations',   formationRouter);
app.use('/lecons',       leconRouter);
app.use('/contents',     leconContentRouter);
app.use('/inscriptions', inscriptionRouter);
app.use('/paiements',    paiementRouter);
app.use('/avis',         avisRouter);
app.use('/favoris',      favoriRouter);
app.use('/categories',   categorieRouter);
app.use('/admin',        adminRouter);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Backend API',
      version: '1.0.0',
      description: 'API documentation for your backend',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── catch 404 and forward to error handler ──────────────────────────────────
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json('error');
});

const server = http.createServer(app);
server.listen(process.env.PORT, () => {
  connectToMongoDB();
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});