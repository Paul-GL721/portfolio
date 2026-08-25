const jwt = require('jsonwebtoken');
const { AUTH_SECRET_KEY } = require('../configs/config');

const SESSION_COOKIE_NAME = 'jwtTokens';
const SESSION_IDLE_TIMEOUT_SECONDS = 20 * 60;
const SESSION_IDLE_TIMEOUT_MS = SESSION_IDLE_TIMEOUT_SECONDS * 1000;

function cookieOptions() {
    const environment = process.env.NODE_ENV;

    return {
        httpOnly: true,
        sameSite: 'lax',
        secure: environment === 'production' || environment === 'stage',
        path: '/',
        maxAge: SESSION_IDLE_TIMEOUT_MS
    };
}

function clearCookieOptions() {
    const { maxAge, ...options } = cookieOptions();
    return options;
}

function safeNextPath(value) {
    const candidate = Array.isArray(value) ? value[0] : value;

    if (typeof candidate !== 'string' || !candidate.startsWith('/') || candidate.startsWith('//')) {
        return null;
    }

    try {
        const parsed = new URL(candidate, 'http://portfolio.local');
        const isLocal = parsed.origin === 'http://portfolio.local';
        const isPortfolioPath = parsed.pathname === '/portfolio' || parsed.pathname.startsWith('/portfolio/');
        const isAuthenticationPath = parsed.pathname === '/portfolio/login' || parsed.pathname === '/portfolio/logout';

        if (!isLocal || !isPortfolioPath || isAuthenticationPath) {
            return null;
        }

        return `${parsed.pathname}${parsed.search}`;
    } catch {
        return null;
    }
}

function extractAccessToken(req) {
    const cookie = req.cookies && req.cookies[SESSION_COOKIE_NAME];

    if (!cookie) {
        return null;
    }

    if (typeof cookie === 'object') {
        return cookie.jwt || null;
    }

    if (typeof cookie === 'string') {
        return cookie;
    }

    return null;
}

function issueSessionCookie(res, user) {
    const payload = {
        user: user.user || user.brandName,
        role: user.role || user.authorRole
    };

    const identifier = user.sub || user._id;
    if (identifier) {
        payload.sub = String(identifier);
    }

    const accessToken = jwt.sign(payload, AUTH_SECRET_KEY, {
        expiresIn: SESSION_IDLE_TIMEOUT_SECONDS
    });

    res.cookie(SESSION_COOKIE_NAME, { jwt: accessToken }, cookieOptions());
    return accessToken;
}

function clearSessionCookie(res) {
    res.clearCookie(SESSION_COOKIE_NAME, clearCookieOptions());
}

function restoreAuthentication(req, res, { renew = true } = {}) {
    req.authenticationChecked = true;
    res.locals = res.locals || {};
    res.locals.isAuthenticated = false;
    res.locals.sessionExpired = false;

    const accessToken = extractAccessToken(req);
    if (!accessToken) {
        return false;
    }

    try {
        const decodedToken = jwt.verify(accessToken, AUTH_SECRET_KEY);
        req.userinfo = decodedToken;
        res.locals.isAuthenticated = true;
        res.locals.currentUser = decodedToken.user;

        if (renew) {
            issueSessionCookie(res, decodedToken);
        }

        return true;
    } catch (error) {
        res.locals.sessionExpired = error.name === 'TokenExpiredError';
        clearSessionCookie(res);
        return false;
    }
}

function buildLoginUrl(req, { expired = false } = {}) {
    const parameters = new URLSearchParams();
    const nextPath = safeNextPath(req.originalUrl);

    if (nextPath) {
        parameters.set('next', nextPath);
    }
    if (expired) {
        parameters.set('expired', '1');
    }

    const query = parameters.toString();
    return `/portfolio/login${query ? `?${query}` : ''}`;
}

module.exports = {
    SESSION_COOKIE_NAME,
    SESSION_IDLE_TIMEOUT_MS,
    safeNextPath,
    issueSessionCookie,
    clearSessionCookie,
    restoreAuthentication,
    buildLoginUrl
};
