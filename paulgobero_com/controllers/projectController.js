/* Project MOdel Controller */

const Project = require("../models/project"); //project model
const Author = require("../models/author"); //author model
const createError = require("http-errors");
const crypto = require("crypto"); //generate random names
const { body, validationResult } = require("express-validator"); //form validator
const { storage, fileFilter, uploadimg, uploadvideo, videofileFilter  } = require("../uploads/img_vid_upload"); //multer image upload
const async = require("async"); //run async functions
//s3 file upload
const { BUCKET_NAME } = require('../configs/config');
const controllerUtils = require("../utils/controllerUtils");

//generate random videofile name
const generaterandomvidname = () => {
	const randomvideofilename = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
	const projfilename = randomvideofilename();
	return projfilename
}

let brand

const slugify = (value = "") => value.toLowerCase().trim()
	.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const lines = (value = "") => value.split(/\r?\n/).map(item => item.trim()).filter(Boolean);
const structuredLines = (value = "", keys = []) => lines(value).map(line => {
	const values = line.split("|").map(item => item.trim());
	return keys.reduce((entry, key, index) => {
		if (values[index]) entry[key] = values[index];
		return entry;
	}, {});
}).filter(entry => keys.slice(0, 2).every(key => entry[key]));
const optionalNumber = value => {
	if (value === undefined || value === null || value === "") return undefined;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : undefined;
};
const buildCaseStudyFields = bodyData => ({
	slug: bodyData.projslug ? slugify(bodyData.projslug) : undefined,
	subtitle: bodyData.projsubtitle,
	industry: bodyData.projindustry,
	projectType: bodyData.projtype,
	context: bodyData.projcontext,
	constraints: lines(bodyData.projconstraints),
	architectureSummary: bodyData.projarchitecture,
	architectureDiagramUrl: bodyData.projarchitectureurl,
	decisions: structuredLines(bodyData.projdecisions, ["title", "context", "choice", "tradeoff"]),
	metrics: structuredLines(bodyData.projmetrics, ["value", "label", "evidenceNote"]),
	results: lines(bodyData.projresults),
	lessonsLearned: lines(bodyData.projlessons),
	operationalProof: {
		userCount: optionalNumber(bodyData.projusercount),
		recordCount: optionalNumber(bodyData.projrecordcount),
		operationalSince: bodyData.projoperationalsince || undefined,
		availability: bodyData.projavailability,
		deploymentScale: bodyData.projdeploymentscale
	},
	testimonial: {
		quote: bodyData.projtestimonial,
		person: bodyData.projtestimonialperson,
		role: bodyData.projtestimonialrole,
		organisation: bodyData.projtestimonialorg,
		approvedForPublication: !!bodyData.projtestimonialapproved
	},
	status: bodyData.projstatus || "draft",
	featuredRank: optionalNumber(bodyData.projfeaturedrank),
	confidential: !!bodyData.projconfidential,
	articleUrl: bodyData.projarticle
});
const caseStudyValidators = [
	body("projslug").optional({ checkFalsy: true }).matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
		.withMessage("Slug must contain lowercase letters, numbers and hyphens only"),
	body("projslug").custom((value, { req }) => {
		if (req.body.projstatus === "published" && !value) {
			throw new Error("A slug is required before publishing a case study");
		}
		return true;
	}),
	body("projstatus").optional({ checkFalsy: true }).isIn(["draft", "published", "archived"]),
	body("projfeaturedrank").optional({ checkFalsy: true }).isInt({ min: 1 }),
	body("projusercount").optional({ checkFalsy: true }).isInt({ min: 0 }),
	body("projrecordcount").optional({ checkFalsy: true }).isInt({ min: 0 }),
	body("projoperationalsince").optional({ checkFalsy: true }).isISO8601(),
	body("projarchitectureurl").optional({ checkFalsy: true }).isURL(),
	body("projarticle").optional({ checkFalsy: true }).isURL()
];

