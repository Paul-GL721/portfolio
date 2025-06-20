/* Author model controller */

const Author = require("../models/author"); //author model
const Project = require("../models/project"); //project model
const crypto = require("crypto"); //generate random names
const sharp = require("sharp"); //resize images
const { body, validationResult } = require("express-validator"); //form validator
const { storage, fileFilter, uploadimg } = require("../uploads/img_vid_upload"); //multer image upload
const async = require("async"); //run async functions
const nodemailer = require("nodemailer"); //send email from contact form
var nunjucks = require('nunjucks');
var env = new nunjucks.Environment(null);
//s3 file upload
const {  S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { BUCKET_NAME, EMAIL_USER, EMAIL_PASSWORD, EMAIL_PORT, EMAIL_HOST  } = require('../configs/config');
const controllerUtils = require("../utils/controllerUtils");

//generate random imagefile name
const generaterandomimgname = () => {
	const randomimagefilename = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
	const imgfilename = randomimagefilename();
	return imgfilename
}

let brand;

//Display home portfolio page
/* Get projects per individual author */
exports.index = async (req, res, next) => {
	try {
        brand = await controllerUtils.getBrandName();
        //console.log("Brand name is: ", brand);
		const checkauthors = Author.exists({ authorStatus: 'owner' }, function(err, available_owner) {
			if (err) {
				res.send("There was an error: while checking for your portfolio");
			} else if (available_owner===null) { 
				res.render("default_index", { Title: "Default Page", brandname:'brandname' });
			} else {
				const author_id = available_owner._id;
				console.log(author_id)
				async.parallel(
					{
						author(callback) {
							Author.findById(author_id).exec(callback);
						},
						author_projects(callback) {
							Project.find({ author: author_id }).sort({ createdAt: -1 })
							.populate('author', 'name')
							.populate({
								path: 'skill',
								select: ['name', 'imageName', 'imageUrl' ]})
							.populate('specialisation', 'name')
							.exec(callback);
						},
					},
					async (err, results) => {
						if (err) {
							return next(err);
						}
						//console.log(results);
						//create video and image signed Urls
						results.author.imageUrl = await  getSignedUrl(controllerUtils.s3Client, new GetObjectCommand({
							Bucket: BUCKET_NAME,
							Key: results.author.imageName
						}), { expiresIn: 3600})	
						for (let projectz of results.author_projects) {
							projectz.mediaUrl.videoUrl = await getSignedUrl(controllerUtils.s3Client, new GetObjectCommand({
								Bucket: BUCKET_NAME,
								Key: projectz.mediaName.videoName
							}), { expiresIn: 3600 })
							projectz.mediaUrl.imageUrl = await getSignedUrl(controllerUtils.s3Client, new GetObjectCommand({
								Bucket: BUCKET_NAME,
								Key: projectz.mediaName.imageName
							}), { expiresIn: 3600 })
							for (let skillz of projectz.skill) { //skills
								skillz.imageUrl = await getSignedUrl(controllerUtils.s3Client, new GetObjectCommand({
									Bucket: BUCKET_NAME,
									Key: skillz.imageName
								}), { expiresIn: 3600 })
							}
						}
						//res.json(results);
						res.render("portfolio_index", { Title: "Portfolio", index_data: results, brand1: brand });
					}
				);	
			}
		});
    } catch (err) {
        console.log("Error occurred: ", err);
    }
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
			/*console.log("this is the email body");
			console.log(req.body);
			//console.log('emial host is', EMAIL_HOST)*/
			const transporter = nodemailer.createTransport({
				host: EMAIL_HOST,
				port: EMAIL_PORT,
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
			
			transporter.sendMail(mailoptions, (error, info) => {
				if (error) {
					console.log("Mail error", error);
					res.render("partial_contact_form", {
					alert: { type: "danger", message: "Failed to send message. Try again later." },
					formdata: req.body
					}, (err, html) => {
						return res.json({ success: false, html });  
					});
				} else {
					console.log("Email Sent");
					res.render("partial_contact_form", {
					alert: { type: "success", message: "Message sent successfully!" }
					}, (err, html) => {
						return res.json({ success: true, html }); 
					});
				}
			});
		}
	}
];

//Display a list of all authors
exports.author_list = async (req, res, next) => {
	try {
		brand = await controllerUtils.getBrandName();
		// Get role from decoded cookie token
		const Role = req.userinfo.role; 
		// If user is not an admin or normal user, return error
		if (Role !== 'admin') {
		return res.status(403).send({ message: 'Unauthorized User Trying to Login' });
		} else {
			const allauthors = await Author.find({}).sort({ createdAt: -1 })
			.exec( async function (err, list_authors) {
				if (err) {
					return next(err);
				}
				for (let authors of list_authors) {		
					authors.imageUrl = await  getSignedUrl(controllerUtils.s3Client, new GetObjectCommand({
						Bucket: BUCKET_NAME,
						Key: authors.imageName
					}), { expiresIn: 3600})			
				}
				//res.json(list_authors);
				res.render("author_Admin", { Title: "Admin Author", abtauthor: list_authors, brand1: brand });
			});	
		}
	} catch (err) {
		console.log("There was an error in the brand name");
		console.log(err);
	}
};

//API for all available authors
exports.project_authors = async (req, res, next) => {
	// Get role from decoded cookie token
	const Role = req.userinfo.role; 
	// If user is not an admin or normal user, return error
	if (Role !== 'admin') {
	  return res.status(403).send({ message: 'Unauthorized User Trying to Login' });
	} else {
		const allauthors = await Author.find({}, "_id name ")
		.sort({ createdAt: -1 })
		.exec(async function (err, list_authors) {
			if (err) {
				return next(err);
			}
			res.json(list_authors);
		});
	}
};

//Display details of specific author
exports.author_detail = async(req, res, next) => {
	try {
		brand = await controllerUtils.getBrandName();
		const detailauthor = await Author .findById(req.params.id, {})
		.exec( async function (err, details_authors) {
			if (err) {
				return next(err);
			}
			details_authors.imageUrl = await controllerUtils.signedurl( BUCKET_NAME, details_authors.imageName, 3600 );
			//console.log("details_authors")
			//res.json(details_authors);
			res.render("author_detail", { Title: "Author details", abtauthor: details_authors, brand1: brand });
			
			//res.render( "author_detail", { Title: "Author details", detailauthors: details_authors, brand1: brand });
		});
	} catch {
		console.log("Author Detail Error occurred: ", err);	
	}
	
};


//on GET request, display the author create form
exports.author_create_get = async (req, res, next) => {
	try {
		brand = await controllerUtils.getBrandName();
		// Get role from decoded cookie token
		const Role = req.userinfo.role;
		// If user is not an admin or normal user, return error
		if (Role !== 'admin') {
		return res.status(403).send({ message: 'Unauthorized User Trying to Login' });
		} else {
			res.render("create_author.njk", {Title: "Create author", brand1: brand });
		}
	} catch {
		console.log("There was an error in the brand name");
		console.log(err);
	}
}

//On post, send data to database
exports.author_create_post = [
	//multer upload image
	uploadimg.single('photo1'),

	//validate and sanitize the form fields
	body("authorfirstname", "First name is required").trim().isLength({ min:2 }).escape(),
	body("authormiddlename", "Middle name").trim().escape(),
	body("authorlastname", "Last name is required").trim().isLength({ min:2 }).escape(),
	body("authorshortdesc", "Write a short description about you").trim().isLength({ min:2 }).escape(),
	body("authorfulldesc", "Write more about yourself").trim().isLength({ min:2 }).escape(),
	body("authorbrandname", "Enter your brand name").trim().escape(),
	body("authorstatus", "Author status").trim().isLength({ min:2 }).escape(),
	body("authorRole", "Author Role").trim().isLength({ min:2 }).escape(),
	body("githuburl", "Github url").isURL().trim().escape(),
	body("linkeninurl", "Linkedin url").isURL().trim().escape(),
	body("authoremail", "Author email is required").isEmail().trim().escape(),

	async (req, res, next) => {
		/*// Set response headers
		res.setHeader('Content-Type', 'application/json');
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');*/

		// Get role from decoded cookie token
		const Role = req.userinfo.role;
		const subemail = req.body.authoremail;
		//check if email exists, if not create a new user else ignore 
		const checkauthors = await Author.exists({ email: subemail });
		if (!checkauthors) {
			// If user is not an admin or normal user, return error
			if (Role !== 'admin') {
				//return res.status(403).send({ message: 'Unauthorized User Trying to Login' });
				return res.status(403).json({ message: 'Unauthorized User Trying to Login' });
			} else {
				const profilepic = "author"+generaterandomimgname();//image name
				//resize the image file
				const filebuffer = await sharp(req.file.buffer).resize({ height: 667, width: 500, fit: "fill"}).toBuffer();
	
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
					return res.status(400).json({ errors: errors.array() });
					//render the author form with errors as values
				} else {
					//create an author object with escaped values
					const authorz = new Author({
						name: {
							first: req.body.authorfirstname,
							middle: req.body.authormiddlename,
							last: req.body.authorlastname
						},
						about: {
							short_description: req.body.authorshortdesc,
							full_description: req.body.authorfulldesc
						},
						brandName: req.body.authorbrandname,
						email: req.body.authoremail,
						password: req.body.authorpassword,
						authorStatus: req.body.authorstatus,
						authorRole: req.body.authorRole,
						socialmedia: {
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
						// Call the success middleware here
						//handleSuccess(req, res);
					});
					//upload the actual image to s3
					//await s3Client.send(new PutObjectCommand(s3uploadparams));
					controllerUtils.uploadtos3bucket(s3uploadparams);
					res.redirect(authorz.url);
					//res.status(200).json({ "successj": true });

				}
			}
		} else {
			//res.send('The user already exists');
			res.status(200).json({ success: false, message: 'The user already exists' });
		}
	},
];

//On post, send owners data to database
exports.author_ownercreate_post = [
	//multer upload image
	uploadimg.single('photo1'),

	//validate and sanitize the form fields
	body("authorfirstname", "First name is required").trim().isLength({ min:2 }).escape(),
	body("authormiddlename", "Middle name").trim().escape(),
	body("authorlastname", "Last name is required").trim().isLength({ min:2 }).escape(),
	body("authorshortdesc", "Write a short description about you").trim().isLength({ min:2 }).escape(),
	body("authorfulldesc", "Write more about yourself").trim().isLength({ min:2 }).escape(),
	body("authorbrandname", "Enter your brand name").trim().escape(),
	body("authorstatus", "Author status").trim().isLength({ min:2 }).escape(),
	body("authorRole", "Author Role").trim().isLength({ min:2 }).escape(),
	body("githuburl", "Github url").isURL().trim().escape(),
	body("linkeninurl", "Linkedin url").isURL().trim().escape(),
	body("authoremail", "Author email is required").isEmail().trim().escape(),

	async (req, res, next) => {
		try {
			const checkauthors = Author.exists({ authorStatus: 'owner' }, async function(err, available_owner) {
				if (err) {
					res.send("There was an error: while checking for your if the owner portfolio exists");
				} else if (available_owner===null) { 
					const profilepic = "author"+generaterandomimgname();//image name
					//resize the image file
					const filebuffer = await sharp(req.file.buffer).resize({ height: 400, width: 350, fit: "fill"}).toBuffer();
	
					//upload images to S3
					const s3uploadparams = {
						Bucket: BUCKET_NAME,
						Body: filebuffer,
						Key: profilepic,
						ContentType: filebuffer.mimetype
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
							about: {
								short_description: req.body.authorshortdesc,
								full_description: req.body.authorfulldesc
							},
							brandName: req.body.authorbrandname,
							email: req.body.authoremail,
							password: req.body.authorpassword,
							authorStatus: req.body.authorstatus,
							authorRole: req.body.authorRole,
							socialmedia: {
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
						//await controllerUtils.s3Client.send(new PutObjectCommand(s3uploadparams));
						controllerUtils.uploadtos3bucket(s3uploadparams);
						//return res.status(302).location("/portfolio").json({ success: true });
						res.redirect("/portfolio/");
					}
				} else {
					console.log("Owner already exists");
				}
			});	
		} catch (err) {
			console.log("Error in submiting ownwers form");
			console.log(err);
		}
	},
];

//Display author delete form on Get
exports.author_delete_get = (req, res) => {
	res.send("NOT IMPLEMENTED: Author delete get");
}

//On post, delete author
exports.author_delete_post = async (req, res, next) => {
	// Get role from decoded cookie token
	const Role = req.userinfo.role; 
	// If user is not an admin or normal user, return error
	if (Role !== 'admin') {
	  return res.status(403).send({ message: 'Unauthorized User Trying to Login' });
	} else {
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
				controllerUtils.deletefroms3bucket(delparams);
			}	
		});
		res.json({success: "Successfully Deleted"});
	}
}

