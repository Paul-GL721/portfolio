/*........ ROUTES FOR THE MAIN portfolio.....................*/

const express = require("express");
const router = express.Router();

//Require controller modules
const author_controller = require("../controllers/authorController");
const specialisation_controller = require("../controllers/specialisationController");
const skill_controller = require("../controllers/skillController");
const project_controller = require("../controllers/projectController");
const login_controller = require("../controllers/loginController");

				//........AUTHOR ROUTES.....//
//Get portfolio home page
router.get("/", author_controller.index);
//Post contact page from portfolio home page
router.post("/formemail", author_controller.index_post);

//Get request for creating author page
router.get("/author/create", login_controller.verifyToken, author_controller.author_create_get);

//Post request for creating author
router.post("/author/create", login_controller.verifyToken, author_controller.author_create_post);

//Post request for creating owner author
router.post("/author/ownercreate", author_controller.author_ownercreate_post);

//Get request for deleting author
router.get("/author/delete", login_controller.verifyToken, author_controller.author_delete_get);

//Post request for deleting author
router.post("/author/delete", login_controller.verifyToken, author_controller.author_delete_post);

//Get request for updating author
router.get("/author/update", login_controller.verifyToken, author_controller.author_update_get);

//Post request for updating author
router.post("/author/update", login_controller.verifyToken, author_controller.author_update_post);

//Get request for one authors
router.get("/author/:id", login_controller.verifyToken, author_controller.author_detail);

//Get request for all authors
router.get("/author", login_controller.verifyToken, author_controller.author_list);


				//........LOGIN ROUTES.....//
//Get login page
router.get("/login", login_controller.login);

//Post login page
router.post("/login", login_controller.login_post);

//Get request to refresh JWToken
router.post("/refreshlogin", login_controller.refreshToken);

//Logout user
router.get("/logout", login_controller.logout);

//Get owner signup page
router.get("/signup/owner", login_controller.owner_signup);

//Get demo user signup page
router.get("/signup/demouser", login_controller.demouser_signup);

//Get demologin page
router.get("/demologin", login_controller.demologin);

//Post demologin page
router.post("/demologin", login_controller.demologin_post);

//Get existing demologin info
router.get("/demologin/userinfo", login_controller.demouserinfo);

//Check if a demo user exists
router.get("/demologin/availablity", login_controller.demouseravailablity);


				//........PROJECT ROUTES.....//
//Get request for creating project
router.get("/project/create", login_controller.verifyToken, project_controller.project_create_get);

//Post request for created project
router.post("/project/create", login_controller.verifyToken, project_controller.project_create_post);

//Get request for deleting project
router.get("/project/delete", login_controller.verifyToken, project_controller.project_delete_get);

//Post request for deleting project
router.post("/project/delete", login_controller.verifyToken, project_controller.project_delete_post);

//Get request for updating project
router.get("/project/update", login_controller.verifyToken, project_controller.project_update_get);

//Post request for updating project
router.post("/project/update", login_controller.verifyToken, project_controller.project_update_post);

//Get request for one project
router.get("/project/:id", project_controller.project_detail);

//Get request for all projects
router.get("/project", login_controller.verifyToken, project_controller.project_list);

//Get request for all project skills
router.get("/project/api/skills", login_controller.verifyToken, skill_controller.project_skill);

//Get request for all project skills
router.get("/project/api/specialisations", login_controller.verifyToken, specialisation_controller.project_specialisations);

//Get request for all project authors
router.get("/project/api/authors", login_controller.verifyToken, author_controller.project_authors);

				//........BLOG ROUTES.....//


				//........SPECILISATION ROUTES.....//
//Get request for creating specialisation
router.get("/specialisation/create", login_controller.verifyToken, specialisation_controller.specialisation_create_get);

//Post request for creating specialisation
router.post("/specialisation/create", login_controller.verifyToken, specialisation_controller.specialisation_create_post);

//Get request for deleting specialisation
router.get("/specialisation/delete", login_controller.verifyToken, specialisation_controller.specialisation_delete_get);

//Post request for deleting specialisation
router.post("/specialisation/delete", login_controller.verifyToken, specialisation_controller.specialisation_delete_post);

//Get request for updating specialisation
router.get("/specialisation/update", login_controller.verifyToken, specialisation_controller.specialisation_update_get);

//Post request for updating specialisation
router.post("/specialisation/update", login_controller.verifyToken, specialisation_controller.specialisation_update_post);

//Get request for one specialisation
router.get("/specialisation/:id", login_controller.verifyToken, specialisation_controller.specialisation_detail);

//Get request for all specialisations
router.get("/specialisation", login_controller.verifyToken, specialisation_controller.specialisation_list);


				//........SKILLS ROUTES.....//
//Get request for creating skill
router.get("/skill/create", login_controller.verifyToken, skill_controller.skill_create_get);

//Post request for creating skill
router.post("/skill/create", login_controller.verifyToken, skill_controller.skill_create_post);

//Get request for deleting skill
router.get("/skill/delete", login_controller.verifyToken, skill_controller.skill_delete_get);

//Post request for deleting skill
router.post("/skill/delete", login_controller.verifyToken, skill_controller.skill_delete_post);

//Get request for updating skill
router.get("/skill/update", login_controller.verifyToken, skill_controller.skill_update_get);

//Post request for updating skill
router.post("/skill/update", login_controller.verifyToken, skill_controller.skill_update_post);

//Get request for one skill
router.get("/skill/:id", login_controller.verifyToken, skill_controller.skill_detail);

//Get request for all skills
router.get("/skill", login_controller.verifyToken, skill_controller.skill_list);

module.exports = router;
