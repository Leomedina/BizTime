const morgan = require('morgan');
const express = require('express');
const companiesRoutes = require('./routes/companies');
const invoicesRoutes = require('./routes/invoices');


const app = express();
const ExpressError = require("./expressError");

app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));

/**Routes for /companies */
app.use('/companies', companiesRoutes);

/**Routes for /invoices */
app.use('/invoices', invoicesRoutes);


/** 404 handler */
app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */
app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err.status,
    message: err.message
  });
});


module.exports = app;
