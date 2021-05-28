const express = require('express');
const app = express();
var cors = require('cors')
var logger = require('morgan');
require('dotenv').config()
app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use(logger('dev'));

app.use(cors({credentials:true, origin:"*"}));

app.use(function(req, res, next) {
  // res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  // next();
  /*var err = new Error('Not Found');
   err.status = 404;
   next(err);*/

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');

  //  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
  // Pass to next layer of middleware

});

require('./knex');

const { attachPaginate } = require('knex-paginate');
attachPaginate();

//GET
app.get('/', (req, res) => {

   res.status(200).send('COVID-19 server API');
});


require('./routes/v1')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
   next(createError(404));
 });
 
 // error handler
 app.use(function(err, req, res, next) {
 
   if (err && err.error && err.error.isJoi) {
     // we had a joi error, let's return a custom 400 json response
     res.status(400).json({
       success: false,
       type: err.type, // will be "query" here, but could be "headers", "body", or "params"
       message: err.error.toString()
     });
 
   }else{
     // set locals, only providing error in development
    //  res.locals.message = err.message;
    //  res.locals.error = req.app.get('env') === 'development' && true ? err : {};
 
    //  // render the error page
    //  res.status(err.status || 500);
    //  res.send('Internal server error');
    next();
   }
 });

module.exports = app;