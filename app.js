var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const http = require('http'); //1

const { connectToMongoDB } = require('./config/db');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users.routes');
var osRouter = require('./routes/os.routes');
var learnersRouter = require("./routes/learner.routes");
var adminsRouter = require("./routes/admin.routes");
var formateursRouter = require("./routes/formateur.routes");
var coursRouter = require("./routes/cours.routes");
var leconsRouter = require("./routes/lecon.routes");
var inscriptionsRouter = require("./routes/inscription.routes");

require('dotenv').config(); // Load environment variables

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/index', indexRouter);
app.use('/users', usersRouter);
app.use('/os', osRouter);
app.use("/learners", learnersRouter);
app.use("/admins", adminsRouter);
app.use("/formateurs", formateursRouter);
app.use("/cours", coursRouter);
app.use("/lecons", leconsRouter);
app.use("/inscriptions", inscriptionsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json('error');
});

//2
const server = http.createServer(app);
server.listen(process.env.PORT, () => {
  connectToMongoDB();
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});