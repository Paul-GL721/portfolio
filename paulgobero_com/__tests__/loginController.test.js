const { cookie } = require('express-validator');
const { BASEURL, TEST_AUTH_SECRET_KEY } = require('../configs/config');
const jwt = require("jsonwebtoken"); 

jest.setTimeout(600000);
/* END TO END TEST */
describe('Login pages (portfolio/login)', () => {
    beforeAll( async () => {
        await page.goto(`${BASEURL}/portfolio/login`, {waitUntil: 'domcontentloaded'});
    });

    test('Title should be login', async () => { 
        const title = await page.title();
        expect(title).toMatch('Login');
    });

    test('Test that the user is able to login', async () => { 
        const emailInput = await page.$('#loginemail');
        const passwdInput = await page.$('#loginpasswd');
        const loginbtn = await page.$('#loginbtn');
        await emailInput.type('paul@paulgobero.com');
        await passwdInput.type('paul');
        await loginbtn.click();
        await page.waitForNavigation();
        //check if the jwt token is set as a cookie
        const cookies = await page.cookies();
        const jwtTokenCookie = cookies.find(cookie => cookie.name === 'jwtToken');
        expect(jwtTokenCookie).toBeDefined();



        /*const loginlandingpage = await page.title();
        expect(loginlandingpage).toMatch('Adminstrator Dashboard');*/


    });

});