//On GET, display project form
exports.project_create_get = async(req, res, next) => {
	try {
		brand = await controllerUtils.getBrandName();
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
				res.render("create_project", { Title: "Project Form", projectauthors: list_authors, brand1: brand });
			});
		}
	} catch {
		console.log("Project Get Error occurred: ", err);
	}	
};

//On POST, submit project formdata to database
exports.project_create_post = [
	//multer upload image and video
	uploadvideo.fields([{ name: 'photo1', maxCount: 1 }, { name: 'video1', maxCount: 1 }]),
	
	//validate and sanitize the form fields
	body("projtitle", "Project title is required").trim().isLength({ min:2 }).escape(),
	body("projsummary", "Project summary is required").trim().isLength({ min:2 }).escape(),
	body("projproblem", "What problem was the project solving?").trim().isLength({ min:2 }).escape(),
	body("projsoln", "What solution did you provide?").trim().isLength({ min:2 }).escape(),
	body("prorole", "Your contribution to this project is required").trim().isLength({ min: 2 }).customSanitizer(value => value.replace(/\r\n/g, '\n')), // normalize newlines
	body("projstartDate").optional({ checkFalsy: true }).isISO8601().toDate().withMessage("Invalid start date format"),
	body("projendDate").optional({ checkFalsy: true }).isISO8601().toDate().withMessage("Invalid end date format"),
	body("checked").optional().toBoolean().isBoolean().withMessage("Invalid value for checked field."),
	body("progithub", "Project Github url").optional({ checkFalsy: true }).isURL(),
	body("prolivelink", "Project live link url").optional({ checkFalsy: true }).isURL(),
	body("proskills.*").escape(),
	body("projspecialisation.*").escape(),
	body("projauthor.*").escape(),
	body("projcontibutor", "Any other authors").optional({ checkFalsy: true }),
	...caseStudyValidators,

	async (req, res, next) => {
		// Get role from decoded cookie token
		const Role = req.userinfo.role; 
		// If user is not an admin or normal user, return error
		if (Role !== 'admin') {
		return res.status(403).send({ message: 'Unauthorized User Trying to Login' });
		} else {
			const projvideoname = "projvid"+generaterandomvidname(); //video name
			const projimagename = "projimg"+generaterandomvidname(); //image name
			const photo = req.files['photo1'][0];
			const video = req.files['video1'][0];

			//s3 bucket video upload parameters
			const s3projvideouploadparams = {
				Bucket: BUCKET_NAME,
				Key: projvideoname,
				Body: video.buffer,
				ContentType: video.mimetype		
			}

			//s3 bucket image upload parameters
			const s3projimageuploadparams = {
				Bucket: BUCKET_NAME,
				Key: projimagename,
				Body: photo.buffer,
				ContentType: photo.mimetype		
			}
			
			//check for validation errors
			const errors = validationResult(req);
			if (!errors.isEmpty()) { //if formdata has errors
				console.log("The data has errors");
				console.log(errors);
				//Re-render the project form with errors


			} else {
				//assign project dates
				const projectDates = {};
				if (req.body.projstartDate) projectDates.startDate = req.body.projstartDate;
				if (req.body.projendDate) projectDates.endDate = req.body.projendDate;
				const isChecked = !!req.body.checked; //converts 'on' to true and 'true' to true
				//if formdata has no errors, submit the video to S3 and formdata to db
				const projz = new Project({
					ptitle: req.body.projtitle,
					psummary: req.body.projsummary,
					problemStatement: req.body.projproblem,
					solution: req.body.projsoln,
					role: req.body.prorole,
					githubUrl: req.body.progithub,
					livelinkUrl: req.body.prolivelink,
					contributor: req.body.projcontibutor,
					skill: req.body.proskills,
					author: req.body.projauthor,
					specialisation: req.body.projspecialisation,
					projectDates, 
					checked: isChecked,
					...buildCaseStudyFields(req.body),
					mediaName: {
						imageName:  projimagename,
						videoName: projvideoname
					}
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
				controllerUtils.uploadtos3bucket(s3projimageuploadparams);
				controllerUtils.uploadtos3bucket(s3projvideouploadparams);
				console.log("uploaded to s3 sucessfully");

				//redirect to individual project page
				//res.redirect(Project.url);
				res.redirect(projz.url);
				
			}
		}
	},	
];

//On GET, display project delete information 
exports.project_delete_get = (req, res, next) => {
	res.send("NOT IMPLEMENTED: Project deletes get");
};

//On post, delete project
exports.project_delete_post = async (req, res, next) => {
	// Get role from decoded cookie token
	const Role = req.userinfo.role; 
	// If user is not an admin or normal user, return error
	if (Role !== 'admin') {
	  return res.status(403).send({ message: 'Unauthorized User: You cannot delete this resource' });
	} else {

		//delete from database
		const id = req.body.projectid
		console.log(id);
		Project.findByIdAndDelete(id, async (err) => {
			if (err){
				return next(err);
			}
		});
		//delete video from s3 bucket
		const delproject = await Project.findOne({_id: id}, 'mediaName').exec((err, delresult) => {
			if (err){
				console.log(err);
			}
			else if (delresult) {
				//console.log("the object to delete is"+delresult.mediaName.videoName);
				const delvidparams = {
					Bucket: BUCKET_NAME,
					Key: delresult.mediaName.videoName
				}
				const delimgparams = {
					Bucket: BUCKET_NAME,
					Key: delresult.mediaName.imageName
				}
				controllerUtils.deletefroms3bucket(delimgparams);
				controllerUtils.deletefroms3bucket(delvidparams);
			}	
		});
		res.json({success: "Successfully Deleted"});
	}
};

//On GET, display project update information
exports.project_update_get = async (req, res, next) => {
	// Get role from decoded cookie token
	const Role = req.userinfo.role; 
	// If user is not an admin or normal user, return error
	if (Role !== 'admin') {
	  return res.status(403).send({ message: 'Unauthorized User Trying to Login' });
	} else {
		//find a document with the specified id
		update_doc_id = req.query.updateid;
		//console.log("The id to update is" + update_doc_id);

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
			//console.log(results);
			//create video and image signed Urls
			results.all_projs.mediaUrl.videoUrl = await controllerUtils.signedurl( BUCKET_NAME, results.all_projs.mediaName.videoName, 3600 );
			results.all_projs.mediaUrl.imageUrl = await controllerUtils.signedurl( BUCKET_NAME, results.all_projs.mediaName.imageName, 3600 );

			res.json(results);
		});
	}
}

