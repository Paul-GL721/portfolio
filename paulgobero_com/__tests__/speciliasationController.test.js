//import required modules
const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const testutils = require('../utils/testUtils');
const path = require('path');
const { BASEURL } = require('../configs/config');

jest.setTimeout(600000);

describe('Test that links on Specialisation Authenticated page work', () => {
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
        console.log('specialisation test title', getauthorpage);
        expect(getauthorpage).toBe('Portfolio');
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


/* END TO END CRUD TESTS */
describe('Test CRUD operations on the Specialisation model', () => {
    let isConnected;
    /*beforeAll(testutils.beforeAllTests);
    afterAll(testutils.afterAllTests);*/
  
    const authoremail = "test@gmail.com";
    const authorpassword = "test567";
    testutils.loginAndNavigate;
  
    test('Gets the specialisation create form', async () => {
        if (isConnected) {
            await loginAndNavigate();
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
            await loginAndNavigate();
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
            await loginAndNavigate()
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
            await loginAndNavigate()
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

});