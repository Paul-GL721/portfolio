

//############# Create the skills model from schema ##########

const mongoose = require("mongoose");
const Schema = mongoose.schema;

//create the schema
const SkillSchema = new Schema({
    name: { type: String, required: true, maxLength: 30 },
    description: type: String,
    image: { data: Buffer, contentType: String }
}, timestamps: true );

//export model
module.exports = mongoose.model("Skill", SkillSchema);
