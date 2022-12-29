
//####### Create project module from schema ######

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//create schema
const ProjectSchema = new Schema({
    ptitle: { type: String, required: true },
    psummary: { type: String, required: true },
    problemStatement: { type: String, required: true },
    solution: { type: String },
    skill: { type: Schema.Types.ObjectId, ref: "Skill", required: true },
    role: { type: String, required: true },
    githubUrl: { type: String },
    skill: [{ type: Schema.Types.ObjectId, ref: "Skill", required: true }],
    author: [{ type: Schema.Types.ObjectId, ref: "Author" }],
    specialisation: [{ tyepe: Schema.Types.ObjectId, ref: "Specialisation", required: true }]
}, {timestamps: true });

//Add virtual property
ProjectSchema.virtual("url").get(function() {
    return `/paulgobero_com/project/${this._id}`;
});

//export model
module.exports = mongoose.model("Project", ProjectSchema);
