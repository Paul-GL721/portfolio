/* Project MOdel Controller */

const Project = require("../models/project"); //project model
const Author = require("../models/author"); //author model
const crypto = require("crypto"); //generate random names
const { body, validationResult } = require("express-validator"); //form validator
const { storage, fileFilter, uploadimg, uploadvideo, videofileFilter  } = require("../uploads/img_vid_upload"); //multer image upload
const async = require("async"); //run async functions
//s3 file upload
const {  S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { BUCKET_NAME, BUCKET_REGION, ACCESS_KEY, SECRET_ACCESS_KEY } = require('../configs/config');
const project = require("../models/project");
const { stringify } = require("querystring");

//s3 bucket connection parameters
const s3Client = new S3Client({
	region: BUCKET_REGION,
	credentials: {
		accessKeyId: ACCESS_KEY,
		secretAccessKey: SECRET_ACCESS_KEY
	}
});

//generate random videofile name
const generaterandomvidname = () => {
	const randomvideofilename = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
	const projfilename = randomvideofilename();
	return projfilename
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

//On GET, display project form
exports.project_create_get = async(req, res, next) => {
	const allauthors = await Author.find({}, "_id name ")
	.sort({ createdAt: -1 })
	.exec(async function (err, list_authors) {
		if (err) {
			return next(err);
		}
		res.render("create_project", { Title: "Project Form", projectauthors: list_authors });
	});
};

//On POST, submit project formdata to database
exports.project_create_post = [
	//upload single video
	uploadvideo.single('video1'),
	//multer upload image
	uploadimg.single('photo1'),

	//validate and sanitize the form fields
	body("projtitle", "Project title is required").trim().isLength({ min:2 }).escape(),
	body("projsummary", "Project summary is required").trim().isLength({ min:2 }).escape(),
	body("projproblem", "What problem was the project solving?").trim().isLength({ min:2 }).escape(),
	body("projsoln", "What solution did you provide?").trim().isLength({ min:2 }).escape(),
	body("prorole", "Your contribution to this project is required").trim().isLength({ min:2 }).escape(),
	body("progithub", "Project Github url").isURL().trim().escape(),
	body("proskills.*").escape(),
	body("projspecialisation.*").escape(),
	body("projauthor.*").escape(),
	body("projcontibutor", "Any other authors").trim().escape(),

	async (req, res, next) => {
		const projvideoname = "projvid"+generaterandomvidname(); //video name
		const projimagename = "projimg"+generaterandomvidname(); //image name
		console.log(req.file.buffer);
		console.log(req.file);
		//console.log("The body is" );
		//console.log( req.body);
		//console.log(JSON.stringify(req.body));

		
		//s3 bucket parameters
		const s3uploadparams = {
			Bucket: BUCKET_NAME,
			Key: projvideoname,
			Body: req.file.buffer,
			ContentType: req.file.mimetype		
		}
		
		//check for validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) { //if formdata has errors
			console.log("The data has errors");
			console.log(errors);
			//Re-render the project form with errors


		} else {
			//if formdata has no errors, submit the video to S3 and formdata to db
			const projz = new Project({
				ptitle: req.body.projtitle,
				psummary: req.body.projsummary,
				problemStatement: req.body.projproblem,
				solution: req.body.projsoln,
				role: req.body.prorole,
				githubUrl: req.body.progithub,
				contributor: req.body.projcontibutor,
				skill: req.body.proskills,
				author: req.body.projauthor,
				specialisation: req.body.projspecialisation,
				videoName: projvideoname
			});

			//save the project object to database
			projz.save( (err) => {
				if (err) {
					console.log("Errors in saving project object");
					return next(err);
				}
				console.log("Successfully saved to database");
			});
			
			//upload to s3 bucket
			await s3Client.send(new PutObjectCommand(s3uploadparams));
			console.log("uploaded to s3 sucessfully");

			//redirect to individual project page
			res.redirect(Project.url); 
		}
	},	
];

//On GET, display project delete information 
exports.project_delete_get = (req, res, next) => {
	res.send("NOT IMPLEMENTED: Project deletes get");
};

//On post, delete project
exports.project_delete_post = async (req, res, next) => {

	//delete from database
	const id = req.body.projectid
	console.log(id);
	Project.findByIdAndDelete(id, async (err) => {
		if (err){
			return next(err);
		}
	});
	//delete video from s3 bucket
	const delproject = await Project.findOne({_id: id}, 'videoName').exec((err, delresult) => {
		if (err){
			console.log(err);
		}
		else if (delresult) {
			console.log("the object to delete is"+delresult.videoName);
			const delparams = {
				Bucket: BUCKET_NAME,
				Key: delresult.videoName
			}
			deletefroms3bucket(delparams);
		}	
	});
	res.json({sucess: "Successfully Deleted"});
};

//On GET, display project update information
exports.project_update_get = async (req, res, next) => {
	//find a document with the specified id
	update_doc_id = req.query.updateid;
	console.log("The id to update is" + update_doc_id);

	//return all authors and projects in the same object
	async.parallel({
		authorzproj: function(callback){
			Author.find({}, "_id name ").sort({ createdAt: -1 }).exec(callback);
		},
		all_projs: function(callback){
			Project.findOne({ _id: update_doc_id }).exec(callback);
		}
	}, async function(err, results){
		if (err) {
			return next(err);
        }
		console.log(results);
		results.all_projs.videoUrl = await  getSignedUrl(s3Client, new GetObjectCommand({
			Bucket: BUCKET_NAME,
			Key: results.all_projs.videoName
		}), { expiresIn: 3600})

		res.json(results);
	});
}

//On POST, update project data in database 
exports.project_update_post = [
	/* Update data in the database then Delete the exiting video from s3 and add a new path
	 to the bucket. */

	//upload single video
	uploadvideo.single('video1'),

	//validate and sanitize the form fields
	body("projtitle", "Project title is required").trim().isLength({ min:2 }).escape(),
	body("projsummary", "Project summary is required").trim().isLength({ min:2 }).escape(),
	body("projproblem", "What problem was the project solving?").trim().isLength({ min:2 }).escape(),
	body("projsoln", "What solution did you provide?").trim().isLength({ min:2 }).escape(),
	body("prorole", "Your contribution to this project is required").trim().isLength({ min:2 }).escape(),
	body("progithub", "Project Github url").isURL().trim().escape(),
	body("proskills.*").escape(),
	body("projspecialisation.*").escape(),
	body("projauthor.*").escape(),
	body("projcontibutor", "Any other authors").trim().escape(),

	async (req, res, next) => {
		const update_project_id = req.body.projectUpdateid;
		console.log ("The project update id is"+ update_project_id);
		const projvideoname = "projvid"+generaterandomvidname(); //video name

		//console.log(req.file.buffer);
		console.log(req.file);
		console.log("The body is" );
		console.log( req.body);

		//check for validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) { //if formdata has errors
			console.log("The data has errors");
			console.log(errors);
			//Re-render the project form with errors


		} else {
			//update object in database
			const update_filter = {
				_id: update_project_id 
			};

			const update_projectz = { $set: {
					ptitle: req.body.projtitle,
					psummary: req.body.projsummary,
					problemStatement: req.body.projproblem,
					solution: req.body.projsoln,
					role: req.body.prorole,
					githubUrl: req.body.progithub,
					contributor: req.body.projcontibutor,
					skill: req.body.proskills,
					author: req.body.projauthor,
					specialisation: req.body.projspecialisation,
					videoName: projvideoname
				} 
			}

			await Project.findOneAndUpdate(update_filter, update_projectz, {
				new: true,
				upsert: true,
				rawResult: true,
				runValidators: true
			});

			//delete video from s3 bucket
			const delproject = await Project.findOne({_id: update_project_id}, 'videoName').exec((err, delresult) => {
				if (err){
					console.log(err);
				}
				else if (delresult) {
					console.log("the object to delete is"+delresult.videoName);
					const delparams = {
						Bucket: BUCKET_NAME,
						Key: delresult.videoName
					}
					deletefroms3bucket(delparams);
				}	
			});

			//s3 bucket parameters
			const vidpdates3uploadparams = {
				Bucket: BUCKET_NAME,
				Key: projvideoname,
				Body: req.file.buffer,
				ContentType: req.file.mimetype		
			}
			//upload to s3 bucket
			await s3Client.send(new PutObjectCommand(vidpdates3uploadparams));
			console.log("Video in S3 updated sucessfully");
			res.redirect("/website/project");
		}
	},
];

//On GET, show individual project
exports.project_detail = (req, res, next) => {
	res.send(`NOT IMPLEMENTED: Project details: ${req.params.id}`);
};

//On GET, dispaly all available projects
exports.project_list = async(req, res, next) => {
	const allprojects = await Project.find({}).sort({ createdAt: -1 })
	.populate('author', 'name')
	.populate('skill', 'name')
	.populate('specialisation', 'name')
	.exec( async function (err, list_projects) {
		if (err) {
			return next(err);
		}
		for (let projectz of list_projects) {
			projectz.videoUrl = await getSignedUrl(s3Client, new GetObjectCommand({
				Bucket: BUCKET_NAME,
				Key: projectz.videoName
			}), { expiresIn: 3600 })
		}
		//res.json(list_projects);
		res.render( "project_Admin", { Title: "Admin Project", abtprojects: list_projects });
	});
};