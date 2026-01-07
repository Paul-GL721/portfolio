

const request = require("supertest");
const myApp = require("../app");
const testutils = require("../utils/testUtils")
const session = require('supertest-session');
const Author = require('../models/author');
const supertest = require('supertest');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

var testSession = null;
var authenticatedSession;


function imageToString(filepath) {
    //read image file
    const imagePath = path.resolve(__dirname, filepath);
    const imageData = fs.readFileSync(imagePath);
    //convert the imagedata to string
    const imageString = imageData.toString('base64');
    return imageString;
}

beforeAll(function (done) {
  testutils.testconnection();

  //create an owner author document
  Author.create([
    { name: {
        first: 'Tommy',
        middle: 'Long',
        last: 'Sharu'
        },
        about: {
            short_description: 'Site Owner',
            full_description: 'This is the site owner'
        },
        brandName: 'TestOwner',
        email: 'test@gmail.com',
        password: 'test567',
        authorStatus: 'owner',
        authorRole: 'admin',
        socialmedia: {
            github: 'https://jestjs.io/docs/mongodb',
            linkedin: 'https://jestjs.io/docs/mongodb'
        },
        imageName: imageToString('../public/images/img/project1.jpg')
    },
    { name: {
      first: 'Johnny',
      middle: 'Mitch',
      last: 'Longly'
      },
      about: {
          short_description: 'Test user',
          full_description: 'User created to test select options'
      },
      brandName: 'Johnny',
      email: 'mitch3@jonny.com',
      password: 'jony67',
      authorStatus: 'normaluser',
      authorRole: 'member',
      socialmedia: {
          github: 'https://jestjs.io/docs/mongodb',
          linkedin: 'https://jestjs.io/docs/mongodb'
      },
      imageName: imageToString('../public/images/img/project1.jpg')
    }
  ])

  testSession = session(myApp);
  testSession.post('/portfolio/login')
    .send({ email: "test@gmail.com", password: "test567" })
    .expect(200)
    .end(function (err) {
        if (err) return done(err);
        authenticatedSession = testSession;
        return done();
    })
});


describe('Login Post Route', function () {
    it('Get the login form', function (done) {
        authenticatedSession.get('/portfolio/login')
          .expect(200)
          .end(done)
    });
    it('should log in a user and return a JWT token', async () => {
        const response = await supertest(myApp)
            .post('/portfolio/login')
            .send({ email: "test@gmail.com", password: "test567" });
    
        expect(response.status).toBe(200);
    });
    it(`Should return status false for unregistered user`, async () => {
        //creates new session object
        testSession = session(myApp);
        //Simulate the login process
        await testSession.post('/portfolio/login')
            .send({ email: 'nonexistent@example.com', password: 'invalidpassword' })
            .expect({status: false});
    }); 
});





/*const path = require('path');
const { BASEURL} = require('../configs/config');
const testutils = require('../utils/testUtils');


jest.setTimeout(6000000);
//END TO END TEST 
describe('Testing login functionality', () => {
    let isConnected;
    console.log(isConnected);
    const authoremail = "test@gmail.com";
    const authorpassword = "test567"

    test('Saves a user with owner status to the database', async () => {  
        if (isConnected) {
            //on the default page check if the create user button exists
            await page.goto(`${BASEURL}/portfolio/`, {waitUntil: 'domcontentloaded'});
            const creatowner = await page.$('#projectcreateuser');
            console.log('owner is not available', creatowner);

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
                await page.goto(`${BASEURL}/portfolio/`, { waitUntil: 'domcontentloaded'});
                await page.waitForSelector('#project_section');
                //await page.waitForNavigation();
                //await page.waitForTimeout(3000);
                console.log('login imagepath is',imagePath);

                // Refresh the page
                await page.reload({ waitUntil: 'domcontentloaded' });

               // Wait for the redirect to complete
               await page.waitForNavigation();

               // Assert that the URL after the redirect is correct
               expect(await page.url()).toMatch(`${BASEURL}/portfolio/`);

                
                
            } else{
                console.log("test owner already connected");
            }
        } else {
            console.log("Please check that the database is connected")
        }   
    });
    

    test('Title should be login', async () => { 
        if (isConnected) {
            await page.goto(`${BASEURL}/portfolio/login`, {waitUntil: 'domcontentloaded'});
            const title = await page.title();
            expect(title).toMatch('Login');
        }
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
            /*await page.waitForFunction(() => {
                return document.querySelector('#adminAddAuthor') !== null;
            });
            await page.waitForNavigation({timeout: 800000});
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
});*/