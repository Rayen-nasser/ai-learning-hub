var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const http = require('http');// 1

const { connectToDatabase } = require('./config/db');// 2
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const osRouter = require('./routes/os.routes');

require('dotenv').config(); // Load environment variables from .env file
var app = express();



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/index', indexRouter);
app.use('/users', usersRouter);
app.use('/os', osRouter);

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
<<<<<<< HEAD

server.listen(process.env.PORT, () => {
  connectToDatabase();
  console.log(`server is running on http://localhost:${process.env.PORT}`);
});

=======
server.listen(5000,()=>{
  console.log('server is running at http://llocalhost:5000')
});// create http server and listen on port 5000
>>>>>>> efac581be2c6275d83fa6b10ad8a64189f551873
