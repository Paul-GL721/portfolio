//specialisation model controller
const Specialisation = require("../models/specialisation");
const Author = require("../models/author"); //author model
const async = require("async"); //run async functions
//validate form
const { body, validationResult } = require("express-validator");
const database_connection = require('../configs/loadb');
const controllerUtils = require("../utils/controllerUtils");
const specialisation = require("../models/specialisation");


let brand

//Display a list of specialisations
exports.specialisation_list = async (req, res, next) => {
	try {
		brand = await controllerUtils.getBrandName();
		// Get role from decoded cookie token
		const Role = req.userinfo.role; 
		// If user is not an admin or normal user, return error
		if (Role !== 'admin') {
		return res.status(403).send({ message: 'Unauthorized User Trying to Login' });
		} else {
			const allspecs = await Specialisation.find({}).sort({ createdAt: -1 })
			.exec( async function (err, list_specs) {
				if (err) {
					return next(err);
				}
				//res.json(list_specs);
				res.render("specialisation_Admin", { Title: "Admin Specialisation", abtspecs: list_specs, brand1: brand });
			});	
		}
	} catch (err) {
		console.log("There was an error rendering the specialisation admin");
		console.log(err);
	}
};

//API for all available specialisations
exports.project_specialisations = async (req, res, next) => {
	const allspecs = await Specialisation.find({}, "_id name ")
	.sort({ createdAt: -1 })
	.exec(async function (err, list_specs) {
		if (err) {
			return next(err);
		}
		res.json(list_specs);
	});
};

//Display details of specific specialisation
exports.specialisation_detail = (req, res) => {
	res.send(`NOT IMPLEMENTED: specialisation details: ${req.params.id}`);
}

//Display specialisation create form on Get
exports.specialisation_create_get = async (req, res, next) => { 
	try {
		brand = await controllerUtils.getBrandName();
		// Get role from decoded cookie token
		const Role = req.userinfo.role;
		// If user is not an admin or normal user, return error
		if (Role !== 'admin') {
			return res.status(403).send({ message: 'Unauthorized User Trying to Login' });
		} else {
			res.render("create_specialisation", { Title: "Create Specialisation", brand1: brand });
		}
	} catch {
		console.log("There was an error in the brand name");
		console.log(err);
	}
};

//Display specialisation create form on Post
exports.specialisation_create_post = [
	//validate and sanitize the form fields
	body("specialisationname", "Specialisation name required").trim().isLength({ min:2 }).escape(),
	body("specialisationdescription", "Please write a brief a description").trim().isLength({ min:5 }).escape(),

	//process request after validation 
	async (req, res, next) => {
		// Get role from decoded cookie token
		const Role = req.userinfo.role;
		// If user is not an admin or normal user, return error
		if (Role !== 'admin') {
			//return res.status(403).send({ message: 'Unauthorized User Trying to Login' });
			return res.status(403).json({ message: 'You are unauthorised for this resource' });
		} else {
			//extract validation errors from a request
			const errors = validationResult(req);
			
			//create an object with trimed and escaped values
			const spec = new Specialisation({
				name: req.body.specialisationname,
				description: req.body.specialisationdescription
			});
			console.log('specialisation is', spec);

			if (!errors.isEmpty()) {
				//if there errors, render the form with sanitized values/error messages
				res.render("create_specialisation", {
					Title: "Create Specialisation",
					spec,
					errors: errors.array(),
				});
				return;
			} else {
				//if data from the form is valid
				//check that same name doesnot already exist
				Specialisation.findOne({ name: req.body.specialisationname }).exec((err, found_name) => {
					if (err) {
						return next(err);
					}
					if (found_name) {
						console.log('The Spec name was already uploaded', found_name)
						res.redirect(found_name.url);
					} else {
						spec.save((err) => {
							if (err) {
								return next(err);
							}
							res.redirect(spec.url);
						});
					}
				});

			}
		}

	},

];



//Display specialisation delete form on Get
exports.specialisation_delete_get = (req, res) => {
	res.send("NOT IMPLEMENTED: specialisation delete get");
}

//Display specialisation delete form on Post
exports.specialisation_delete_post = async (req, res, next) => {
	// Get role from decoded cookie token
	const Role = req.userinfo.role; 
	// If user is not an admin or normal user, return error
	if (Role !== 'admin') {
	  return res.status(403).send({ message: 'Unauthorized User Trying to Login' });
	} else {
		//delete from database
		const id = req.body.specid
		Specialisation.findByIdAndDelete(id, (err) => {
			if (err){
				return next(err);
			}
		});
		res.json({success: "Successfully Deleted"});
	}
}

//Display specialisation update form on Get
exports.specialisation_update_get = async (req, res, next) => {
	// Get role from decoded cookie token
	const Role = req.userinfo.role; 
	// If user is not an admin or normal user, return error
	if (Role !== 'admin') {
	  return res.status(403).send({ message: 'Unauthorized User Trying to Login' });
	} else {
		//find a document with the specified id
		update_doc_id = req.query.updateid;
		console.log("The spec id to update is" + update_doc_id);

		const updatespec = await Specialisation.findOne({ _id: update_doc_id })
		.exec(async function (err, update_specialisation) {
			if (err) {
				return next(err);
			}
			res.json(update_specialisation);
		}); 
	}
}

//Display specialisation update form on Post
exports.specialisation_update_post = [
	//validate and sanitize the form fields
	body("specialisationname", "Specialisation name required").trim().isLength({ min:2 }).escape(),
	body("specialisationdescription", "Please write a brief a description").trim().isLength({ min:5 }).escape(),

	//process request after validation 
	async (req, res, next) => {
		// Get role from decoded cookie token
		const Role = req.userinfo.role;
		// If user is not an admin or normal user, return error
		if (Role !== 'admin') {
			//return res.status(403).send({ message: 'Unauthorized User Trying to Login' });
			return res.status(403).json({ message: 'You are unauthorised for this resource' });
		} else {
			//extract validation errors from a request
			const errors = validationResult(req);
			
			if (!errors.isEmpty()) {
				//if there errors, render the form with sanitized values/error messages
				res.render("create_specialisation", {
					Title: "Create Specialisation",
					spec,
					errors: errors.array(),
				});
				return;
			} else {
				//get the id of the document to update
				const update_spec_id = req.body.specUpdateid;
				//update object in database
				const update_filter = {
					_id: update_spec_id  
				};

				const update_specs = { $set: {
					name: req.body.specialisationname,
					description: req.body.specialisationdescription
					} 
				}
				await Specialisation.findOneAndUpdate(update_filter, update_specs, {
					new: true,
					upsert: true,
					rawResult: true,
					runValidators: true
				});

				console.log("Updated the specialistion Successfully");
				res.redirect("/portfolio/specialisation");
			}
		}
	},
];
