const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ServiceSchema = new Schema({
    title: { type: String, required: true, trim: true, maxLength: 120 },
    description: { type: String, required: true, trim: true, maxLength: 700 },
    icon: { type: String, trim: true, default: "icon-layers", match: /^icon-[a-z0-9-]+$/ },
    tags: [{ type: String, trim: true, maxLength: 60 }],
    displayOrder: { type: Number, min: 1, default: 1 },
    published: { type: Boolean, default: false }
}, { timestamps: true });

ServiceSchema.virtual("url").get(function() {
    return `/portfolio/service/${this._id}`;
});

ServiceSchema.set("toObject", { virtuals: true });
ServiceSchema.index({ published: 1, displayOrder: 1 });

module.exports = mongoose.model("Service", ServiceSchema);

const ServiceSectionSchema = new Schema({
    key: { type: String, required: true, unique: true, default: "homepage-services" },
    eyebrow: { type: String, required: true, trim: true, maxLength: 60, default: "Services" },
    heading: { type: String, required: true, trim: true, maxLength: 120, default: "How I Can Help" },
    introduction: { type: String, required: true, trim: true, maxLength: 700 }
}, { timestamps: true });

module.exports.ServiceSection = mongoose.model("ServiceSection", ServiceSectionSchema);
