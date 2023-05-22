const { cookie } = require('express-validator');
const path = require('path');
const { BASEURL, TEST_AUTH_SECRET_KEY } = require('../configs/config');
const jwt = require("jsonwebtoken"); 
const Author = require("../models/author"); //author model
const  database_connection = require('../configs/loadb'); //testdb module
const { TEST_DB_USER, TEST_DB_PASSWORD, TEST_DB_NAME, TEST_DB_HOST, TEST_DB_PORT } = require('../configs/config');
const { link } = require('fs');

jest.setTimeout(6000000);
/* END TO END TEST */
describe('Testing login functionality', () => {
    let isConnected;
    beforeAll( async () => {
        //await page.goto(`${BASEURL}/portfolio/login`, {waitUntil: 'domcontentloaded'});
        isConnected = await database_connection(TEST_DB_NAME, TEST_DB_USER, TEST_DB_PASSWORD, TEST_DB_HOST, TEST_DB_PORT );
        console.log('Is the database connected?', isConnected);
    });

    const authoremail = "test@gmail.com";
    const authorpassword = "test567"

    test('Saves a user with owner status to the database', async () => {  
        if (isConnected) {
            //on the default page check if the create user button exists
            await page.goto(`${BASEURL}/portfolio/`, {waitUntil: 'domcontentloaded'});
            const creatowner = await page.$('#projectcreateuser')
            if (creatowner) {
                //if no owner has been register add a new owner
                await page.goto(`${BASEURL}/portfolio/signup/owner`, { waitUntil: 'domcontentloaded'});
                //fill in the owner registration form
                await page.type('#authorfirstname', 'testfirstname');
                await page.type('#authormiddlename', 'testmiddlename');
                await page.type('#authorlastname', 'testlastname');
                await page.type('#authorshortdesc', 'test brief description');
                await page.type('#authorfulldesc', 'test full description');
                await page.type('#authorbrandname', 'test brand name');
                await page.type('#authoremail', authoremail);
                await page.type('#authorpassword', authorpassword);
                await page.type('#githuburl', 'https://chat.openai.com/?model=text-davinci-002-render-sha');
                await page.type('#linkeninurl', 'https://chat.openai.com/?model=text-davinci-002-render-sha');
                //upload images 
                console.log("imageInput");
                const imageInput = await page.$('#photo1');
                const imagePath = path.resolve(__dirname, '../public/images/img/project2.jpg');
                await imageInput.uploadFile(imagePath);
                console.log(imagePath);
                //submit form
                await page.click('#ownersubmitbutton');
                console.log('imagepath is',imagePath);
                // Listen for the redirect response
                // Wait for the redirect response
                const redirectResponse = await page.waitForResponse(
                    response =>
                      response.status() === 302 && response.headers()['location'] === `${BASEURL}/portfolio/`,
                    { timeout: 50000000 } // Timeout value in milliseconds
                  );
                console.log('redirectResponse', redirectResponse);

                // Check the redirect response
                expect(redirectResponse.status()).toBe(302);
                expect(redirectResponse.headers()['location']).toBe('/portfolio/');
                //await page.waitForResponse(response => response.status() === 302 && response.headers()['location'] === '/portfolio', { timeout: 60000000 });
                //await page.waitForSelector('#project_section', { timeout: 60000000 });
                //await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 6000000 });
                console.log('owner emails is', authoremail);
                const currentURL = await page.url();
                expect(currentURL).toBe(`${BASEURL}/portfolio`); // Check if the URL contains '/portfolio' 
                const pagetitle = await page.title();
                expect(pagetitle).toMatch('Portfolio'); 
                

            } else{
                console.log("test owner already connected");
            }
        } else {
            console.log("Please check that the database is connected")
        }   
    }, 1200000);
    

    test('Title should be login', async () => { 
        await page.goto(`${BASEURL}/portfolio/login`, {waitUntil: 'domcontentloaded'});
        const title = await page.title();
        expect(title).toMatch('Login');
    });

    test('Test that the user is able to login', async () => { 
        
        if (isConnected) {
            await page.goto(`${BASEURL}/portfolio/login`, {waitUntil: 'domcontentloaded'});
            console.log('login author email', authoremail);
            const emailInput = await page.$('#loginemail');
            const passwdInput = await page.$('#loginpasswd');
            const loginbtn = await page.$('#loginbtn');
            await emailInput.type(authoremail);
            await passwdInput.type(authorpassword);
            await loginbtn.click();
            await page.waitForNavigation();
            // Assert if the JWT token cookie exists
            const jwtTokenCookie = await page.evaluate(() => {
                return document.cookie.includes('jwtTokens');
            });
            expect(jwtTokenCookie).toBe(true);
            // Assert if the page title is "Adminstrator Dashboard"
            const pageTitle = await page.title();
            expect(pageTitle).toBe('Adminstrator Dashboard');

            // Define the links on the admin dashboard to test
            const links = [
                { id: '#adminAddSkill a', expectedTitle: 'Create Skill' },
                { id: '#adminUpdateSkill a', expectedTitle: 'Admin Skill' },
                { id: '#adminAddSpec a', expectedTitle: 'Create Specialisation' },
                
                { id: '#adminAddAuthor a', expectedTitle: 'Create author' },
                { id: '#adminUpdateAuthor a', expectedTitle: 'Admin Author' },
                { id: '#adminAddProj a', expectedTitle: 'Project Form' },
                { id: '#adminUpdateProj a', expectedTitle: 'Admin Project' }
            ];

            for (const link of links) {
                // Get the href value of the first link
                const addSkillLink = await page.$eval(link.id, (element) => element.href);

                // Navigate directly to the link's URL
                await page.goto(addSkillLink, { waitUntil: 'domcontentloaded' });

                // Assert that the new page is loaded
                const newPageTitle = await page.title();
                expect(newPageTitle).toBe(link.expectedTitle);

                //go back to the admin dashboard
                await page.goBack();
            }
        }
    });
});