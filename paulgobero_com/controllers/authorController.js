/* Author model controller */

const Author = require("../models/author"); //author model
const crypto = require("crypto"); //generate random names
const sharp = require("sharp"); //resize images
const { body, validationResult } = require("express-validator"); //form validator
const { storage, fileFilter, uploadimg } = require("../uploads/img_vid_upload"); //multer image upload
const async = require("async"); //run async functions
//s3 file upload
const {  S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { BUCKET_NAME, BUCKET_REGION, ACCESS_KEY, SECRET_ACCESS_KEY } = require('../configs/config');
const author = require("../models/author");
const { isMainThread } = require("worker_threads");

//s3 bucket connection parameters
const s3Client = new S3Client({
	region: BUCKET_REGION,
	credentials: {
		accessKeyId: ACCESS_KEY,
		secretAccessKey: SECRET_ACCESS_KEY
	}
});

//generate random imagefile name
const generaterandomimgname = () => {
	const randomimagefilename = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
	const imgfilename = randomimagefilename();
	return imgfilename
}


//Display home website page
exports.index = (req, res, next) => {
	res.render("website_index", { Title: "Portfolio"});
};

//Display a list of authors
exports.author_list = (req, res) => {
	res.send("NOT IMPLEMENTED: Author list");
};

//Display details of specific author
exports.author_detail = (req, res) => {
	res.send(`NOT IMPLEMENTED: Author details: ${req.params.id}`);
}

//on GET request, display the author create form
exports.author_create_get = (req, res, next) => {
	res.render("create_author.njk", {Title: "Create author"});
}

//On post, send data to database
exports.author_create_post = [
	//multer upload image
	uploadimg.single('photo1'),

	//validate and sanitize the form fields
	body("authorfirstname", "First name is required").trim().isLength({ min:2 }).escape(),
	body("authormiddlename", "Middle name").trim().escape(),
	body("authorlastname", "Last name is required").trim().isLength({ min:2 }).escape(),
	body("mobilenumber", "Your mobile number").isNumeric().trim().escape(),
	body("worknumber", "Workplace number").isNumeric().trim().escape(),
	body("facebookurl", "Facebook url").isURL().trim().escape(),
	body("twitterurl", "Twitter url").isURL().trim().escape(),
	body("githuburl", "Github url").isURL().trim().escape(),
	body("linkeninurl", "Linkedin url").isURL().trim().escape(),
	body("authoremail", "Author email is required").isEmail().trim().escape(),
	body("authorwebsite", "Author portfolio website ").isURL().trim().escape(),

	async (req, res, next) => {
		const profilepic = generaterandomimgname();//image name

		//extract error from request
		const errors = validationResult(req);
		if (!errors.isEmpty()) { //if formdata has errors
			console.log("Form Data has errors" + " " + errors);
			//render the author form with errors as values
		} else {
			//create an author object with escaped values
			const authors = new Author({
				name: {
					first: req.body.authorfirstname,
					middle: req.body.authormiddlename,
					last: req.body.authorlastname
				},
				contact: {
					phoneNumber: {
						mobile: req.body.mobilenumber,
						work: req.body.worknumber
					},
					email: req.body.authoremail,
					personal_website: req.body.authorwebsite,
				},
				socialmedia: {
					facebook: req.body.facebookurl,
					twitter: req.body.twitterurl,
					github: req.body.githuburl,
					linkedin: req.body.linkeninurl
				},
				imageName: profilepic 
			});
			//save author object to database
			author.save( (err) => {
				if (err) {
					console.log("Errors when saving data" + err )
					return next(err);
				}
				console.log("Saved successfully");
				res.redirect(author.url);
			});
		}
	},
];

//Display author delete form on Get
exports.author_delete_get = (req, res) => {
	res.send("NOT IMPLEMENTED: Author delete get");
}

//Display author delete form on Post
exports.author_delete_post = (req, res) => {
	res.send("NOT IMPLEMENTED: Author delete post");
}

//Display author update form on Get
exports.author_update_get = (req, res) => {
	res.send("NOT IMPLEMENTED: Author update get");
}

//Display author update form on Post
exports.author_update_post = (req, res) => {
	res.send("NOT IMPLEMENTED: Author update post");
}
