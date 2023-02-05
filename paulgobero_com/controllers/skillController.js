
const Skill = require("../models/skill"); //skill model controller
const crypto = require("crypto"); //generate random names
const sharp = require("sharp"); //resize images

//s3 file upload
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { BUCKET_NAME, BUCKET_REGION, ACCESS_KEY, SECRET_ACCESS_KEY } = require('../configs/config');

const { body, validationResult } = require("express-validator"); //form validator
const { storage, fileFilter, uploadimg } = require("../uploads/img_vid_upload"); //multer image upload
const async = require("async"); //run async functions
const skill = require("../models/skill");

const s3Client = new S3Client({
	region: BUCKET_REGION,
	credentials: {
		accessKeyId: ACCESS_KEY,
		secretAccessKey: SECRET_ACCESS_KEY
	}
});

//generate random imagefile name
const randomimagefilename = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
const imgfilename = randomimagefilename();

//Display a list of availabe skills
exports.skill_list = async (req, res, next) => {
	const allskills = await Skill.find({}, "_id name description imageName createdAt")
	.sort({ createdAt: -1 })
	.exec(async function (err, list_skills) {
		if (err) {
			return next(err);
		}
		for (let skills of list_skills) {		
			skills.imageUrl = await  getSignedUrl(s3Client, new GetObjectCommand({
				Bucket: BUCKET_NAME,
				Key: imgfilename
			}), { expiresIn: 3600})			
		}
		//res.json(list_skills);
		res.render("skills_Admin", { Title: "Admin Skill", abtskills: list_skills });
	});
	
};

//Display details of specific skill
exports.skill_detail = (req, res) => {
	res.send(`NOT IMPLEMENTED: skill details: ${req.params.id}`);
}

//Display skill create form on Get
exports.skill_create_get = (req, res, next) => { 
	res.render("create_skill", { Title: "Create Skill" });
};

//Post skill form entries into the database and show form if there're errors.
exports.skill_create_post = [
	//validate and sanitize the form fields
	uploadimg.single('photo1'),
	body("skillname", "Skill name required").trim().isLength({ min:2 }).escape(),
	body("skilldescription", "Please write a brief a description").trim().isLength({ min:5 }).escape(),
		
	//process request after validation 
	async (req, res, next) => {
		//extract validation errors from a request
		const errors = validationResult(req);
		
		//resize the image file
		const filebuffer = await sharp(req.file.buffer).resize({ height: 1920, width: 1080, fit: "fill"}).toBuffer();

		//upload images to S3
		const s3uploadparams = {
			Bucket: BUCKET_NAME,
			Body: filebuffer,
			Key: imgfilename
		}

		//send the upload to s3
		await s3Client.send(new PutObjectCommand(s3uploadparams));
		
		//create an object with trimed and escaped values
		const skillz = new Skill({
			name: req.body.skillname,
			description: req.body.skilldescription,
			imageName: imgfilename
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
						res.redirect(skillz.url);
						
					});
				}
			});
		}
	},
];

//Display skill delete form on Get
exports.skill_delete_get = (req, res) => {
	res.send("NOT IMPLEMENTED: skill delete get");
}

//Display skill delete form on Post
exports.skill_delete_post = async (req, res) => {

	//delete from database
	const id = req.body.skilid
	console.log("The id to delete is" + id);
	Skill.findByIdAndDelete(id, (err) => {
		if (err){
			return next(err);
		}
		//if successful show the list of skills
		//res.redirect("skillz.url")
		//res.send("NOT IMPLEMENTED: skill delete post");
	});
	//delete from s3 bucket
	const delskill = await Skill.findOne({where: {id}});
	const delparams = {
		Bucket: BUCKET_NAME,
		Key: delskill.imageName
	}
	await s3Client.send(new DeleteObjectCommand(delparams));
	res.send("NOT IMPLEMENTED: skill delete post");
}

//Display skill update form on Get
exports.skill_update_get = async (req, res, next) => {
	//find a document with the specified id
	update_doc_id = req.body.updateid;
	console.log("The id to update is" + update_doc_id);

	const updateskills = await Skill.findOne({ _id: update_doc_id }, "_id name description imageName ")
	.exec(async function (err, update_skill) {
		if (err) {
			return next(err);
		}
		for (let skills of update_skill) {		
			skills.imageUrl = await  getSignedUrl(s3Client, new GetObjectCommand({
				Bucket: BUCKET_NAME,
				Key: imgfilename
			}), { expiresIn: 3600})			
		}
		res.json(update_skill);
		//res.render("skills_Admin", { Title: "Admin Skill", abtskills: list_skills });
	});
}

//Display skill update form on Post
exports.skill_update_post = (req, res) => {
	res.send("NOT IMPLEMENTED: skill update post");
}
