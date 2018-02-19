// require dependencies needed for application
var express = require('express'),
    // run express web-server
    app = express(),
    // require dotenv to store sensitive variables within application
    dotenv = require('dotenv').config(),
    // require bodyParser to analyze endpoint streamdata and display as JSON
    bodyParser = require('body-parser'),
    // template engine to display static pages
    engines = require('consolidate'),
    // module to handle errors
    assert = require('assert');

// setup and immediately invoke app configuration
var appConfig = function(app) {
  // serve static files, assets, css, javascript in public directory
  app.use(express.static(__dirname + '/public'));
  // set directory of views templates
  app.set('views', __dirname + '/views');
  // sete engine template to nunjucks
  app.engine('html', engines.nunjucks);
  // convert data to be easily transferred through the web
  app.use(bodyParser.urlencoded({ extended: true}));
  // parse/analyze incoming data as json object
  app.use(bodyParser.json());
}(app);

// include routes module
var routes = require('./public/scripts/routes.js')(app);

// set up heroku env PORT || local
var port = process.env.PORT || 27017;
// listen for connection at port
var server = app.listen(port, function() {
  // log port number
  console.log("Express server is listening on port %s.", port);
});
