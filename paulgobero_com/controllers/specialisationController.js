//specialisation model controller
const Specialisation = require("../models/specialisation");
const Author = require("../models/author"); //author model
const async = require("async"); //run async functions
//validate form
const { body, validationResult } = require("express-validator");
const database_connection = require('../configs/loadb');
const controllerUtils = require("../utils/controllerUtils");


let brand

//Display a list of specialisations
exports.specialisation_list = (req, res) => {
	// Get role from decoded cookie token
	const Role = req.userinfo.role; 
	// If user is not an admin or normal user, return error
	if (Role !== 'admin') {
	  return res.status(401).send({ message: 'Unauthorized User Trying to Login' });
	} else {
		res.status(200).send("NOT IMPLEMENTED: Specialisation list");
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
exports.specialisation_delete_post = (req, res) => {
	res.send("NOT IMPLEMENTED: specialisation delete post");
}

//Display specialisation update form on Get
exports.specialisation_update_get = (req, res) => {
	res.send("NOT IMPLEMENTED: specialisation update get");
}

//Display specialisation update form on Post
exports.specialisation_update_post = (req, res) => {
	res.send("NOT IMPLEMENTED: specialisation update post");
}
