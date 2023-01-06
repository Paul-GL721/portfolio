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
	res.send("NOT IMPLEMENTED: specialisation create get");
}

//Display specialisation create form on Post
exports.specialisation_create_post = (req, res) => {
	res.send("NOT IMPLEMENTED: specialisation create post");
}

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
