var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const http = require('http');

const { connectToMongoDB } = require('./config/db');
require('dotenv').config();

// ── Routes ──────────────────────────────────────────────
var indexRouter                       = require('./routes/index');
var usersRouter                       = require('./routes/users.routes');
var osRouter                          = require('./routes/os.routes');

// Acteurs (héritent de User)
var apprenantRouter                   = require('./routes/apprenant.routes');
var formateurRouter                   = require('./routes/formateur.routes');
var directeurCentreFormationRouter    = require('./routes/directeurcentreformation.routes');
var adminsRouter                      = require('./routes/admin.routes');

// Entités métier
var coursRouter                       = require('./routes/cours.routes');
var leconRouter                       = require('./routes/lecon.routes');
var inscriptionRouter                 = require('./routes/inscription.routes');
var paiementRouter                    = require('./routes/paiement.routes');
var avisRouter                        = require('./routes/avis.routes');

// ── App ──────────────────────────────────────────────────
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ── Enregistrement des routes ────────────────────────────
app.use('/index',                       indexRouter);
app.use('/users',                       usersRouter);
app.use('/os',                          osRouter);

// Acteurs
app.use('/apprenants',                  apprenantRouter);
app.use('/formateurs',                  formateurRouter);
app.use('/directeurs',                  directeurCentreFormationRouter);
app.use('/admins',                      adminsRouter);

// Entités métier
app.use('/cours',                       coursRouter);
app.use('/lecons',                      leconRouter);
app.use('/inscriptions',                inscriptionRouter);
app.use('/paiements',                   paiementRouter);
app.use('/avis',                        avisRouter);

// ── Gestion des erreurs ──────────────────────────────────
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json({ error: err.message });
});

// ── Démarrage du serveur ─────────────────────────────────
const server = http.createServer(app);
server.listen(process.env.PORT, () => {
  connectToMongoDB();
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});