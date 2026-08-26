
const Author = require("../models/author"); //author model
const { BUCKET_NAME } = require('../configs/config');
const controllerUtils = require("../utils/controllerUtils");
const authSession = require('../utils/authSession');

//Display login page
exports.login = async (req, res, next) => {
	const nextPath = authSession.safeNextPath(req.query.next);

	if (req.userinfo) {
		return res.redirect(nextPath || "/portfolio/admin");
	}

	res.render("login", {
		Title: "Login",
		nextPath,
		sessionExpired: req.query.expired === '1'
	});
};

//Display the administrator dashboard for an existing authenticated session.
exports.dashboard = async (req, res, next) => {
	try {
		if (req.userinfo.role !== 'admin') {
			return res.status(403).send({ message: 'Administrator access is required' });
		}

		const admin = req.userinfo.sub
			? await Author.findById(req.userinfo.sub)
			: await Author.findOne({ brandName: req.userinfo.user });

		if (!admin) {
			authSession.clearSessionCookie(res);
			return res.redirect(authSession.buildLoginUrl(req));
		}

		const brand = await controllerUtils.getBrandName();
		admin.imageUrl = await controllerUtils.signedurl(BUCKET_NAME, admin.imageName, 3600);
		return res.render("admin_dashboard", {
			Title: "Administrator Dashboard",
			admin_data: admin,
			brand1: brand
		});
	} catch (error) {
		next(error);
	}
};

//Post login page (authentication)
exports.login_post = async (req, res, next) => {
	try {
		const brand = await controllerUtils.getBrandName();
		//get the email and password from the login form
		const username = req.body.email;
		const passwd = req.body.password;
		const nextPath = authSession.safeNextPath(req.body.next || req.query.next);

		//find the user in the database
		const availuser = await Author.findOne({ email: username }).select('+password');
		const passwordMatches = availuser && await availuser.verifyPassword(passwd);

		if (!passwordMatches) {
			if (req.is('application/json')) {
				return res.status(401).json({ status: false });
			}

			return res.status(401).render("login", {
				Title: "Login",
				nextPath,
				loginError: 'Wrong email address or password.'
			});
		}

		if (availuser.passwordNeedsUpgrade()) {
			const legacyPassword = availuser.password;
			const upgradedPassword = await Author.hashPassword(passwd);
			await Author.updateOne(
				{ _id: availuser._id, password: legacyPassword },
				{ $set: { password: upgradedPassword } }
			);
			availuser.password = upgradedPassword;
		}

		authSession.issueSessionCookie(res, availuser);
		availuser.password = undefined;
		res.locals.isAuthenticated = true;
		res.locals.currentUser = availuser.brandName;

		if (nextPath) {
			return res.redirect(nextPath);
		}

		availuser.imageUrl = await controllerUtils.signedurl(BUCKET_NAME, availuser.imageName, 3600);
		res.render("admin_dashboard", {
			Title: "Administrator Dashboard",
			admin_data: availuser,
			brand1: brand
		});
	} catch (error) {
		next(error);
	}	
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
exports.logout = async (req, res, next) => {
	try {
		authSession.clearSessionCookie(res);
		res.locals.isAuthenticated = false;
		res.locals.currentUser = null;
		const brand = await controllerUtils.getBrandName();

		return res.status(200).render("logged_out", {
			Title: "Signed out",
			brand1: brand
		});
	} catch (error) {
		next(error);
	}
}

//Get login information for an existing demo user
exports.demouserinfo = async (req, res, next) => {
	res.send("NOT IMPLEMENTED: GET demouserlogin page");	
};

exports.sessionContext = (req, res, next) => {
	authSession.restoreAuthentication(req, res);
	next();
}

//Middleware for authentication
exports.verifyToken = (req, res, next) => {
	if (!req.authenticationChecked) {
		authSession.restoreAuthentication(req, res);
	}

	if (req.userinfo) {
		return next();
	}

	const loginUrl = authSession.buildLoginUrl(req, {
		expired: Boolean(res.locals.sessionExpired)
	});

	if ((req.method === 'GET' || req.method === 'HEAD') && !req.xhr) {
		return res.redirect(loginUrl);
	}

	return res.status(401).json({
		message: res.locals.sessionExpired ? 'Session expired' : 'Authentication required',
		loginUrl
	});
}
