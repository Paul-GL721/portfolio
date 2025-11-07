
const Skill = require("../models/skill"); //skill model controller
const Author = require("../models/author"); //author model
const crypto = require("crypto"); //generate random names
const sharp = require("sharp"); //resize images
const { body, validationResult } = require("express-validator"); //form validator
const { storage, fileFilter, uploadimg } = require("../uploads/img_vid_upload"); //multer image upload
const async = require("async"); //run async functions
//s3 file upload
const { BUCKET_NAME } = require('../configs/config');
const controllerUtils = require("../utils/controllerUtils");

//generate random imagefile name
const generaterandomimgname = () => {
	const randomimagefilename = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
	const imgfilename = randomimagefilename();
	return imgfilename
}

let brand

//Display a list of all availabe skills
exports.skill_list = async (req, res, next) => {
	try {
		// Get role from decoded cookie token
		const Role = req.userinfo.role; 
		// If user is not an admin or normal user, return error
		if (Role !== 'admin') {
			return res.status(403).send({ message: 'Unauthorized User For this page' });
		} else {
			brand = await controllerUtils.getBrandName();
			const allskills = await Skill.find({}, "_id name description imageName createdAt")
			.sort({ createdAt: -1 })
			.exec(async function (err, list_skills) {
				if (err) {
					return next(err);
				}
				for (let skills of list_skills) {		
					skills.imageUrl = await controllerUtils.signedurl( BUCKET_NAME, skills.imageName, 3600 );		
				}
				//res.json(list_skills);
				res.render("skills_Admin", { Title: "Admin Skill", abtskills: list_skills, brand1: brand });
			});
		}
	} catch {
		console.log("Skill list Error occurred: ", err);
	}
};

//API for all available skills
exports.project_skill = async (req, res, next) => {
	const allskills = await Skill.find({}, "_id name ")
	.sort({ createdAt: -1 })
	.exec(async function (err, list_skills) {
		if (err) {
			return next(err);
		}
		res.json(list_skills);
	});
};


//Display details of specific skill
exports.skill_detail = async(req, res, next) => {
	try {
		brand = await controllerUtils.getBrandName();
		const detailskill = await Skill.findById(req.params.id, {})
		.exec( async function (err, details_skills) {
			if (err) {
				return next(err);
			}
			details_skills.imageUrl = await controllerUtils.signedurl( BUCKET_NAME, details_skills.imageName, 3600 );
			
			//res.json(details_projects);
			res.render( "skill_detail", { Title: "Skill details", detailskills: details_skills, brand1: brand });
		});
	} catch {
		console.log("Skill Detail Error occurred: ", err);	
	}
	
};


//Display skill create form on Get
exports.skill_create_get = async (req, res, next) => {
	try {
		// Get role from decoded cookie token
		const Role = req.userinfo.role; 
		// If user is not an admin or normal user, return error
		if (Role !== 'admin') {
			return res.status(403).send({ message: 'Unauthorized User For this page' });
		} else {
			brand = await controllerUtils.getBrandName();
			res.render("create_skill", { Title: "Create Skill", brand1: brand }); 
		}
	} catch {
		console.log("Skill Get Error occurred: ", err);

	}
};


//Post skill form entries into the database and show form if there're errors.
exports.skill_create_post = [
	//validate and sanitize the form fields
	uploadimg.single('photo1'),
	body("skillname", "Skill name required").trim().isLength({ min:2 }).escape(),
	body("skilldescription", "Please write a brief a description").trim().isLength({ min:5 }).escape(),
		
	//process request after validation 
	async (req, res, next) => {
		const Role = req.userinfo.role; 
		// If user is not an admin or normal user, return error
		if (Role !== 'admin') {
			return res.status(403).send({ message: 'Unauthorized User For this page' });
		} else {
			//extract validation errors from a request
			const errors = validationResult(req);
			
			//resize the image file
			const filebuffer = await sharp(req.file.buffer).resize({ height: 1920, width: 1080, fit: "fill"}).toBuffer();

			const createimgfilename = generaterandomimgname();
			//upload images to S3
			const s3uploadparams = {
				Bucket: BUCKET_NAME,
				Body: filebuffer,
				Key: createimgfilename ,
				ContentType: filebuffer.mimetype
			}
			
			//create an object with trimed and escaped values
			const skillz = new Skill({
				name: req.body.skillname,
				description: req.body.skilldescription,
				imageName: createimgfilename 
			});

			if (!errors.isEmpty()) {
				console.log("There errors");
				console.log(errors);
				//if there errors, render the form with sanitized values/error messages
				res.render("create_skill", {
					Title: "Create Skill",
					skillz,
					errors: errors.array()
				});
				return;
			} else {
				//if data from the form is valid
				//check that same name doesnot already exist
				Skill.findOne({ name: req.body.skillname }).exec((err, found_name) => {
					if (err) {
						console.log(err);
						return next(err);
					}

					if (found_name) {
						res.redirect(found_name.url);
					} else {
						skillz.save((err) => {
							if (err) {
								return next(err);
							}
							console.log("Saved successfully");
						});
						//send the upload to s3
						controllerUtils.uploadtos3bucket(s3uploadparams);
						res.redirect(skillz.url);
					}
				});
			}
		}
	},
];


