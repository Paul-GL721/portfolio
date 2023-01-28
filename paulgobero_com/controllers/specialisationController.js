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
exports.specialisation_create_get = (req, res, next) => { 
	res.render("create_specialisation", { Title: "Create Specialisation" });
};

//Display specialisation create form on Post
exports.specialisation_create_post = [
	//validate and sanitize the form fields
	body("specialisationname", "Specialisation name required").trim().isLength({ min:2 }).escape(),
	body("specialisationdescription", "Please write a brief a description").trim().isLength({ min:5 }).escape(),

	//process request after validation 
	(req, res, next) => {
		//extract validation errors from a request
		const errors = validationResult(req);
		
		//create an object with trimed and escaped values
		const spec = new Specialisation({
			name: req.body.specialisationname,
			description: req.body.specialisationdescription
		});

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
