var routes = function(app) {

  var assert = require('assert');
  var util = require('util');
  const imageSearchLayerModel = require('./models.js');
  const mongoose = require('mongoose');
  // include google image search module
  const googleSearch = require("google-search");

  app.get('/', function(req, res) {
    res.render('index.html');
  });

  app.get('/api/imagesearch/:q', function(req, res) {

    // instantiate new search engine
    const client = new googleSearch({
      key: process.env.GOOGLE_API_KEY,
      cx: process.env.CSE_ID
    });

    var query = req.params.q;
    // console.log(query);
    var page = req.query.offset;
    // console.log("offset = " + page);

    // build search specifications
    client.build({
      q: query,
      gl: "US", //geolocation,
      lr: "lang_en",
      searchType: "image",
      start: page > 0 ? page + 1 : 1, // 10 image searches per page
      num: 10, // Number of search results to return between 1 and 10, inclusive
      siteSearch: "https://www.google.com/" // Restricts results to URLs from a specified site
    }, function(err, response) {
      // console.log("this is the response: " + util.inspect(response));
      // display err message if not equal to null
      assert.equal(null, err, err);

      var results = [];

      if (response.items === undefined) {
        res.send({
          "error":{"errors":[{"domain":"global","reason":"invalid","message":"Invalid Value"}],"code":400,"message":"Invalid Value"}
        });
      } else {
        // console.log(util.inspect(response.items));

        // map through response.items array and push each image object into results array
        response.items.forEach(function(images) {
          results.push({
            "url": images.link,
            "snippet": images.snippet,
            "thumbnail": images.image.thumbnailLink,
            "context": images.image.contextLink
          });
        });

        let url = process.env.MONGODB_LAB_URI;
        mongoose.connect(url);
        // access mongo db
        let db = mongoose.connection;

        // check if connection error
        db.on('error', function() {
          console.log('Mongoose connection error!');
        });

        // check for successful connection
        db.once('open', function() {
          console.log('Connection sucessfull!');

          var imageLayer = {
            term: query,
            when: Date.now()
          };

          let newImageAbstraction = new imageSearchLayerModel(imageLayer);
          // console.log(newImageAbstraction);

          newImageAbstraction.save(function(err, newImageAbstraction) {
            console.log("Saved: " + util.inspect(imageLayer));
          });

          // max items in database is 10
          imageSearchLayerModel.count({}, function(err, count) {
            if (count > 9) {
              console.log("items in database: " + count);
              // delete oldest search query
              imageSearchLayerModel.deleteOne({}).sort({ "when": -1 }).exec(function(err, post) {
                assert.equal(null, err);
                console.log("last search was deleted: " + util.inspect(post) + "was deleted");
              });
            } else {
              console.log("items in database: " + count);
            };

          });
        });

        res.send(results);
      };
    });

  });

  app.get('/api/latest/imagesearch/', function(req, res) {

    let url = process.env.MONGODB_LAB_URI;
    mongoose.connect(url);
    let db = mongoose.connection;

    db.on('error', function() {
      console.log('Mongoose connection error!');
    });

    db.once('open', function() {
      console.log('Connection sucessfull!');

      imageSearchLayerModel.find({}, { "_id": 0, "__v": 0 }).sort( { 'when': -1 } ).exec(function(err, docs) {
        assert.equal(null, err);
        console.log("search was a success!")
        res.send(docs);
      });
    });
  });

};

module.exports = routes;
