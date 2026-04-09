var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const http = require('http');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const { connectToMongoDB } = require('./config/db');
require('dotenv').config();

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

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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