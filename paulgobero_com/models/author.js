

//########## Defining Author model from schema #########

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
    name: {
	first: { type: String, required: [true, 'Please insert first name'], maxLength: 50 },
	middle:  { type: String, maxLength: 50 },
	last: { type: String, required: [true, 'Please insert last name'], maxLength: 50 }
    },
    contact: {
	phoneNumber: {
	    work: { type: String },
	    home: { type: String }
	}
    },
    email: { type: String, required: [ true, 'Please enter your email address' ], lowercase: true },
    personal_website: { type: String }
}, { timestamps: true });

//define the virtual property
AuthorSchema.virtual('fullName').get(function() {
    return this.name.first + ' ' + this.name.middle + ' ' + this.name.last;
});

//export the model
module.exports = mongoose.model( "Author", AuthorSchema );
