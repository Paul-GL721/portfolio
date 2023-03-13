

//########## Defining Author model from schema #########

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
    name: {
		first: { type: String, required: [true, 'Please insert first name'], maxLength: 50, trim: true },
		middle:  { type: String, maxLength: 50, trim: true },
		last: { type: String, required: [true, 'Please insert last name'], maxLength: 50, trim: true }
    },
	about: {
		short_description: { type: String, required: [true, 'Write a short descirpion of you'], maxLength: 100, trim: true },
		full_description: { type: String, required: [true, 'Tell us more about you'], maxLength: 900, trim: true }
    },
    contact: {
		phoneNumber: {
		    mobile: { type: String, trim: true },
		    work: { type: String, trim: true }
		},
		email: { type: String, required: [ true, 'Please enter your email address' ], lowercase: true, trim: true },
	    personal_website: { type: String, trim: true }
    },
    socialmedia: {
		facebook: { type: String, trim: true },
		twitter: { type: String, trim: true },
		github: { type: String, trim: true },
		linkedin: { type: String, trim: true }
    },
	imageName: { type: String, required: true },
	imageUrl: { type: String }
}, { timestamps: true });

//define the virtual properties
AuthorSchema.virtual('brand').get(function() {
    return this.name.first + ' ' + this.name.last;
});
AuthorSchema.virtual("url").get(function() {
    return `/website/author/${this._id}`;
});
//make virtual properties querable
AuthorSchema.set('toObject', { virtuals: true });

//export the model
module.exports = mongoose.model( "Author", AuthorSchema );