//On update GET, return information about form
exports.author_update_get = async (req, res, next) => {
	// Get role from decoded cookie token
	const Role = req.userinfo.role; 
	// If user is not an admin or normal user, return error
	if (Role !== 'admin') {
	  return res.status(403).send({ message: 'Unauthorized User Trying to Login' });
	} else {
		//find a document with the specified id
		update_doc_id = req.query.updateid;
		console.log("The id to update is" + update_doc_id);

		const updateauthor = await Author.findOne({ _id: update_doc_id })
		.exec(async function (err, update_author) {
			if (err) {
				return next(err);
			}
			update_author.imageUrl = await controllerUtils.signedurl( BUCKET_NAME, update_author.imageName, 3600 );
			res.json(update_author);
		}); 
	}
}

//On update post, submit the dat to the database 
exports.author_update_post = [
	/* Update data in the database then Delete the exiting image from s3 and add a new path
	 to the bucket. */

	 //multer upload image
	uploadimg.single('photo1'),

	//validate and sanitize the form fields
	body("authorfirstname", "First name is required").trim().isLength({ min:2 }).escape(),
	body("authormiddlename", "Middle name").trim().escape(),
	body("authorlastname", "Last name is required").trim().isLength({ min:2 }).escape(),
	body("authorshortdesc", "Write a short description about you").trim().isLength({ min:2 }).escape(),
	body("authorfulldesc", "Write more about yourself").trim().isLength({ min:2 }).escape(),
	body("authorbrandname", "Enter your brand name").trim().escape(),
	body("authorstatus", "Author status").trim().isLength({ min:2 }).escape(),
	body("authorRole", "Author Role").trim().isLength({ min:2 }).escape(),
	body("githuburl", "Github url").isURL().trim().escape(),
	body("linkeninurl", "Linkedin url").isURL().trim().escape(),
	body("authoremail", "Author email is required").isEmail().trim().escape(),

	

	async (req, res, next) => {
		// Get role from decoded cookie token
		const Role = req.userinfo.role;
		//check for validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) { //if formdata has errors
			console.log("The data has errors");
			console.log(errors);
			//Re-render the project form with errors

		} else {
			// If user is not an admin return error
			if (Role !== 'admin') {
				return res.status(403).send({ message: 'Unauthorized User Trying to Login' });
			} else {
				const update_author_id = req.body.authorUpdateid;
				console.log ("The author update id is"+ update_author_id);
				const upprofilepic = "author"+generaterandomimgname();//image name

				//resize the image file
				const upfilebuffer = await sharp(req.file.buffer).resize({ height: 400, width: 350, fit: "fill"}).toBuffer();
				//upload new image to S3
				const updates3uploadparams = {
					Bucket: BUCKET_NAME,
					Body: upfilebuffer,
					Key: upprofilepic,
					ContentType: upfilebuffer.mimetype
				};

				//1.delete image from s3 bucket
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
						controllerUtils.deletefroms3bucket(delparams);
					}	
				});

				//2.update object in database
				const update_filter = {
					_id: update_author_id 
				};
				const update_authorz = { $set: {
					name: {
						first: req.body.authorfirstname,
						middle: req.body.authormiddlename,
						last: req.body.authorlastname
					},
					about: {
						short_description: req.body.authorshortdesc,
						full_description: req.body.authorfulldesc
					},
					brandName: req.body.authorbrandname,
					email: req.body.authoremail,
					password: req.body.authorpassword,
					authorStatus: req.body.authorstatus,
					authorRole: req.body.authorRole,
					socialmedia: {
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

				//3.upload to s3 bucket
				controllerUtils.uploadtos3bucket(updates3uploadparams);
				console.log("Updated Successfully");
				res.redirect("/portfolio/author");
			}
		}
	},
];
