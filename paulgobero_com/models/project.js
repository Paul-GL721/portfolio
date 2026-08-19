
//####### Create project module from schema ######

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MetricSchema = new Schema({
    value: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    evidenceNote: { type: String, trim: true }
}, { _id: false });

const DecisionSchema = new Schema({
    title: { type: String, required: true, trim: true },
    context: { type: String, trim: true },
    choice: { type: String, required: true, trim: true },
    tradeoff: { type: String, trim: true }
}, { _id: false });

//create schema
const ProjectSchema = new Schema({
    ptitle: { type: String, required: true },
    slug: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
        match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    },
    subtitle: { type: String, trim: true },
    psummary: { type: String, required: true },
    industry: { type: String, trim: true },
    projectType: { type: String, trim: true },
    problemStatement: { type: String, required: true },
    context: { type: String, trim: true },
    constraints: [{ type: String, trim: true }],
    solution: { type: String },
    architectureSummary: { type: String, trim: true },
    architectureDiagramUrl: { type: String, trim: true },
    decisions: [DecisionSchema],
    role: { type: String, required: true },
    metrics: [MetricSchema],
    results: [{ type: String, trim: true }],
    lessonsLearned: [{ type: String, trim: true }],
    operationalProof: {
        userCount: { type: Number, min: 0 },
        recordCount: { type: Number, min: 0 },
        operationalSince: { type: Date },
        availability: { type: String, trim: true },
        deploymentScale: { type: String, trim: true }
    },
    testimonial: {
        quote: { type: String, trim: true },
        person: { type: String, trim: true },
        role: { type: String, trim: true },
        organisation: { type: String, trim: true },
        approvedForPublication: { type: Boolean, default: false }
    },
    status: {
        type: String,
        enum: ["draft", "published", "archived"],
        default: "draft"
    },
    featuredRank: { type: Number, min: 1, default: null },
    confidential: { type: Boolean, default: false },
    githubUrl: { type: String },
    livelinkUrl: { type: String },
    articleUrl: { type: String },
    contributor: { type: String },
    skill: [{ type: Schema.Types.ObjectId, ref: "Skill", required: true }],
    author: [{ type: Schema.Types.ObjectId, ref: "Author" }],
    specialisation: [{ type: Schema.Types.ObjectId, ref: "Specialisation", required: true }],
    projectDates: {
        startDate: {type: Date },
        endDate: {type: Date, required: false,
            validate: {
                validator: function (v) {
                    if (!v) return true;
                    if (!this.projectDates?.startDate) return true;
                    return v >= this.projectDates.startDate;
                },
                message: "End date cannot be before start date",
            },
        },
    },
    checked: {type: Boolean, default: false },
    mediaName: {
        imageName: { type: String, required: true },
        videoName: { type: String, required: true }
    },
    mediaUrl: {
        imageUrl: { type: String },
        videoUrl: { type: String }
    }
}, {timestamps: true });

//Add virtual property
ProjectSchema.virtual("url").get(function() {
    return this.slug
        ? `/portfolio/projects/${this.slug}`
        : `/portfolio/project/${this._id}`;
});
//make virtual properties querable
ProjectSchema.set('toObject', { virtuals: true });

//export model
module.exports = mongoose.model("Project", ProjectSchema);
