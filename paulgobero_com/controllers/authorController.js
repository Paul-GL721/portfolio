/* Author model controller */

const Author = require("../models/author"); //author model
const Project = require("../models/project"); //project model
const crypto = require("crypto"); //generate random names
const sharp = require("sharp"); //resize images
const { body, validationResult } = require("express-validator"); //form validator
const { storage, fileFilter, uploadimg } = require("../uploads/img_vid_upload"); //multer image upload
const async = require("async"); //run async functions
const nodemailer = require("nodemailer"); //send email from contact form
//s3 file upload
const {  S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { BUCKET_NAME, BUCKET_REGION, ACCESS_KEY, SECRET_ACCESS_KEY, EMAIL_USER, EMAIL_PASSWORD } = require('../configs/config');

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

//function to delete from s3 bucket
const deletefroms3bucket = async (delparams) => {
	try {
	  const data = await s3Client.send(new DeleteObjectCommand(delparams));
	  console.log("Success. Object deleted.", data);
	  return data; // For unit tests.
	} catch (err) {
	  console.log("Error when deleting images", err);
	}
};



//Display home website page
exports.index = async (req, res, next) => {
	const allprojects = await Project.find({}).sort({ createdAt: -1 })
	.populate('author', 'name')
	.populate('skill', 'name')
	.populate('specialisation', 'name')
	.exec( async function (err, list_projects) {
		if (err) {
			return next(err);
		}
		for (let projectz of list_projects) {
			projectz.mediaUrl.videoUrl = await getSignedUrl(s3Client, new GetObjectCommand({
				Bucket: BUCKET_NAME,
				Key: projectz.mediaName.videoName
			}), { expiresIn: 3600 })
			projectz.mediaUrl.imageUrl = await getSignedUrl(s3Client, new GetObjectCommand({
				Bucket: BUCKET_NAME,
				Key: projectz.mediaName.imageName
			}), { expiresIn: 3600 })
		}
		res.render("website_index", { Title: "Portfolio", index_data: list_projects});
	});
};

//Send email from contact form
exports.index_post = [
	//validate and sanitize the form fields
	body("contactname", "Contact name is required").trim().isLength({ min:3 }).escape(),
	body("contactemail", "Contact email is required").isEmail().trim().escape(),
	body("contactmessage", "Contact message is required").trim().isLength({ min:3 }).escape(),

    async (req, res, next) => {
		//check for validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) { //if formdata has errors
			console.log("The data has errors");
			console.log(errors);
			//Re-render the project form with errors

		} else {
			//console.log("this is the body");
			//console.log(req.body);
			
			const transporter = nodemailer.createTransport({
				host: "mail.paulgobero.com",
				port: 465,
				secure: true,
				auth: {
					type: "login",
					user: EMAIL_USER,
					pass: EMAIL_PASSWORD
				}
			});

			const mailoptions = {
				from: {
					name: req.body.contactname,
					address: EMAIL_USER,
				},
				to:  EMAIL_USER,
				subject: `Message from ${req.body.contactname}`,
				text: req.body.contactmessage,
				replyTo: req.body.contactemail
			};
			
			transporter.sendMail(mailoptions, (error, response) => {
				if (error) {
					console.log(error);
					//res.send(error);
					res.jsonp({failed : true});
				} else {
					console.log("Email Sent");
					res.redirect("/website#contact_section");
				}
			});
		}
	}
];

//Display a list of all authors
exports.author_list = async (req, res, next) => {
	const allauthors = await Author.find({}).sort({ createdAt: -1 })
	.exec( async function (err, list_authors) {
		if (err) {
			return next(err);
		}
		for (let authors of list_authors) {		
			authors.imageUrl = await  getSignedUrl(s3Client, new GetObjectCommand({
				Bucket: BUCKET_NAME,
				Key: authors.imageName
			}), { expiresIn: 3600})			
		}

		//res.json(list_authors);
		res.render("author_Admin", { Title: "Admin Author", abtauthor: list_authors });
	});
};

