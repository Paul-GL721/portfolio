
//####### Create the specialistaion model from schema #######
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//create schema
const SpecialisationSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String }

}, timestamps: true );

//export model
module.exports = mongoose.model("Specialisation", SpecialisationSchema);
