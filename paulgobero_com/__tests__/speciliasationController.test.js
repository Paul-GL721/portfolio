
const request = require("supertest");
const myApp = require("../app");
const testutils = require("../utils/testUtils")
const session = require('supertest-session');
const Author = require('../models/author');
const Specialisation = require('../models/specialisation'); 
const specialisation_controller = require("../controllers/specialisationController");
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { test } = require("node:test");

var testSession = null;
let sampleSpecialisation;

function imageToString(filepath) {
    //read image file
    const imagePath = path.resolve(__dirname, filepath);
    const imageData = fs.readFileSync(imagePath);
    //convert the imagedata to string
    const imageString = imageData.toString('base64');
    return imageString;
}
var authenticatedSession;
beforeAll(function (done) {
    testutils.testconnection()
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
    //1. Create a sample specialisation and save it to the database
    sampleSpecialisation = new Specialisation({ name: 'PostFrontend', description: 'Ability to perform frontend designs' });
    sampleSpecialisation.save();

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

describe('Acessing authenticated pages', function () {
    it('Get the specialisation form', function (done) {
        authenticatedSession.get('/portfolio/specialisation/create')
            .expect(200)
            .end(done)
    });

    it('Post data to the specialisation collection', function (done) {
        authenticatedSession.post('/portfolio/specialisation/create')
            .send({ specialisationname: 'Frontend', specialisationdescription: 'Ability to perform frontend designs' })
            .expect(302)
            .end(done)
    });

    it('Get a list of available specialisations', function (done) {
        authenticatedSession.get('/portfolio/specialisation')
            .expect(200)
            .expect('Content-Type', /html/)
            .end(done)

    });

    it('Should successfully update a GET specialisation in the portfolio', async () => {
        //1. Create a sample specialisation and save it to the database
        //const sampleSpecialisation = new Specialisation({ name: 'Frontend12', description: 'Ability to perform frontend designs' });
        //await sampleSpecialisation.save();
        //2. Update the specialisation name
        const updatedName = 'Updated Specialisation';
        sampleSpecialisation.name = updatedName;
        await sampleSpecialisation.save();
        //3. Convert the id to string to be used in the res.query
        const upid = sampleSpecialisation._id.toString()
        //4. Send the id to the given route
        const response = await authenticatedSession
            .get('/portfolio/specialisation/update')
            .query({ updateid: upid  });
        //5. Retrieve the updated specialisation from the database
        const updatedSpecialisation = await Specialisation.findOne({ _id: upid }).exec();
        //6. Format createdAt and updatedAt as ISO 8601 strings
        const formatDateString = (date) => new Date(date).toISOString();
        // Using the spread format create a new array with a 
        //converted createdAt and updatedAt to formatted date strings
        const expectedSpecialisation = {
            ...updatedSpecialisation.toJSON(),
            createdAt: formatDateString(updatedSpecialisation.createdAt),
            updatedAt: formatDateString(updatedSpecialisation.updatedAt),
            _id: updatedSpecialisation._id.toString(),
        };
        //7. Assert that the response contains the expected updated specialisation
        expect(response.status).toBe(200);
        expect(response.body).toEqual(expectedSpecialisation);
    });
    
    it('Should successfully update a POST specialisation in the portfolio', async () => {    
        //Convert the id to string to be used in the res.query
        const upid = sampleSpecialisation._id.toString()
        //Send the update date to the given route
        const response = await authenticatedSession
            .post('/portfolio/specialisation/update')
            .send({ specUpdateid: upid, specialisationname:'Updated Specialisation Name', specialisationdescription:'Updated Specialisation Description',  });
        //Retrieve the updated specialisation from the database
        const updatedSpecialisation = await Specialisation.findOne({ _id: upid }).exec();
        
        //Assert that the response contains the expected updated specialisation
        expect(response.status).toBe(302);
        const redirectPath = response.headers.location;
        expect(redirectPath).toBe('/portfolio/specialisation');
        expect(updatedSpecialisation.name).toBe('Updated Specialisation Name');
        expect(updatedSpecialisation.description).toBe('Updated Specialisation Description');
    });

    const geturls = [
        '/portfolio/specialisation/create',
        '/portfolio/specialisation',
        '/portfolio/specialisation/update'
    ];
    const posturls = [
        '/portfolio/specialisation/create',
        '/portfolio/specialisation/update',
        '/portfolio/specialisation/delete',
    ];
    
    //Using the authenticated session data, make the request, should fail with a 403
    for (const purl of posturls) {
        it(`Should return 403 error for unauthorized user trying to POST UPDATE Specialisations @ ${purl}`, async () => {
            //creates new session object
            testSession = session(myApp);
            //Simulate the login process
            await testSession.post('/portfolio/login')
                .send({ email: "mitch3@jonny.com", password: "jony67" })
                .expect(200);
            const response = await testSession.post(purl);
            expect(response.status).toBe(403);
        });
    }
    for (const gurl of geturls) {
        it(`Should return 403 error for unauthorized user trying to GET UPDATE Specialisations  @ ${gurl}`, async () => {
            //creates new session object
            testSession = session(myApp);
            //Simulate the login process
            await testSession.post('/portfolio/login')
                .send({ email: "mitch3@jonny.com", password: "jony67" })
                .expect(200);
            const response = await testSession.get(gurl);
            expect(response.status).toBe(403);
        });   
    }

    it('Should successfully POST DELETE a specialisation in the portfolio', async () => {
        /* Create a specialisation to delete and test the message from the json response  */
        const SpecToDelete = new Specialisation({ name: 'delFrontend12', description: 'Ability to perform frontend designs' });
        await SpecToDelete.save();
        
        const delid = SpecToDelete._id.toString();
        const response = await authenticatedSession
            .post('/portfolio/specialisation/delete')
            .send({specid: delid  });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({success: "Successfully Deleted"});
    });
   
});




















/*//import required modules
const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const testutils = require('../utils/testUtils');
const { BASEURL } = require('../configs/config');


jest.setTimeout(600000);
let isConnected;
const authoremail = "test@gmail.com";
const authorpassword = "test567";

describe('Test that links on Specialisation Authenticated page work', () => {
  
    async function testAuthLinkNavigation(label, section, goto) {        
        if (isConnected) {
            console.log("spec db connection")
            await testutils.loginAndNavigate(authoremail, authorpassword);
            await page.goto(goto, { waitUntil: 'domcontentloaded' });
            const link = await page.$(`ul.navbar-nav li a.nav-link[href="${section}"]`);
            await page.waitForSelector(link);
            await link.click();
            await page.waitForNavigation();
            const getauthorpage = await page.title();
            console.log('specialisation test title', getauthorpage);
            expect(getauthorpage).toBe('Portfolio');
            expect("#skill_section").toBeNull();
            const currentUrl = page.url();
            expect(currentUrl.endsWith(section)).toBeTruthy();
        }
    }
  
    test('Clicking the About link should navigate to the About section', async () => {
      await testAuthLinkNavigation('About', '/#about_section', `${BASEURL}/portfolio/specialisation/create`);
      await testAuthLinkNavigation('About', '/#about_section', `${BASEURL}/portfolio/specialisation`);
    });
    test('Clicking the Projects link should navigate to the Projects section', async () => {
      await testAuthLinkNavigation('Projects', '/#project_section', `${BASEURL}/portfolio/specialisation/create`);
      await testAuthLinkNavigation('Projects', '/#project_section', `${BASEURL}/portfoliospecialisation`);
    });
    test('Clicking the Skills link should navigate to the Skills section', async () => {
      await testAuthLinkNavigation('Skills', '/#skill_section', `${BASEURL}/portfolio/specialisation/create`);
      await testAuthLinkNavigation('Skills', '/#skill_section', `${BASEURL}/portfolio/specialisation`);
    });
    test('Clicking the Contact link should navigate to the Contact section', async () => {
      await testAuthLinkNavigation('Contact', '/#contact_section', `${BASEURL}/portfolio/specialisation/create`);
      await testAuthLinkNavigation('Contact', '/#contact_section', `${BASEURL}/portfolio/specialisation`);
    });
  
});


/* END TO END CRUD TESTS 
describe('Test CRUD operations on the Specialisation model', () => {
    test('Gets the specialisation create form', async () => {
        if (isConnected) {
            await testutils.loginAndNavigate(authoremail, authorpassword);
            await page.goto(`${BASEURL}/portfolio/specialisation/create`, {waitUntil: 'domcontentloaded'});
            const getauthorpage = await page.title();
            expect(getauthorpage).toMatch('Specialisation Form');
        }
    });

    async function selectOption(page, selectId, optionTextToSelect) {
        await page.evaluate((id, text) => {
          const select = document.querySelector(id);
          const options = Array.from(select.options);
          const option = options.find(option => option.innerText.includes(text));
          if (option) {
            select.value = option.value;
          }
        }, selectId, optionTextToSelect);
        await page.waitForTimeout(1000);
    }
      
    test('Test that specialisation form data is posted to database', async () => {
        if (isConnected) {
            await testutils.loginAndNavigate(authoremail, authorpassword);
            await page.goto(`${BASEURL}/portfolio/specialisation/create`, {waitUntil: 'domcontentloaded'});
            await expect(page).toMatchElement('#specialisationname');
            //fill in the specialisation form
            await page.type('#specialisationname', 'Testing Specialisation');
            await page.type('#specialisationdescription', 'This summarizes testing specialisation');

            //submit form
            await page.click('#projsubmitbutton');
           // Get the current URL after the redirect
            const currentUrl = page.url();
            console.log('current specialisation url', currentUrl);
            expect(currentUrl).toMatch('/portfolio/specialisation');
        }
    });
  
    test("Test that a specialisation can be deleted from database", async () => {
        if(isConnected){
            await testutils.loginAndNavigate(authoremail, authorpassword);
            await page.goto(`${BASEURL}/portfolio/specialisation`, {waitUntil: 'domcontentloaded'});
    
            //check the first-row first-column checkbox
            const firstcheckboxselector = '#spectable input[type="checkbox"]:first-child';
            //evaluate javascript code within the page context to check the checkbox
            await page.evaluate((selector) => {
            const firstcheckbox = document.querySelector(selector);
            if (firstcheckbox) {
                firstcheckbox.checked = true;
            }
            }, firstcheckboxselector);
    
            //click the delete button to remove the checked record
            await page.click('#specbtnDelete');
    
            // Wait for the confirmation dialog to appear
            await page.waitForSelector('#SpecdeleteConfirmationModal', { visible: true });
    
            // Click the delete button on the confirmation dialog
            await page.click('#SpecconfirmDeleteButton');
    
            const serverResponse = await page.evaluate(async (baseUrl) => {
            const response = await fetch(`${baseUrl}/portfolio/specialisation/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return response.json();
            } else {
                return null; // Return null for non-JSON responses
            }
            }, BASEURL);
            console.log('6. Specialisation delete response is', serverResponse);
    
            // Assert that the server response is not null and contains the expected success message
            expect(serverResponse).not.toBeNull();
            expect(serverResponse.success).toBe('Successfully Deleted');
        }
    });
  
    test('Test that you can update the specialisation document', async () => {
        if (isConnected) {
            await testutils.loginAndNavigate(authoremail, authorpassword);
            await page.goto(`${BASEURL}/portfolio/specialisation`, {waitUntil: 'domcontentloaded'});
            //click the update icon
            await page.click('.specedit')
            //test that the update page is shown
            await page.waitForSelector('#SpecUpdateModal', { visible: true });
            //fill in the specialisation form
            await page.type('#specialisationname', 'Testing Specialisation');
            await page.type('#specialisationdescription', 'This summarizes testing specialisation');

            //submit form
            await page.click('#specUpdatebtn');
            // Wait for the redirect to happen
            //Sawait page.waitForNavigation();
            // Get the current URL after the redirect
            const currentUrl = page.url();
            expect(currentUrl).toMatch('/portfolio/specialisation');
    
        }
    });
});

describe("test GET /specialisation: returns a list of all specialisations", () => { 
     
    //test1: returns 401 if no jwt is provided
    test("Return 401 if no user credentials", async () => {
        const token = jwt.sign({ role: 'testuser1' }, 'AUTH_SECRET_KEY');
        const response = await request(app)
            .get('/portfolio/specialisation')
            .set('Cookie', `jwtTokens=${token}`);
        expect(response.status).toBe(401);
    });

});*/