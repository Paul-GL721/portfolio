
const Author = require("../models/author"); //author model
const Project = require("../models/project"); //project model
const jwt = require("jsonwebtoken"); //
const { AUTH_SECRET_KEY }  = require('../configs/config');

//Display login page
exports.login = async (req, res, next) => {
	res.render("login", { Title: "Login" });	
};

//Post login page (authentication)
exports.login_post = async (req, res, next) => {
	//get the email and password from the login form
	const username = req.body.email;
	const passwd = req.body.password;

	//find the user in the database
	const availuser = await Author.findOne({email: username, password:passwd })
	.exec((err, availresult) => {
		if (err){
			console.log(err);
		}
		//if the user is available, generate a JWT, load the admin dashboard
		else if (availresult) {
			const jwt_token = jwt.sign({ user:availresult.brandName, role:availresult.authorRole }, AUTH_SECRET_KEY, { expiresIn: '1h' } );
			res.cookie('jwt', jwt_token, {httpOnly: true});
			res.json({availresult});
		}
		//else the user is not available: send an error response
		else {
			res.json({ status: false});
		}
	});
};

//Display owner signup page
exports.owner_signup = async (req, res, next) => {
	res.render("create_owner_portfolio", { Title: "Owner Sign up" });	
};

//Display demouser signup page
exports.demouser_signup = async (req, res, next) => {
	res.render("create_demouser", { Title: "Demo user" });	
};

//Display demologin page
exports.demologin = async (req, res, next) => {
	res.render("demologin", { Title: "Demo login" });	
};

//Post demologin page (authentication)
exports.demologin_post = async (req, res, next) => {
	res.send("NOT IMPLEMENTED: GET demologin page");	
};

//Check if a demouser exists
exports.demouseravailablity = async (req, res, next) => {
	const checkauthors = Author.exists({ authorStatus: 'demouser' }, function(err, available_demouser) {
		if (err) {
			res.send("There was an error: while checking for your portfolio");
		} else if (available_demouser===null) { 
			res.send("You need to add a demouser");
		} else {
			//console.log("The demouser is available");
			res.json({ status: true});	
		}
	});
};

//Get login information for an existing demo user
exports.demouserinfo = async (req, res, next) => {
	res.send("NOT IMPLEMENTED: GET demouserlogin page");	
};

//Middleware for authorisation
exports.verifyToken = (req, res, next) => {
	const token = req.cookies.jwt;
	if (!token) {
		return res.status(401).json({ message: 'Unauthorised' });
	} else {
		try {
			//verifiy token using secret key
			const decodedToken = jwt.verify(token, AUTH_SECRET_KEY);
			//attach decoded token to userinfo object
			req.userinfo = decodedToken;
			//call the next middleware
			next();
		} catch (err) {
			//return error if token is inalid
			res.status(403).send({ message: 'Invalid Token' })
		}
	}
}
