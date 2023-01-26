

//############# Create the skills model from schema ##########

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//create the schema
const SkillSchema = new Schema({
    name: { type: String, required: true, maxLength: 30 },
    description: { type: String, required: true, maxLength: 300 },
    imageName: { type: String, required: true },
    imageUrl: { type: String }
}, {timestamps: true} );

//export model
module.exports = mongoose.model("Skill", SkillSchema);
