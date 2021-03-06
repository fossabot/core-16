/**
 * @fileoverview Controller model
 */

//Imports
const mongoose = require('mongoose');
const {filters} = require('../../config.js');

//Schema
const schema = new mongoose.Schema({
  name: {type: String, validate: filters.name, required: true},
  key: {type: String, validate: filters.key, required: true}
});

//Statics
schema.statics = {
  create: function (data, cb)
  {
    const controller = new this(data);
    controller.save(cb);
  },
  get: function (query, cb)
  {
    this.find(query, cb);
  },
  update: function (query, data, cb)
  {
    this.findOneAndUpdate(query, {$set: data}, {new: true}, cb);
  },
  remove: function (query, cb)
  {
    this.findOneAndDelete(query, cb);
  }
};

//Export
module.exports = mongoose.model('controller', schema);