process.env.NODE_ENV = 'test';
process.env.AUTH_SECRET_KEY = 'authentication-unit-test-secret';

const jwt = require('jsonwebtoken');
const Author = require('../models/author');
const controllerUtils = require('../utils/controllerUtils');
const loginController = require('../controllers/loginController');
const {
    SESSION_IDLE_TIMEOUT_MS,
    safeNextPath,
    issueSessionCookie,
    restoreAuthentication
} = require('../utils/authSession');

function createResponse() {
    return {
        locals: {},
        cookie: jest.fn(),
        clearCookie: jest.fn(),
        redirect: jest.fn(),
        render: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
}

describe('Authentication sessions', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('accepts local portfolio next paths and rejects external redirects', () => {
        expect(safeNextPath('/portfolio/project/update?id=123')).toBe('/portfolio/project/update?id=123');
        expect(safeNextPath('https://example.com/portfolio')).toBeNull();
        expect(safeNextPath('//example.com/portfolio')).toBeNull();
        expect(safeNextPath('/portfolio/login')).toBeNull();
        expect(safeNextPath('/admin')).toBeNull();
    });

    test('issues an HttpOnly cookie with a 20-minute idle timeout', () => {
        const response = createResponse();

        issueSessionCookie(response, {
            _id: '64c000000000000000000001',
            brandName: 'Test Owner',
            authorRole: 'admin'
        });

        expect(response.cookie).toHaveBeenCalledTimes(1);
        const [cookieName, cookieValue, options] = response.cookie.mock.calls[0];
        expect(cookieName).toBe('jwtTokens');
        expect(cookieValue.jwt).toBeDefined();
        expect(options).toMatchObject({
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: SESSION_IDLE_TIMEOUT_MS,
            path: '/'
        });
    });

    test('renews a valid session when an authenticated request is made', () => {
        const response = createResponse();
        const token = jwt.sign(
            { user: 'Test Owner', role: 'admin' },
            process.env.AUTH_SECRET_KEY,
            { expiresIn: '5m' }
        );
        const request = { cookies: { jwtTokens: { jwt: token } } };

        expect(restoreAuthentication(request, response)).toBe(true);
        expect(request.userinfo.role).toBe('admin');
        expect(response.locals.isAuthenticated).toBe(true);
        expect(response.cookie).toHaveBeenCalledTimes(1);
    });

    test('clears an expired session', () => {
        const response = createResponse();
        const token = jwt.sign(
            { user: 'Test Owner', role: 'admin' },
            process.env.AUTH_SECRET_KEY,
            { expiresIn: -1 }
        );
        const request = { cookies: { jwtTokens: { jwt: token } } };

        expect(restoreAuthentication(request, response)).toBe(false);
        expect(response.locals.sessionExpired).toBe(true);
        expect(response.clearCookie).toHaveBeenCalledWith(
            'jwtTokens',
            expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/' })
        );
    });

    test('redirects unauthenticated page requests using the next parameter', () => {
        const request = {
            authenticationChecked: true,
            method: 'GET',
            originalUrl: '/portfolio/project/update?id=123',
            xhr: false
        };
        const response = createResponse();
        const next = jest.fn();

        loginController.verifyToken(request, response, next);

        expect(next).not.toHaveBeenCalled();
        expect(response.redirect).toHaveBeenCalledWith(
            '/portfolio/login?next=%2Fportfolio%2Fproject%2Fupdate%3Fid%3D123'
        );
    });

    test('returns a user to a safe next path after login', async () => {
        const user = {
            _id: '64c000000000000000000001',
            brandName: 'Test Owner',
            authorRole: 'admin',
            verifyPassword: jest.fn().mockResolvedValue(true),
            passwordNeedsUpgrade: jest.fn().mockReturnValue(false)
        };
        const select = jest.fn().mockResolvedValue(user);
        jest.spyOn(Author, 'findOne').mockReturnValue({ select });
        jest.spyOn(controllerUtils, 'getBrandName').mockResolvedValue({ brandName: 'Portfolio' });

        const request = {
            body: {
                email: 'owner@example.com',
                password: 'valid-password',
                next: '/portfolio/project/update?id=123'
            },
            query: {},
            is: jest.fn().mockReturnValue(false)
        };
        const response = createResponse();
        const next = jest.fn();

        await loginController.login_post(request, response, next);

        expect(response.redirect).toHaveBeenCalledWith('/portfolio/project/update?id=123');
        expect(response.cookie).toHaveBeenCalledWith(
            'jwtTokens',
            expect.objectContaining({ jwt: expect.any(String) }),
            expect.objectContaining({ httpOnly: true, maxAge: SESSION_IDLE_TIMEOUT_MS })
        );
        expect(next).not.toHaveBeenCalled();
    });

    test('redirects an authenticated login-page request to the admin dashboard', async () => {
        const request = {
            query: {},
            userinfo: { role: 'admin' }
        };
        const response = createResponse();

        await loginController.login(request, response, jest.fn());

        expect(response.redirect).toHaveBeenCalledWith('/portfolio/admin');
        expect(response.render).not.toHaveBeenCalled();
    });

    test('renders the dashboard from an existing administrator session', async () => {
        const admin = {
            _id: '64c000000000000000000001',
            imageName: 'profile-image',
            authorRole: 'admin'
        };
        jest.spyOn(Author, 'findById').mockResolvedValue(admin);
        jest.spyOn(controllerUtils, 'getBrandName').mockResolvedValue({ brandName: 'Portfolio' });
        jest.spyOn(controllerUtils, 'signedurl').mockResolvedValue('https://example.com/profile-image');
        const request = {
            originalUrl: '/portfolio/admin',
            userinfo: { sub: admin._id, role: 'admin' }
        };
        const response = createResponse();
        const next = jest.fn();

        await loginController.dashboard(request, response, next);

        expect(response.render).toHaveBeenCalledWith('admin_dashboard', expect.objectContaining({
            Title: 'Administrator Dashboard',
            admin_data: expect.objectContaining({ imageUrl: 'https://example.com/profile-image' })
        }));
        expect(next).not.toHaveBeenCalled();
    });

    test('clears authentication and renders a signed-out confirmation page', async () => {
        jest.spyOn(controllerUtils, 'getBrandName').mockResolvedValue({ brandName: 'Portfolio' });
        const request = {};
        const response = createResponse();
        const next = jest.fn();

        await loginController.logout(request, response, next);

        expect(response.clearCookie).toHaveBeenCalledWith(
            'jwtTokens',
            expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/' })
        );
        expect(response.locals.isAuthenticated).toBe(false);
        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.render).toHaveBeenCalledWith('logged_out', {
            Title: 'Signed out',
            brand1: { brandName: 'Portfolio' }
        });
        expect(response.json).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    test('verifies hashed passwords and recognises legacy plaintext passwords', async () => {
        const hashedPassword = await Author.hashPassword('correct horse battery staple');
        const hashedAuthor = new Author({ password: hashedPassword });
        const legacyAuthor = new Author({ password: 'legacy-password' });

        expect(await hashedAuthor.verifyPassword('correct horse battery staple')).toBe(true);
        expect(await hashedAuthor.verifyPassword('wrong-password')).toBe(false);
        expect(hashedAuthor.passwordNeedsUpgrade()).toBe(false);
        expect(await legacyAuthor.verifyPassword('legacy-password')).toBe(true);
        expect(legacyAuthor.passwordNeedsUpgrade()).toBe(true);
        expect(hashedAuthor.toJSON().password).toBeUndefined();
    });
});
