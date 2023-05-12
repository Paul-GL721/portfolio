
//####### Create the specialistaion model from schema #######
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//create schema
const SpecialisationSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String }

}, {timestamps: true} );

// Virtual for specialisation's URL
SpecialisationSchema.virtual('url').get(function () {
    return '/specialisation/' + this._id;
  });

//export model
module.exports = mongoose.model("Specialisation", SpecialisationSchema);
