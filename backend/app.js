var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const http = require('http');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const { errorHandler, notFoundHandler } = require('./middlewares/errorMiddleware');

const { connectToMongoDB } = require('./config/db');

var app = express();

// ── Security & Optimization ────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: false,
})); // Basic security headers with CORP disabled to allow image loading
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes." }
});
app.use('/users/login', limiter); // Apply rate limit specifically to login

const corsOptions = {
  origin: config.frontendUrl,
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
var reportRouter          = require('./routes/report.routes');
var notificationRouter    = require('./routes/notification.routes');
var skillRouter           = require('./routes/skill.route');
var publicRouter          = require('./routes/public.routes');
var formateurPaiementRouter = require('./routes/formateurPaiement.routes');

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
app.use('/reports',      reportRouter);
app.use('/notifications', notificationRouter);
app.use('/skills',       skillRouter);
app.use('/public',       publicRouter);
app.use('/formateur-paiements', formateurPaiementRouter);

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
        url: config.baseUrl,
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

// ── Error Handling ─────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

const server = http.createServer(app);
server.listen(config.port, () => {
  connectToMongoDB();
  console.log(`Server is running on ${config.baseUrl}`);
});