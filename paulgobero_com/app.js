var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Buffer = require('safer-buffer');
var nunjucks = require('nunjucks');
/*var { DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT } = require('./configs/config');
var  database_connection = require('./configs/loadb');
var db  = database_connection( DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT ); */


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var portfolioRouter = require('./routes/portfolio');

//SEO middleware
var seoContext = require('./utils/seoContext');

var app = express();

// view engine setup
// set default express engine and extension
app.engine('njk', nunjucks.render);
app.set('view engine', 'njk');

//configure nunjucks view engine
nunjucks.configure('views', {
	autoescape: true,
	express: app
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Apply the SEO middleware
//app.use(seoContext);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/portfolio', seoContext, portfolioRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  const status = err.status || 500;

  if (status === 404) {
    return res.status(404).render('404', {
      Title: 'Page not found | Portfolio',
      requestedPath: req.path,
      meta_title: 'Page not found | Portfolio',
      meta_description: 'The requested portfolio page could not be found.',
      full_description: 'The requested portfolio page could not be found.',
      meta_robots: 'noindex, nofollow',
      brand1: {
        brandName: res.locals.meta_author || 'Portfolio',
        socialmedia: res.locals.social || {}
      },
      current_year: new Date().getFullYear()
    });
  }

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(status);
  res.render('error');
});

module.exports = app;
