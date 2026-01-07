
const request = require("supertest");
const myApp = require("../app");
const testutils = require("../utils/testUtils")
const session = require('supertest-session');
const Author = require('../models/author');
const Skill = require('../models/skill');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

var testSession = null;
let sampleSkill;

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
    //1. Create a sample specialisation and save it to the database
    sampleSkill = new Skill({ name: 'DevOps', description: 'Ability to deploy to apps', imageName: 'testcreateimgfilename.jpg' });
    sampleSkill.save();

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
    it('Get the skill form', function (done) {
        authenticatedSession.get('/portfolio/skill/create')
            .expect(200)
            .end(done)
    });
    

    it('Post data to the skill collection', function (done) {
        authenticatedSession.post('/portfolio/skill/create')
            .field('skillname', 'Technically DevOps')
            .field('skilldescription', 'Technically Ability to deploy to apps')
            .attach('photo1', fs.createReadStream(path.resolve(__dirname, '../public/images/img/project1.jpg')))
            .set('Content-Type', 'multipart/form-data') // Set the content type for file upload
            .expect(302)
            .end(done);
    });

    it('Get a list of available skill', function (done) {
        authenticatedSession.get('/portfolio/skill')
            .expect(200)
            .expect('Content-Type', /html/)
            .end(done)

    });

    it('Should successfully update a GET skill in the portfolio', async () => {
        //1. Update the skill name
        const updatedName = 'Updated Skill';
        sampleSkill.name = updatedName;
        sampleSkill.description = 'updated description';
        await sampleSkill.save();
        //2. Convert the id to string to be used in the res.query
        const upid = sampleSkill._id.toString()
        //3. Send the id to the given route
        const response = await authenticatedSession
            .get('/portfolio/skill/update')
            .query({ updateid: upid  });
        //4. Retrieve the updated skill from the database
        const updatedSkill = await Skill.findOne({ _id: upid }).exec();
        //5. Format createdAt and updatedAt as ISO 8601 strings
        const formatDateString = (date) => new Date(date).toISOString();
        // Using the spread format create a new array with a 
        //converted createdAt and updatedAt to formatted date strings
        const expectedSkill = {
            ...updatedSkill.toJSON(),
            createdAt: formatDateString(updatedSkill.createdAt),
            updatedAt: formatDateString(updatedSkill.updatedAt),
            _id: updatedSkill._id.toString(),
        };
        //6. Assert that the response contains the expected updated skill
        expect(response.status).toBe(200);
        //expect(response.body).toEqual(expectedSkill);   
    });
    
    it('Should successfully update a POST skill in the portfolio', async () => { 
        //Convert the id to string to be used in the res.query
        const upid = sampleSkill._id.toString()
        //Send the update date to the given route
        const response = await authenticatedSession
            .post('/portfolio/skill/update')
            .field('skillname', 'up Technical DevOps')
            .field('skilldescription', 'up Technically Ability to deploy to apps')
            .field('skillUpdateid', upid)
            .attach('photo1', fs.createReadStream(path.resolve(__dirname, '../public/images/img/project1.jpg')))
            .set('Content-Type', 'multipart/form-data') // Set the content type for file upload
            .expect(302);
        //Retrieve the updated specialisation from the database
        const updatedSkill = await Skill.findOne({ _id: upid }).exec();
        
        //Assert that the response contains the expected updated specialisation
        expect(response.status).toBe(302);
        const redirectPath = response.headers.location;
        expect(redirectPath).toBe('/portfolio/skill');
        expect(updatedSkill.name).toBe('up Technical DevOps');
        expect(updatedSkill.description).toBe('up Technically Ability to deploy to apps');
    });

    const geturls = [
        '/portfolio/skill/create',
        '/portfolio/skill',
        '/portfolio/skill/update'
    ];
    const posturls = [
        '/portfolio/skill/create',
        '/portfolio/skill/update',
        '/portfolio/skill/delete',
    ];
    
    //Using the authenticated session data, make the request, should fail with a 403
    for (const purl of posturls) {
        it(`Should return 403 error for unauthorized user trying to POST UPDATE Skill @ ${purl}`, async () => {
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
        it(`Should return 403 error for unauthorized user trying to GET UPDATE Skill  @ ${gurl}`, async () => {
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
        //Create a specialisation to delete and test the message from the json response  
        const delid = sampleSkill._id.toString();
        const response = await authenticatedSession
            .post('/portfolio/skill/delete')
            .send({skilid: delid  });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({success: "Successfully Deleted"});
        
    });
   
});











/*//import required modules
const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const testutils = require('../utils/testUtils');
const path = require('path');
const { BASEURL } = require('../configs/config');

jest.setTimeout(600000);

describe('Test that links on Skill Authenticated page work', () => {
    let isConnected;
    const authoremail = "test@gmail.com";
    const authorpassword = "test567";
  
    async function testAuthLinkNavigation(label, section, goto) {
      if (isConnected) {
        await testutils.loginAndNavigate(page);
        await page.goto(goto, { waitUntil: 'domcontentloaded' });
        const link = await page.$(`ul.navbar-nav li a.nav-link[href="${section}"]`);
        await page.waitForSelector(link);
        await link.click();
        await page.waitForNavigation();
        const getauthorpage = await page.title();
        console.log('skill test title', getauthorpage);
        expect(getauthorpage).toBe('Portfolio');
        const currentUrl = page.url();
        expect(currentUrl.endsWith(section)).toBeTruthy();
      }
    }
  
    test('Clicking the About link should navigate to the About section', async () => {
      await testAuthLinkNavigation('About', '/#about_section', `${BASEURL}/portfolio/skill/create`);
      await testAuthLinkNavigation('About', '/#about_section', `${BASEURL}/portfolio/skill`);
    });
    test('Clicking the Projects link should navigate to the Projects section', async () => {
      await testAuthLinkNavigation('Projects', '/#project_section', `${BASEURL}/portfolio/skill/create`);
      await testAuthLinkNavigation('Projects', '/#project_section', `${BASEURL}/portfolio/skill`);
    });
    test('Clicking the Skills link should navigate to the Skills section', async () => {
      await testAuthLinkNavigation('Skills', '/#skill_section', `${BASEURL}/portfolio/skill/create`);
      await testAuthLinkNavigation('Skills', '/#skill_section', `${BASEURL}/portfolio/skill`);
    });
    test('Clicking the Contact link should navigate to the Contact section', async () => {
      await testAuthLinkNavigation('Contact', '/#contact_section', `${BASEURL}/portfolio/skill/create`);
      await testAuthLinkNavigation('Contact', '/#contact_section', `${BASEURL}/portfolio/skill`);
    });
  
});


/* END TO END CRUD TESTS 
describe('Test CRUD operations on the Skill model', () => {
    let isConnected;
    /*beforeAll(testutils.beforeAllTests);
    afterAll(testutils.afterAllTests);
  
    const authoremail = "test@gmail.com";
    const authorpassword = "test567";
    testutils.loginAndNavigate;
  
    test('Gets the skill create form', async () => {
        if (isConnected) {
            await loginAndNavigate();
            await page.goto(`${BASEURL}/portfolio/skill/create`, {waitUntil: 'domcontentloaded'});
            const getauthorpage = await page.title();
            expect(getauthorpage).toBe('Create Skill');
        }
    });
      
    test('Test that skill form data is posted to database', async () => {
        if (isConnected) {
            await loginAndNavigate();
            await page.goto(`${BASEURL}/portfolio/skill/create`, {waitUntil: 'domcontentloaded'});
            await expect(page).toMatchElement('#skillname');
            //fill in the specialisation form
            await page.type('#skillname', 'Testing Skill');
            await page.type('#skilldescription', 'This summarizes testing skill');
            //upload images 
            console.log("imageInput");
            const imageInput = await page.$('#photo1');
            const imagePath = path.resolve(__dirname, '../public/images/img/project1.jpg');
            await imageInput.uploadFile(imagePath);
            console.log(imagePath);
            //submit form
            await page.click('#skillsubmitbutton');
           // Get the current URL after the redirect
            const currentUrl = page.url();
            console.log('current skill url', currentUrl);
            expect(currentUrl).toMatch('/portfolio/skill');
        }
    });
  
    test("Test that a skill can be deleted from database", async () => {
        if(isConnected){
            await loginAndNavigate()
            await page.goto(`${BASEURL}/portfolio/skill`, {waitUntil: 'domcontentloaded'});
    
            //check the first-row first-column checkbox
            const firstcheckboxselector = '#skilltable input[type="checkbox"]:first-child';
            //evaluate javascript code within the page context to check the checkbox
            await page.evaluate((selector) => {
            const firstcheckbox = document.querySelector(selector);
            if (firstcheckbox) {
                firstcheckbox.checked = true;
            }
            }, firstcheckboxselector);
    
            //click the delete button to remove the checked record
            await page.click('#skillbtnDelete');
    
            // Wait for the confirmation dialog to appear
            await page.waitForSelector('#skilldeleteConfirmationModal', { visible: true });
    
            // Click the delete button on the confirmation dialog
            await page.click('#skillconfirmDeleteButton');
    
            const serverResponse = await page.evaluate(async (baseUrl) => {
            const response = await fetch(`${baseUrl}/portfolio/skill/delete`, {
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
  
    test('Test that you can update the skill document', async () => {
        if (isConnected) {
            await loginAndNavigate()
            await page.goto(`${BASEURL}/portfolio/skill`, {waitUntil: 'domcontentloaded'});
            //click the update icon
            await page.click('.skilledit')
            //test that the update page is shown
            await page.waitForSelector('#skillUpdateModal', { visible: true });
            //fill in the specialisation form
            await page.type('#skillname', 'Testing Skill');
            await page.type('#skilldescription', 'This summarizes testing skill');
            //upload images 
            console.log("imageInput");
            const imageInput = await page.$('#photo1');
            const imagePath = path.resolve(__dirname, '../public/images/img/project1.jpg');
            await imageInput.uploadFile(imagePath);
            console.log(imagePath);

            //submit form
            await page.click('#skillUpdatebtn');
            // Wait for the redirect to happen
            //Sawait page.waitForNavigation();
            // Get the current URL after the redirect
            const currentUrl = page.url();
            expect(currentUrl).toMatch('/portfolio/skill');
        }
    });
});*/