//On POST, update project data in database 
exports.project_update_post = [
	/* Update data in the database then Delete the exiting video from s3 and add a new path
	 to the bucket. */

	//multer upload image and video
	uploadvideo.fields([{ name: 'photo1', maxCount: 1 }, { name: 'video1', maxCount: 1 }]),

	//validate and sanitize the form fields
	body("projtitle", "Project title is required").trim().isLength({ min:2 }).escape(),
	body("projsummary", "Project summary is required").trim().isLength({ min:2 }).escape(),
	body("projproblem", "What problem was the project solving?").trim().isLength({ min:2 }).escape(),
	body("projsoln", "What solution did you provide?").trim().isLength({ min:2 }).escape(),
	body("prorole", "Your contribution to this project is required").trim().isLength({ min: 2 }).customSanitizer(value => value.replace(/\r\n/g, '\n')),
	body("projstartDate").optional({ checkFalsy: true }).isISO8601().toDate().withMessage("Invalid start date format"),
	body("projendDate").optional({ checkFalsy: true }).isISO8601().toDate().withMessage("Invalid end date format"),
	body("checked").optional().toBoolean().isBoolean().withMessage("Invalid value for checked field."),
	body("progithub", "Project Github url").optional({ checkFalsy: true }).isURL(),
	body("prolivelink", "Project live link url").optional({ checkFalsy: true }).isURL(),
	body("proskills.*").escape(),
	body("projspecialisation.*").escape(),
	body("projauthor.*").escape(),
	body("projcontibutor", "Any other authors").optional({ checkFalsy: true }),
	...caseStudyValidators,

	async (req, res, next) => {
		// Get role from decoded cookie token
		const Role = req.userinfo.role; 
		// If user is not an admin or normal user, return error
		if (Role !== 'admin') {
		return res.status(403).send({ message: 'Unauthorized User Trying to Login' });
		} else {
			const update_project_id = req.body.projectUpdateid;
			console.log ("The project update id is"+ update_project_id);
			const existingProject = await Project.findById(update_project_id).select("mediaName");
			if (!existingProject) return next(createError(404));

			const updatephoto = req.files?.photo1?.[0];
			const updatevideo = req.files?.video1?.[0];
			const updateprojimagename = updatephoto
				? "projimg"+generaterandomvidname()
				: existingProject.mediaName.imageName;
			const updateprojvideoname = updatevideo
				? "projvid"+generaterandomvidname()
				: existingProject.mediaName.videoName;

			//console.log(req.files);
			//console.log("The body is" );
			//console.log( req.body);
			//console.log(JSON.stringify(req.body));

			//s3 bucket video upload parameters
			const s3projvideouploadparams = updatevideo ? {
				Bucket: BUCKET_NAME,
				Key: updateprojvideoname,
				Body: updatevideo.buffer,
				ContentType: updatevideo.mimetype		
			} : null;

			//s3 bucket image upload parameters
			const s3projimageuploadparams = updatephoto ? {
				Bucket: BUCKET_NAME,
				Key: updateprojimagename,
				Body: updatephoto.buffer,
				ContentType: updatephoto.mimetype		
			} : null;

			//check for validation errors
			const errors = validationResult(req);
			if (!errors.isEmpty()) { //if formdata has errors
				console.log("The data has errors");
				console.log(errors);
				//Re-render the project form with errors


			} else {
				//Upload replacements before changing the database record.
				if (s3projimageuploadparams) {
					await controllerUtils.uploadtos3bucket(s3projimageuploadparams);
				}
				if (s3projvideouploadparams) {
					await controllerUtils.uploadtos3bucket(s3projvideouploadparams);
				}

				//update object in database
				const update_filter = {
					_id: update_project_id 
				};

				//assign project dates
				const projectDates = {};
				if (req.body.projstartDate) projectDates.startDate = req.body.projstartDate;
				if (req.body.projendDate) projectDates.endDate = req.body.projendDate;
				const isChecked = !!req.body.checked
				const update_projectz = { $set: 
					{
						ptitle: req.body.projtitle,
						psummary: req.body.projsummary,
						problemStatement: req.body.projproblem,
						solution: req.body.projsoln,
						role: req.body.prorole,
						githubUrl: req.body.progithub,
						livelinkUrl: req.body.prolivelink,
						contributor: req.body.projcontibutor,
						skill: req.body.proskills,
						author: req.body.projauthor,
						specialisation: req.body.projspecialisation,
						projectDates,
						checked: isChecked,
						...buildCaseStudyFields(req.body),
						mediaName: {
							imageName:  updateprojimagename,
							videoName: updateprojvideoname
						}
					} 
				}
				await Project.findOneAndUpdate(update_filter, update_projectz, {
					new: true,
					upsert: true,
					rawResult: true,
					runValidators: true
				});

				//Remove old media only after the replacement and database update succeed.
				if (updatephoto && existingProject.mediaName.imageName) {
					await controllerUtils.deletefroms3bucket({
						Bucket: BUCKET_NAME,
						Key: existingProject.mediaName.imageName
					});
				}
				if (updatevideo && existingProject.mediaName.videoName) {
					await controllerUtils.deletefroms3bucket({
						Bucket: BUCKET_NAME,
						Key: existingProject.mediaName.videoName
					});
				}
				console.log("Media in S3 updated sucessfully");
			}
			res.redirect("/portfolio/project");
		}
	},
];

