
//import required modules
const request = require('supertest');
const jwt = require('jsonwebtoken');
const testutils = require('../utils/testUtils');
const { BASEURL } = require('../configs/config');
const Author = require('../models/author');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const myApp = require("../app");
const { test } = require('node:test');


jest.setTimeout(600000);
let isConnected;
let jwtToken;
const authoremail = "test@gmail.com";
const authorpassword = "test567";


function imageToString(filepath) {
    //read image file
    const imagePath = path.resolve(__dirname, filepath);
    const imageData = fs.readFileSync(imagePath);
    //convert the imagedata to string
    const imageString = imageData.toString('base64');
    return imageString;
}

async function login(page) {
    // Replace these with your login page URL and credentials
    const loginUrl = `${BASEURL}/portfolio/login`;
    const username = authoremail;
    const password = authorpassword;
  
    await page.goto(loginUrl);
    await page.waitForSelector('#loginemail');
    await page.type('#loginemail', username);
    await page.type('#loginpasswd', password);
    await page.click('#loginbtn');
    await page.waitForNavigation({ timeout: 800000, waitUntil: 'domcontentloaded' });
}

describe("Specialiasation e2e Tests", () => {

    it('Should login and GET access to specialisation/create authorized page', async () => {
        // Simulate login
        await login(page);
        const authenticatedPageUrl = `${BASEURL}/portfolio/specialisation/create`;
        const jwtTokenCookie = await page.evaluate(() => {
            return document.cookie.includes('jwtTokens');
        });
        if (jwtTokenCookie) {
            console.log('get Projects jwt token is available ', jwtTokenCookie);
            // Access authenticated page
            await page.goto(authenticatedPageUrl);
            // Test authenticated page using Puppeteer APIs
            const getpagetitle = await page.title();
            expect(getpagetitle).toMatch('Specialisation Form');
        }
    });

    it('Should login and POST from specialisation/create authorized page', async () => {
        // Simulate login
        await login(page);
        const authenticatedPageUrl = `${BASEURL}/portfolio/specialisation/create`;
        const jwtTokenCookie = await page.evaluate(() => {
            return document.cookie.includes('jwtTokens');
        });
        if (jwtTokenCookie) {
            console.log('post Projects jwt token is available ', jwtTokenCookie);
            // Access authenticated page
            await page.goto(authenticatedPageUrl);
            await expect(page).toMatchElement('#specialisationname');
            //fill in the specialisation form
            await page.type('#specialisationname', 'Testing Specialisation');
            await page.type('#specialisationdescription', 'This summarizes testing specialisation');
            //submit form
            await page.click('#specialisationsubmitbutton');
            // Get the current URL after the redirect
            const currentUrl = page.url();
            console.log('current specialisation url', currentUrl);
            expect(currentUrl).toMatch('/portfolio/specialisation');
            //Run assertions
            const postpagetitle = await page.title();
            expect(postpagetitle).toMatch('Specialisation details');
        }
    });

    it('Should login and DELETE from /specialisation authorized page', async () => {
        // Simulate login
        await login(page);
        const authenticatedPageUrl = `${BASEURL}/portfolio/specialisation`;
        const jwtTokenCookie = await page.evaluate(() => {
            return document.cookie.includes('jwtTokens');
        });
        if (jwtTokenCookie) {
            console.log('delete Projects jwt token is available ', jwtTokenCookie);
            // Access authenticated page
            await page.goto(authenticatedPageUrl);
            await expect(page).toMatchElement('#spectable');
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

    it('Should login and UPDATE /specialisation authorized page', async () => {
        // Simulate login
        await login(page);
        const authenticatedPageUrl = `${BASEURL}/portfolio/specialisation`;
        const jwtTokenCookie = await page.evaluate(() => {
            return document.cookie.includes('jwtTokens');
        });
        if (jwtTokenCookie) {
            console.log('update Projects jwt token is available ', jwtTokenCookie);
            // Access authenticated page
            await page.goto(authenticatedPageUrl);
            await expect(page).toMatchElement('.specedit');
            //check the first-row first-column checkbox
            const firstcheckboxselector = '#spectable input[type="checkbox"]:first-child';
            //evaluate javascript code within the page context to check the checkbox
            await page.evaluate((selector) => {
            const firstcheckbox = document.querySelector(selector);
            if (firstcheckbox) {
                firstcheckbox.checked = true;
            }
            }, firstcheckboxselector);
            //click the update icon
            await page.click('.specedit')
            //test that the update page is shown
            await page.waitForSelector('#SpecUpdateModal', { visible: true });
            //fill in the specialisation form
            await page.type('#specialisationname', 'Update: Testing Specialisation');
            await page.type('#specialisationdescription', 'Update: This summarizes testing specialisation');

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

/*describe('Authenticated and Authorized Page Access', () => {
  let jwtToken;

  // Function to authenticate and get JWT token
  const login = async () => {
    const loginResponse = await request(myApp)
      .post(`${BASEURL}/portfolio/login`) // Replace with the endpoint for your login route
      .send({ email: authoremail, password: authorpassword }); // Replace with valid login credentials

    jwtToken = loginResponse.body.jwtTokens.jwt;
  };

  beforeEach(async () => {
    // Authenticate before running the tests
    await login();
  });

    it('should access an authenticated page', async () => {
        const response = await request(app)
            .get('/authenticated-page') // Replace with the endpoint for your authenticated page
            .set('Cookie', [`jwtTokens=${jwtToken}`]);

        expect(response.status).toBe(200);
        // Add more assertions to check the content or behavior of the authenticated page
    });
});*/




/*describe('Test that links on Specialisation Authenticated page work', () => {
  
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
      await testAuthLinkNavigation('About', '/about_section', `${BASEURL}/portfolio/specialisation/create`);
      await testAuthLinkNavigation('About', '/about_section', `${BASEURL}/portfolio/specialisation`);
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
  
});*/


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
});*/
