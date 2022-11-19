

//########## Defining Author model from schema #########

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
    name: {
	first: { type: String, required: [true, 'Please insert first name'], maxLength: 50, trim: true },
	middle:  { type: String, maxLength: 50, trim: true },
	last: { type: String, required: [true, 'Please insert last name'], maxLength: 50, trim: true }
    },
    contact: {
	phoneNumber: {
	    work: { type: String, trim: true },
	    home: { type: String, trim: true }
	}
    },
    email: { type: String, required: [ true, 'Please enter your email address' ], lowercase: true, trim: true },
    personal_website: { type: String, trim: true }
}, { timestamps: true });

//define the virtual property
AuthorSchema.virtual('fullName').get(function() {
    return this.name.first + ' ' + this.name.middle + ' ' + this.name.last;
});

//export the model
module.exports = mongoose.model( "Author", AuthorSchema );
