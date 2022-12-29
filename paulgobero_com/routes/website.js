/*........ ROUTES FOR THE MAIN WEBSITE.....................*/

const express = require("express");
const router = express.Router();

//Require controller modules
const author_controller = require("../controllers/authorController");

				//........AUTHOR ROUTES.....//
//Get website home page
router.get("/", author_controller.index);

//Get request for creating author
router.get("/author/create", author_controller.author_create_get);

//Post request for creating author
router.post("/author/create", author_controller.author_create_post);

//Get request for deleting author
router.get("/author/:id/delete", author_controller.author_delete_get);

//Post request for deleting author
router.post("/author/:id/delete", author_controller.author_delete_post);

//Get request for updating author
router.get("/author/:id/update", author_controller.author_update_get);

//Post request for updating author
router.post("/author/:id/update", author_controller.author_update_post);

//Get request for one author
router.get("/author/:id", author_controller.author_detail);

//Get request for all authors
router.get("/author", author_controller.author_list);

				//........PROJECT ROUTES.....//
				//........BLOG ROUTES.....//
				//........SPECILISATION ROUTES.....//
				//........SKILLS ROUTES.....//

module.exports = router;
