/* Project MOdel Controller */

const Project = require("../models/project"); //project model



//On GET, display project form
exports.project_create_get = (req, res, next) => {
	res.render("create_project", { Title: "Project Form" });
};

//On POST, submit project formdata to database
exports.project_create_post = (req, res, next) => {
	res.send("NOT IMPLEMENTED: Project create post");
};

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

//On GET, dispaly all available projects4
exports.project_list = (req, res, next) => {
	res.send("NOT IMPLEMENTED: Project display list on get");
};