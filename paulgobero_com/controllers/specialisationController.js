//specialisation model controller
const Specialisation = require("../models/specialisation");

//validate form
const { body, validationResult } = require("express-validator");

//Display a list of specialisations
exports.specialisation_list = (req, res) => {
	res.send("NOT IMPLEMENTED: Specialisation list");
};

//Display details of specific specialisation
exports.specialisation_detail = (req, res) => {
	res.send(`NOT IMPLEMENTED: specialisation details: ${req.params.id}`);
}

//Display specialisation create form on Get
exports.specialisation_create_get = (req, res) => { 
	res.render("create_specialisation");
}

//Display specialisation create form on Post
exports.specialisation_create_post = [
	//validate and sanitize the form fields
	body("specialisationname", "Specialisation name required").trim().isLength({ min:2 }).escape(),
	body("specialisationdescription", "Please write a brief a description").trim().isLength({ min:5 }).escape(),

	//process request after validation 
	(req, res, next) => {
		//extract validation errors from a request
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			//if there errors, render the form with sanitized values/error messages
			res.render("create_specialisation", {
				spec: req.body,
				errors: errors.array(),
			});
			return;
		}
		//if data from the form is valid
		//create and save the object
		const spec = new Specialisation({
			name: req.body.specialisationname,
			description: req.body.specialisationdescription
		});
		console.log(spec);
		spec.save((err) => {
			if (err) {
				return next(err);
			}
			//successful, redirect to new record
			res.redirect(spec.url);
		});

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