//Display skill delete form on Get
exports.skill_delete_get = (req, res) => {
	res.send("NOT IMPLEMENTED: skill delete get");
}


//With post delete skill
exports.skill_delete_post = async (req, res, next) => {
	const Role = req.userinfo.role; 
	// If user is not an admin or normal user, return error
	if (Role !== 'admin') {
		return res.status(403).send({ message: 'Unauthorized User For this page' });
	} else {
		//delete from database
		const id = req.body.skilid
		Skill.findByIdAndDelete(id, (err) => {
			if (err){
				return next(err);
			}
		});
		//delete from s3 bucket
		const delskill = await Skill.findOne({_id: id}, 'imageName').exec((err, delresult) => {
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

//Using GET, return information on a skill to update
exports.skill_update_get = async (req, res, next) => {
	const Role = req.userinfo.role; 
	// If user is not an admin or normal user, return error
	if (Role !== 'admin') {
		return res.status(403).send({ message: 'Unauthorized User For this page' });
	} else {
		//find a document with the specified id
		update_doc_id = req.query.updateid;
		console.log("The id to update is" + update_doc_id);

		const updateskills = await Skill.findOne({ _id: update_doc_id }, "_id name description imageName ")
		.exec(async function (err, update_skill) {
			if (err) {
				return next(err);
			}
			update_skill.imageUrl = await controllerUtils.signedurl( BUCKET_NAME, update_skill.imageName, 3600 );
			res.json(update_skill);
		});
	}
}

//On post update skill information 
exports.skill_update_post = [
	/* Delete the exiting image from s3 and add a new path
	 to the bucket, then update data in the database */

	//upload image using multer
	uploadimg.single('photo1'),

	//process request after validation 
	async (req, res, next) => {
		const Role = req.userinfo.role; 
		// If user is not an admin or normal user, return error
		if (Role !== 'admin') {
			return res.status(403).send({ message: 'Unauthorized User For this page' });
		} else {
			const update_skil_id = req.body.skillUpdateid;
			const updateimgfilename = generaterandomimgname();
			
			//resize the image file
			const upfilebuffer = await sharp(req.file.buffer).resize({ height: 1920, width: 1080, fit: "fill"}).toBuffer();

			//1. delete from s3 bucket
			const delupskill = await Skill.findOne({_id: update_skil_id }, 'imageName').exec((err, upresult) => {
				if (err){
					console.log(err);
				}
				else if (upresult) {
					console.log("the object to delete is"+upresult.imageName);
					const delparams = {
						Bucket: BUCKET_NAME,
						Key: upresult.imageName
					}
					controllerUtils.deletefroms3bucket(delparams);
				}	
			});

			//2. update object in database
			const update_filter = {
				_id: update_skil_id 
			};
			const update_skillz = { $set: {
				name: req.body.skillname,
				description: req.body.skilldescription,
				imageName: updateimgfilename
			}};
			await Skill.findOneAndUpdate(update_filter, update_skillz, {
				new: true,
				upsert: true,
				rawResult: true,
				runValidators: true
			});

			//3.upload to s3 bucket
			//upload new image to s3Bucket
			const updates3uploadparams = {
				Bucket: BUCKET_NAME,
				Body: upfilebuffer,
				Key: updateimgfilename 
			}
			controllerUtils.uploadtos3bucket(updates3uploadparams);
			console.log("Updated Successfully");
			res.redirect("/portfolio/skill");
		}
	},
];