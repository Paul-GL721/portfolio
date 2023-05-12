
const Author = require("../models/author"); //author model
const Project = require("../models/project"); //project model
const jwt = require("jsonwebtoken"); 
const {  S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { BUCKET_NAME, BUCKET_REGION, ACCESS_KEY, SECRET_ACCESS_KEY, AUTH_SECRET_KEY } = require('../configs/config');

//s3 bucket connection parameters
const s3Client = new S3Client({
	region: BUCKET_REGION,
	credentials: {
		accessKeyId: ACCESS_KEY,
		secretAccessKey: SECRET_ACCESS_KEY
	}
});

let brandname
async function getBrandName() {
	Author.findOne({ authorStatus: 'owner' })
	  .then(brand => {
		// Do something with the brand
		
			if (err){
				console.log("There was an error in retrieving the brand name");
				console.log(err);
			} else if (!brand) {
				console.log("No brand");
			} else if(brand.brandName === null || brand.brandName === undefined) {
				console.log("No brand name");
				brandname = brand.name.first + brand.name.last;
			} else {
				console.log("brand name available");
				brandname = brand.brandName;
			}
		
	  })
	  .catch(err => {
		console.log("There was an error in retrieving the brand name");
		console.log(err);
	  });
  }
/*function getBrandName(){
	//find the brand name for the owner
	Author.findOne({ authorStatus: 'owner' }, function await(err, brand) {
		if (err){
			console.log("There was an error in retrieving the brand name");
			console.log(err);
		} else if (!brand) {
			console.log("No brand");
		} else if(brand.brandName === null || brand.brandName === undefined) {
			console.log("No brand name");
			brandname = brand.name.first + brand.name.last;
		} else {
			console.log("brand name available");
			brandname = brand.brandName;
		}
	});
	return brandname;
}*/

//Display login page
exports.login = async (req, res, next) => {
	res.render("login", { Title: "Login" });	
};

let refresh_jwt_token;
//Post login page (authentication)
exports.login_post = async (req, res, next) => {
	getBrandName();
	//get the email and password from the login form
	const username = req.body.email;
	const passwd = req.body.password;

	//find the user in the database
	const availuser = await Author.findOne({email: username, password:passwd })
	.exec(async (err, availresult) => {
		if (err){
			console.log(err);
		}
		//if the user is available, generate a JWT, load the admin dashboard
		else if (availresult) {
			const accessexpiry = new Date(Date.now() + 15 * 60 * 1000); //  10m from now
			//create an access token for the user
			const jwt_token = jwt.sign({ user:availresult.brandName, role:availresult.authorRole }, AUTH_SECRET_KEY, { expiresIn: '10m' } );
			//create a refresh token for the user
			refresh_jwt_token = jwt.sign({ user:availresult.brandName, role:availresult.authorRole }, AUTH_SECRET_KEY, { expiresIn: '1h' } );
			//create image signed Urls
			availresult.imageUrl = await  getSignedUrl(s3Client, new GetObjectCommand({
				Bucket: BUCKET_NAME,
				Key: availresult.imageName
			}), { expiresIn: 3600})	
			
			res.cookie('jwtTokens',{ jwt:jwt_token, reftok:refresh_jwt_token}, { expires: accessexpiry, path: '/' });
			//res.json({ availresult});
			res.render("admin_dashboard", { Title: "Adminstrator Dashboard", admin_data: availresult, brandname });
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

//logout user
exports.logout = (req, res, next) => {
	//'expires' attribute is set to a date in the past (January 1, 1970) which causes the cookie to expire immediately
	res.cookie('jwtTokens', '', { expires: new Date(0) });
	res.redirect("/portfolio"); //redirect to home page
}

//Get login information for an existing demo user
exports.demouserinfo = async (req, res, next) => {
	res.send("NOT IMPLEMENTED: GET demouserlogin page");	
};

//Middleware for authentication
exports.verifyToken = (req, res, next) => {
	const cookietoken = req.cookies.jwtTokens;
	const accessToken = cookietoken.jwt
	
	//console.log("The accessToken token is");
	//console.log(accessToken);
	if (!accessToken) {
		return res.status(401).json({ message: 'Unauthorised' });
	} else {
		try {
			//verifiy token using secret key
			const decodedToken = jwt.verify(accessToken, AUTH_SECRET_KEY);
			//attach decoded token to userinfo object
			req.userinfo = decodedToken;
			//call the next middleware
			next();
		} catch (err) {
			//return error if token is inalid
			res.status(403).send({ message: 'Invalid Access Token' })
		}
	}
}

//refresh user access token
exports.refreshToken = (req, res, next) => {
	//get the refreshtoken from the request body
	const accessToken = req.body.accessToken;
	const refreshToken = req.body.refreshToken;
	
	//verify the original refresh token sent
	//if valid, generate a new token with the same parameters.
	if (!refreshToken) {
		return res.status(401).json({ message: 'Unauthorised Refresh Token' });
	} else {
		try {
			//verifiy token using secret key
			const decodedToken = jwt.verify(refreshToken, AUTH_SECRET_KEY);
			//req.userinfo = decodedToken;
			//create an access token for the user
			const jwt_token = jwt.sign({ user:decodedToken.user, role:decodedToken.role }, AUTH_SECRET_KEY, { expiresIn: '15m' } );
			//create a refresh token for the user
			refresh_jwt_token = jwt.sign({ user:decodedToken.user, role:decodedToken.role }, AUTH_SECRET_KEY, { expiresIn: '2h' } );
			//res.cookie('jwtTokens',{ jwt:jwt_token, reftok:refresh_jwt_token }, { path: '/' });
			res.json({jwt:jwt_token, reftok:refresh_jwt_token });
		} catch (err) {
			//return error if token is inalid
			res.status(403).send({ message: 'Invalid Refresh Token' })
		}
	}
} 
