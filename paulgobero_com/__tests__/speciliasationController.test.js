//import required modules
const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../controllers/loginController');
//const { specialisation_list } = require('../controllers/specialisationController');
//const { verifyToken } = require('../controllers/loginController')

describe("test GET /specialisation: returns a list of all specialisations", () => { 
    
   
    
    //test1: returns 401 if no jwt is provided
    test("Return 401 if no user credentials", async () => {
        const token = jwt.sign({ role: 'testuser1' }, 'AUTH_SECRET_KEY');
        const response = await request(app)
            .get('/portfolio/specialisation')
            .set('Cookie', `jwtTokens=${token}`);
        expect(response.status).toBe(401);
    });
    //test2: Returns a list if jwt token is available
    //test2: Returns a list if jwt token is available
/* //test2: Returns a list if jwt token is available
 test("list is available", async () => {
    const jwt_token = jwt.sign({ user:'brandName', role:'admin' }, 'AUTH_SECRET_KEY', { expiresIn: '10m' } );
    const decodedToken = jwt.verify(jwt_token, 'AUTH_SECRET_KEY');
    const Role = decodedToken.role;

    const response = await request(app)
        .get('/portfolio/specialisation')
        .set('Cookie', `jwtTokens=${JSON.stringify({ jwt: jwt_token })}`)
        .use(verifyToken)
        .set('Role', Role);

    // Check that the response code is 200
    expect(response.status).toBe(200);

    // Check that the response body contains the expected message
    expect(response.body.message).toBe('NOT IMPLEMENTED: Specialisation list');

    // Check that the verifyToken middleware function was called and set the userinfo property on the req object
    expect(response.req.userinfo.user).toBe('brandName');
    expect(response.req.userinfo.role).toBe('admin');
});*/

      

    //test3: an error because the list is not available
    test("list is not available", () => {
        //should return a 404 error
        //should return a json object with the error message
        //content type should be json
    })
});