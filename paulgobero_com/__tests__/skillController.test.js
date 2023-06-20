//import required modules
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


/* END TO END CRUD TESTS */
describe('Test CRUD operations on the Skill model', () => {
    let isConnected;
    /*beforeAll(testutils.beforeAllTests);
    afterAll(testutils.afterAllTests);*/
  
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
});