//On GET, show individual project
exports.project_detail = async(req, res, next) => {
	try {
		brand = await controllerUtils.getBrandName();
		const detailproject = await Project.findById(req.params.id, {})
		.populate('author', 'name')
		.populate('skill', 'name')
		.populate('specialisation', 'name')
		.exec( async function (err, details_projects) {
			if (err) {
				return next(err);
			}
			details_projects.mediaUrl.videoUrl = await controllerUtils.signedurl( BUCKET_NAME, details_projects.mediaName.videoName, 3600 );
			details_projects.mediaUrl.imageUrl = await controllerUtils.signedurl( BUCKET_NAME, details_projects.mediaName.imageName, 3600 );
			
			//res.json(details_projects);
			res.render( "project_detail", { Title: "Project details", detailprojects: details_projects, brand1: brand });
		});
	} catch {
		console.log("Project Detail Error occurred: ", err);	
	}
	
};

// Display a published, shareable case study.
exports.public_case_study = async (req, res, next) => {
	try {
		brand = await controllerUtils.getBrandName();
		const project = await Project.findOne({
			slug: req.params.slug,
			status: "published"
		})
		.populate("author", "name")
		.populate("skill", "name")
		.populate("specialisation", "name")
		.exec();

		if (!project) return next(createError(404));

		if (project.mediaName?.imageName) {
			project.mediaUrl.imageUrl = await controllerUtils.signedurl(
				BUCKET_NAME, project.mediaName.imageName, 3600
			);
		}
		if (project.mediaName?.videoName) {
			project.mediaUrl.videoUrl = await controllerUtils.signedurl(
				BUCKET_NAME, project.mediaName.videoName, 3600
			);
		}

		const relatedProjects = await Project.find({
			_id: { $ne: project._id },
			status: "published",
			featuredRank: { $ne: null }
		})
		.sort({ featuredRank: 1 })
		.limit(3)
		.select("ptitle slug subtitle")
		.exec();

		return res.render("case_study", {
			Title: `${project.ptitle} | Case Study`,
			project,
			relatedProjects,
			brand1: brand,
			meta_description: project.psummary,
			og_url: `${req.protocol}://${req.get("host")}${project.url}`,
			og_image: project.mediaUrl?.imageUrl,
			current_year: new Date().getFullYear()
		});
	} catch (err) {
		return next(err);
	}
};


//On GET, dispaly all available projects
exports.project_list = async(req, res, next) => {
	try {
		brand = await controllerUtils.getBrandName();
		// Get role from decoded cookie token
		const Role = req.userinfo.role; 
		// If user is not an admin or normal user, return error
		if (Role !== 'admin') {
		return res.status(403).send({ message: 'Unauthorized User Trying to Login' });
		} else {
			const allprojects = await Project.find({}).sort({ createdAt: -1 })
			.populate('author', 'name')
			.populate('skill', 'name')
			.populate('specialisation', 'name')
			.exec( async function (err, list_projects) {
				if (err) {
					return next(err);
				}
				for (let projectz of list_projects) {
					projectz.mediaUrl.videoUrl = await controllerUtils.signedurl( BUCKET_NAME, projectz.mediaName.videoName, 3600 );
					projectz.mediaUrl.imageUrl = await controllerUtils.signedurl( BUCKET_NAME, projectz.mediaName.imageName, 3600 );
				}
				//res.json(list_projects);
				res.render( "project_Admin", { Title: "Admin Project", abtprojects: list_projects, brand1: brand });
			});
		}
	} catch {
		console.log("Project List Error occurred: ", err);
	}	
};
