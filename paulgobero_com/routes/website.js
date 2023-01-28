/*........ ROUTES FOR THE MAIN WEBSITE.....................*/

const express = require("express");
const router = express.Router();

//Require controller modules
const author_controller = require("../controllers/authorController");
const specialisation_controller = require("../controllers/specialisationController");
const skill_controller = require("../controllers/skillController");

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
//Get request for creating specialisation
router.get("/specialisation/create", specialisation_controller.specialisation_create_get);

//Post request for creating specialisation
router.post("/specialisation/create", specialisation_controller.specialisation_create_post);

//Get request for deleting specialisation
router.get("/specialisation/:id/delete", specialisation_controller.specialisation_delete_get);

//Post request for deleting specialisation
router.post("/specialisation/:id/delete", specialisation_controller.specialisation_delete_post);

//Get request for updating specialisation
router.get("/specialisation/:id/update", specialisation_controller.specialisation_update_get);

//Post request for updating specialisation
router.post("/specialisation/:id/update", specialisation_controller.specialisation_update_post);

//Get request for one specialisation
router.get("/specialisation/:id", specialisation_controller.specialisation_detail);

//Get request for all specialisations
router.get("/specialisation", specialisation_controller.specialisation_list);


				//........SKILLS ROUTES.....//
//Get request for creating skill
router.get("/skill/create", skill_controller.skill_create_get);

//Post request for creating skill
router.post("/skill/create", skill_controller.skill_create_post);

//Get request for deleting skill
router.get("/skill/:id/delete", skill_controller.skill_delete_get);

//Post request for deleting skill
router.post("/skill/:id/delete", skill_controller.skill_delete_post);

//Get request for updating skill
router.get("/skill/:id/update", skill_controller.skill_update_get);

//Post request for updating skill
router.post("/skill/:id/update", skill_controller.skill_update_post);

//Get request for one skill
router.get("/skill/:id", skill_controller.skill_detail);

//Get request for all skills
router.get("/skill", skill_controller.skill_list);

module.exports = router;
