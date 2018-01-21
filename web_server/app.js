var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var configs = require('../configs');

var db = require('../utils/db');
db.init(configs.mysql());


var index = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');
var payment = require('./routes/payment');
var adminApiAdmins = require('./routes/api/admin/admins');
var adminApiConfigs = require('./routes/api/admin/configs');
var adminApiUsers = require('./routes/api/admin/users');
var adminApiAgency = require('./routes/api/admin/agency');

var app = express();

//设置跨域访问
app.all('/api/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Authorization, Accept");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1')
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/admin', admin);
app.use('/payment', payment);
app.use('/api/admin/admins', adminApiAdmins);
app.use('/api/admin/configs', adminApiConfigs);
app.use('/api/admin/users', adminApiUsers);
app.use('/api/admin/agency', adminApiAgency);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