//API for all available authors
exports.project_authors = async (req, res, next) => {
	const allauthors = await Author.find({}, "_id name ")
	.sort({ createdAt: -1 })
	.exec(async function (err, list_authors) {
		if (err) {
			return next(err);
		}
		res.json(list_authors);
	});
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
		const profilepic = "author"+generaterandomimgname();//image name
		//resize the image file
		const filebuffer = await sharp(req.file.buffer).resize({ height: 1920, width: 1080, fit: "fill"}).toBuffer();

		//upload images to S3
		const s3uploadparams = {
			Bucket: BUCKET_NAME,
			Body: filebuffer,
			Key: profilepic
		}
		//ContentType: 'image/jpeg'

		//extract error from request
		const errors = validationResult(req);
		if (!errors.isEmpty()) { //if formdata has errors
			console.log("Form Data has errors");
			console.log(errors);
			//render the author form with errors as values
		} else {
			//create an author object with escaped values
			const authorz = new Author({
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
			authorz.save( (err) => {
				if (err) {
					console.log("Errors when saving data" + err )
					return next(err);
				}
				console.log("Successfully Saved to Database");
			});
			//upload the actual image to s3
			await s3Client.send(new PutObjectCommand(s3uploadparams));
			res.redirect(Author.url);
		}
	},
];

//Display author delete form on Get
exports.author_delete_get = (req, res) => {
	res.send("NOT IMPLEMENTED: Author delete get");
}

//On post, delete author
exports.author_delete_post = async (req, res, next) => {

	//delete from database
	const id = req.body.authorid
	Author.findByIdAndDelete(id, (err) => {
		if (err){
			return next(err);
		}
	});

	//delete image from s3 bucket
	const delauthor = await Author.findOne({_id: id}, 'imageName').exec((err, delresult) => {
		if (err){
			console.log(err);
		}
		else if (delresult) {
			console.log("the object to delete is"+delresult.imageName);
			const delparams = {
				Bucket: BUCKET_NAME,
				Key: delresult.imageName
			}
			deletefroms3bucket(delparams);
		}	
	});
	res.json({sucess: "Successfully Deleted"});
}

//On update GET, return information about form
exports.author_update_get = async (req, res, next) => {
	//find a document with the specified id
	update_doc_id = req.query.updateid;
	console.log("The id to update is" + update_doc_id);

	const updateauthor = await Author.findOne({ _id: update_doc_id })
	.exec(async function (err, update_author) {
		if (err) {
			return next(err);
		}
		update_author.imageUrl = await  getSignedUrl(s3Client, new GetObjectCommand({
			Bucket: BUCKET_NAME,
			Key: update_author.imageName
		}), { expiresIn: 3600})

		res.json(update_author);
	});
}

//On update post, submit the dat to the database 
exports.author_update_post = [
	/* Update data in the database then Delete the exiting image from s3 and add a new path
	 to the bucket. */

	 //multer upload image
	uploadimg.single('photo1'),

	async (req, res, next) => {
		const update_author_id = req.body.authorUpdateid;
		console.log ("The author update id is"+ update_author_id);
		const upprofilepic = "author"+generaterandomimgname();//image name

		//resize the image file
		const upfilebuffer = await sharp(req.file.buffer).resize({ height: 1920, width: 1080, fit: "fill"}).toBuffer();

		//update object in database
		const update_filter = {
			_id: update_author_id 
		};

		const update_authorz = { $set: {
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
			imageName: upprofilepic
		}};

		await Author.findOneAndUpdate(update_filter, update_authorz, {
			new: true,
			upsert: true,
			rawResult: true,
			runValidators: true
		});

		//delete image from s3 bucket
		const delauthor = await Author.findOne({_id: update_author_id}, 'imageName').exec((err, updelresult) => {
			if (err){
				console.log(err);
			}
			else if (updelresult) {
				console.log("the object to delete is"+updelresult.imageName);
				const delparams = {
					Bucket: BUCKET_NAME,
					Key: updelresult.imageName
				}
				deletefroms3bucket(delparams);
			}	
		});

		//upload new image to S3
		const updates3uploadparams = {
			Bucket: BUCKET_NAME,
			Body: upfilebuffer,
			Key: upprofilepic
		};
		//ContentType: 'image/jpeg'
		await s3Client.send(new PutObjectCommand(updates3uploadparams));
		console.log("Updated Successfully");
		res.redirect("/website/author");
	},
];
