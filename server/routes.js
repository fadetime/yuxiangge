/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var path = require('path');
var remind = require('./api/remind/remind');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/restaurants', require('./api/restaurant'));
  app.use('/api/customers', require('./api/customer'));
  app.use('/api/waiters', require('./api/waiter'));
  app.use('/api/categories', require('./api/category'));
  app.use('/api/products', require('./api/product'));
  app.use('/api/gifts', require('./api/gift'));
  app.use('/api/orders', require('./api/order'));
  app.use('/api/members', require('./api/member'));
  app.use('/api/tables', require('./api/table'));
  app.use('/api/extras', require('./api/extra'));
  app.use('/api/integrals', require('./api/integral'));
  app.use('/api/pan-categories', require('./api/pan_category'));
  app.use('/api/pan-soups', require('./api/pan_soup'));
  app.use('/api/attributes', require('./api/attribute'));
  app.use('/api/upload', require('./api/upload'));
  app.use('/api/language', require('./api/language'));
  app.use('/api/prints', require('./api/print'));

  app.use('/auth', require('./auth'));
  
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
};
