

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

//define the virtual properties
SkillSchema.virtual("url").get(function() {
    return `/portfolio/skill/${this._id}`;
});
//make virtual properties querable
SkillSchema.set('toObject', { virtuals: true });

//export model
module.exports = mongoose.model("Skill", SkillSchema);
