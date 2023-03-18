/*........ ROUTES FOR THE MAIN WEBSITE.....................*/

const express = require("express");
const router = express.Router();

//Require controller modules
const author_controller = require("../controllers/authorController");
const specialisation_controller = require("../controllers/specialisationController");
const skill_controller = require("../controllers/skillController");
const project_controller = require("../controllers/projectController");

				//........AUTHOR ROUTES.....//
//Get website home page
router.get("/", author_controller.index);

//Post contact page from website home page
router.post("/", author_controller.index_post);

//Get login page
router.get("/login", author_controller.login);

//Post login page
router.post("/login", author_controller.login_post);

//Get signup page
router.get("/signup/owner", author_controller.owner_signup);

//Post signup page
router.post("/signup/owner", author_controller.owner_signup_post);

//Get demologin page
router.get("/demologin", author_controller.demologin);

//Post demologin page
router.post("/demologin", author_controller.demologin_post);

//Get request for creating author
router.get("/author/create", author_controller.author_create_get);

//Post request for creating author
router.post("/author/create", author_controller.author_create_post);

//Get request for deleting author
router.get("/author/delete", author_controller.author_delete_get);

//Post request for deleting author
router.post("/author/delete", author_controller.author_delete_post);

//Get request for updating author
router.get("/author/update", author_controller.author_update_get);

//Post request for updating author
router.post("/author/update", author_controller.author_update_post);

//Get request for one author
router.get("/author/:id", author_controller.author_detail);

//Get request for all authors
router.get("/author", author_controller.author_list);


				//........PROJECT ROUTES.....//
//Get request for creating project
router.get("/project/create", project_controller.project_create_get);

//Post request for created project
router.post("/project/create", project_controller.project_create_post);

//Get request for deleting project
router.get("/project/delete", project_controller.project_delete_get);

//Post request for deleting project
router.post("/project/delete", project_controller.project_delete_post);

//Get request for updating project
router.get("/project/update", project_controller.project_update_get);

//Post request for updating project
router.post("/project/update", project_controller.project_update_post);

//Get request for one project
router.get("/project/:id", project_controller.project_detail);

//Get request for all projects
router.get("/project", project_controller.project_list);

//Get request for all project skills
router.get("/project/api/skills", skill_controller.project_skill);

//Get request for all project skills
router.get("/project/api/specialisations", specialisation_controller.project_specialisations);

//Get request for all project authors
router.get("/project/api/authors", author_controller.project_authors);

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
router.get("/skill/delete", skill_controller.skill_delete_get);

//Post request for deleting skill
router.post("/skill/delete", skill_controller.skill_delete_post);

//Get request for updating skill
router.get("/skill/update", skill_controller.skill_update_get);

//Post request for updating skill
router.post("/skill/update", skill_controller.skill_update_post);

//Get request for one skill
router.get("/skill/:id", skill_controller.skill_detail);

//Get request for all skills
router.get("/skill", skill_controller.skill_list);

module.exports = router;
