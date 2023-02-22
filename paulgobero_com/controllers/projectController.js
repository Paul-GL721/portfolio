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
	const vidfilename = randomvideofilename();
	return vidfilename
}

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

	//validate and sanitize the form fields
	body("projtitle", "Project title is required").trim().isLength({ min:2 }).escape(),
	body("projsummary", "Project summary is required").trim().isLength({ min:2 }).escape(),
	body("projproblem", "What problem was the project solving?").trim().isLength({ min:2 }).escape(),
	body("projsoln", "What solution did you provide?").trim().isLength({ min:2 }).escape(),
	body("prorole", "Your contribution to this project is required").trim().isLength({ min:2 }).escape(),
	body("progithub", "Project Github url").isURL().trim().escape(),
	body("proskills", "Name the skills you gained in this project").trim().isLength({ min:2 }).escape(),
	body("projspecialisation", "Specialisation you gained in this project").trim().isLength({ min:2 }).escape(),
	body("projauthor", "Choose the project authors").trim().isLength({ min:2 }).escape(),
	body("projcontibutor", "Any other authors").trim().escape(),

	async (req, res, next) => {
		const projvideoname = "projvid"+generaterandomvidname(); //video name

		//s3 bucket
		const s3uploadparams = {
			Bucket: BUCKET_NAME,
			Body: req.body.buffer,
			Key: projvideoname
		}

		//check validation errors
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
			res.redirect(Project.url);
		}
	},
];

//On GET, display project delete information 
exports.project_delete_get = (req, res, next) => {
	res.send("NOT IMPLEMENTED: Project deletes get");
};

//On POST, delete data from database
exports.project_delete_post = (req, res, next) => {
	res.send("NOT IMPLEMENTED: Project deletes post");
};

//On GET, display project update information
exports.project_update_get = (req, res, next) => {
	res.send("NOT IMPLEMENTED: Project updates get");
};

//On POST, update project data in database
exports.project_update_post = (req, res, next) => {
	res.send("NOT IMPLEMENTED: Project updates post");
};

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