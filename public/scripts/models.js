// require object data modeling
var mongoose = require('mongoose'),
    // mongoose schema method
    Schema = mongoose.Schema,
    // mongoose objectId
    ObjectId = Schema.ObjectId;

// create blueprint(schema) of urlShortener
var imageSearchLayerSchema = Schema({
  id: ObjectId,
  term: String,
  when: { type: Date, default: Date.now }
});

// compile schema into a model (class to create object instance)
var imageSearchLayerModel = mongoose.model('imageSearchLayerModel', imageSearchLayerSchema);

module.exports = imageSearchLayerModel;
