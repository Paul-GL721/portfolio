//author model controller

const Author = require("../models/author");

//Display home website page
exports.index = (req, res, next) => {
	res.render("website_index", { Title: "Portfolio"});
};

//Display a list of authors
exports.author_list = (req, res) => {
	res.send("NOT IMPLEMENTED: Author list");
};

//Display details of specific author
exports.author_detail = (req, res) => {
	res.send(`NOT IMPLEMENTED: Author details: ${req.params.id}`);
}

//Display author create form on Get
exports.author_create_get = (req, res) => {
	res.send("NOT IMPLEMENTED: Author create get");
}

//Display author create form on Post
exports.author_create_post = (req, res) => {
	res.send("NOT IMPLEMENTED: Author create post");
}

//Display author delete form on Get
exports.author_delete_get = (req, res) => {
	res.send("NOT IMPLEMENTED: Author delete get");
}

//Display author delete form on Post
exports.author_delete_post = (req, res) => {
	res.send("NOT IMPLEMENTED: Author delete post");
}

//Display author update form on Get
exports.author_update_get = (req, res) => {
	res.send("NOT IMPLEMENTED: Author update get");
}

//Display author update form on Post
exports.author_update_post = (req, res) => {
	res.send("NOT IMPLEMENTED: Author update post");
}
