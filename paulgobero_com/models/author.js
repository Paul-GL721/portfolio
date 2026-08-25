

//########## Defining Author model from schema #########

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { promisify } = require('util');
const { randomBytes, scrypt, timingSafeEqual } = require('crypto');

const scryptAsync = promisify(scrypt);
const PASSWORD_PREFIX = 'scrypt';

async function hashPassword(password) {
	const salt = randomBytes(16).toString('hex');
	const derivedKey = await scryptAsync(String(password), salt, 64);
	return `${PASSWORD_PREFIX}$${salt}$${derivedKey.toString('hex')}`;
}

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
	brandName: { type: String },
	hostName: { type: String },
	yourKeyword: [{ type: String, trim: true }],
	email: { type: String, required: [ true, 'Please enter your email address' ], unique: true, lowercase: true, trim: true },
	password: { type: String, select: false },
	authorStatus: { type: String, required: true, trim: true },
	authorRole: { type: String, required: true, trim: true },
    socialmedia: {
		github: { type: String, trim: true },
		linkedin: { type: String, trim: true }
    },
	imageName: { type: String, required: true },
	imageUrl: { type: String }
}, { timestamps: true });

AuthorSchema.pre('save', async function hashChangedPassword() {
	if (!this.isModified('password') || !this.password || this.password.startsWith(`${PASSWORD_PREFIX}$`)) {
		return;
	}

	this.password = await hashPassword(this.password);
});

AuthorSchema.methods.passwordNeedsUpgrade = function passwordNeedsUpgrade() {
	return Boolean(this.password) && !this.password.startsWith(`${PASSWORD_PREFIX}$`);
};

AuthorSchema.statics.hashPassword = hashPassword;

AuthorSchema.methods.verifyPassword = async function verifyPassword(candidatePassword) {
	if (typeof candidatePassword !== 'string' || !this.password) {
		return false;
	}

	if (this.passwordNeedsUpgrade()) {
		const suppliedPassword = Buffer.from(candidatePassword);
		const storedPassword = Buffer.from(String(this.password));
		return suppliedPassword.length === storedPassword.length && timingSafeEqual(suppliedPassword, storedPassword);
	}

	const [, salt, storedKey] = this.password.split('$');
	if (!salt || !storedKey) {
		return false;
	}

	const suppliedKey = await scryptAsync(candidatePassword, salt, 64);
	const storedKeyBuffer = Buffer.from(storedKey, 'hex');
	return suppliedKey.length === storedKeyBuffer.length && timingSafeEqual(suppliedKey, storedKeyBuffer);
};

//define the virtual properties
AuthorSchema.virtual('brand').get(function() {
    return this.name.first + ' ' + this.name.last;
});
AuthorSchema.virtual("url").get(function() {
    return `/portfolio/author/${this._id}`;
});
//make virtual properties querable
const authorSerializationOptions = {
	virtuals: true,
	transform: function removePassword(document, result) {
		delete result.password;
		return result;
	}
};

AuthorSchema.set('toObject', authorSerializationOptions);
AuthorSchema.set('toJSON', authorSerializationOptions);

//export the model
module.exports = mongoose.model( "Author", AuthorSchema );
