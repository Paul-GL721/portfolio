
//####### Generate blog model from schema #####

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//create the schema
const BlogSchema = new Schema({
    title: { type: String, required: [true, "Enter blog title"], maxLength: 100 },
    author: [{ type: Schema.Types.ObjectId, ref: "Author", required: true }],
    keyword: [{ type: String, required: true }],
    summary: { type: String, required: true },
    introduction: { type: String, required: true },
    body: { type: String },
    conclusion: { type: String },
    bstatus: { type: String, required: true, enum: ["Inprocess", "Completed"], default: "Inprocess" } 
}, timestamps: true );

//url virtual property
BlogSchema.virtual("url").get(function () {
    return `/paulgobero_com/blog/${this._id}`;
});

//export model
module.exports = mongoose.model("Blog", BlogSchema);
