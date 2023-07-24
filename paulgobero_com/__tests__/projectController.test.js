
/*const testutils = require('../utils/testUtils');
const path = require('path');
const { BASEURL } = require('../configs/config');

jest.setTimeout(600000);
describe('Test that links on Project Authenticated page work', () => {
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
        console.log('project test title', getauthorpage);
        expect(getauthorpage).toBe('Portfolio');
        const currentUrl = page.url();
        expect(currentUrl.endsWith(section)).toBeTruthy();
      }
    }
  
    test('Clicking the About link should navigate to the About section', async () => {
      await testAuthLinkNavigation('About', '/#about_section', `${BASEURL}/portfolio/project/create`);
      await testAuthLinkNavigation('About', '/#about_section', `${BASEURL}/portfolio/project`);
    });
    test('Clicking the Projects link should navigate to the Projects section', async () => {
      await testAuthLinkNavigation('Projects', '/#project_section', `${BASEURL}/portfolio/project/create`);
      await testAuthLinkNavigation('Projects', '/#project_section', `${BASEURL}/portfolio/project`);
    });
    test('Clicking the Skills link should navigate to the Skills section', async () => {
      await testAuthLinkNavigation('Skills', '/#skill_section', `${BASEURL}/portfolio/project/create`);
      await testAuthLinkNavigation('Skills', '/#skill_section', `${BASEURL}/portfolio/project`);
    });
    test('Clicking the Contact link should navigate to the Contact section', async () => {
      await testAuthLinkNavigation('Contact', '/#contact_section', `${BASEURL}/portfolio/project/create`);
      await testAuthLinkNavigation('Contact', '/#contact_section', `${BASEURL}/portfolio/project`);
    });
  
});


/* END TO END CRUD TESTS 
describe('Test CRUD operations on the Project model', () => {
    let isConnected;
    /*beforeAll(testutils.beforeAllTests);
    afterAll(testutils.afterAllTests);
  
    const authoremail = "test@gmail.com";
    const authorpassword = "test567";
    testutils.loginAndNavigate;
  
    test('Gets the project create form', async () => {
        if (isConnected) {
            await loginAndNavigate();
            await page.goto(`${BASEURL}/portfolio/project/create`, {waitUntil: 'domcontentloaded'});
            const getauthorpage = await page.title();
            expect(getauthorpage).toMatch('Project Form');
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
      
    test('Test that project form data is posted to database', async () => {
        if (isConnected) {
            await loginAndNavigate();
            await page.goto(`${BASEURL}/portfolio/project/create`, {waitUntil: 'domcontentloaded'});
            await expect(page).toMatchElement('select#projauthor');
            //fill in the project form
            await page.type('#projtitle', 'Testing project');
            await page.type('#projsummary', 'This summarizes testing project');
            await page.type('#projproblem', 'This is the testing project problem statement');
            await page.type('#projsoln', 'This is the solution to the test problem');
            await page.type('#prorole', 'This was my test role');
            await page.type('#progithub', 'https://chat.openai.com/?model=text-davinci-002-render-sha');
            await page.type('#prolivelink', 'https://chat.openai.com/?model=text-davinci-002-render-sha');
            await selectOption(page, '#proskills', 'MySQL');
            await selectOption(page, '#projspecialisation', 'Frontend');
            await selectOption(page, '#projauthor', 'Johnny Mitch Longly');
            await page.type('#projcontibutor', 'other test authors');
            
            //upload image and video 
            console.log("imageInput");
            const imageInput = await page.$('#photo1');
            const imagePath = path.resolve(__dirname, '../public/images/img/project1.jpg');
            await imageInput.uploadFile(imagePath);
            console.log('Project image path is ', imagePath); 

            const videoInput = await page.$('#video1');
            const videoPath = path.resolve(__dirname, '../public/images/img/project1.jpg');
            await videoInput.uploadFile(imagePath);
            console.log('project video path is ', videoPath);

            //submit form
            await page.click('#projsubmitbutton');
           // Get the current URL after the redirect
            const currentUrl = page.url();
            console.log('current project url', currentUrl);
            expect(currentUrl).toMatch('/portfolio/project');
        }
    });
  
    test("Test that a project can be deleted from database", async () => {
        if(isConnected){
            await loginAndNavigate()
            await page.goto(`${BASEURL}/portfolio/project`, {waitUntil: 'domcontentloaded'});
    
            //check the first-row first-column checkbox
            const firstcheckboxselector = '#projecttable input[type="checkbox"]:first-child';
            //evaluate javascript code within the page context to check the checkbox
            await page.evaluate((selector) => {
            const firstcheckbox = document.querySelector(selector);
            if (firstcheckbox) {
                firstcheckbox.checked = true;
            }
            }, firstcheckboxselector);
    
            //click the delete button to remove the checked record
            await page.click('#projectbtnDelete');
    
            // Wait for the confirmation dialog to appear
            await page.waitForSelector('#projdeleteConfirmationModal', { visible: true });
    
            // Click the delete button on the confirmation dialog
            await page.click('#projconfirmDeleteButton');
    
            const serverResponse = await page.evaluate(async (baseUrl) => {
            const response = await fetch(`${baseUrl}/portfolio/project/delete`, {
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
            console.log('6. Project delete response is', serverResponse);
    
            // Assert that the server response is not null and contains the expected success message
            expect(serverResponse).not.toBeNull();
            expect(serverResponse.success).toBe('Successfully Deleted');
        }
    });
  
    test('Test that you can update the project record', async () => {
        if (isConnected) {
            await loginAndNavigate()
            await page.goto(`${BASEURL}/portfolio/project`, {waitUntil: 'domcontentloaded'});
            //click the update icon
            await page.click('.projectedit')
            //test that the update page is shown
            await page.waitForSelector('#projectUpdateModal', { visible: true });
            //fill in the project update form
            await page.type('#projtitle', 'Testing project update');
            await page.type('#projsummary', 'This summarizes testing project update');
            await page.type('#projproblem', 'This is the testing project update problem statement');
            await page.type('#projsoln', 'This is the solution to the test problem update');
            await page.type('#prorole', 'This was my test role update');
            await page.type('#progithub', 'https://chat.openai.com/?model=text-davinci-002-render-sha');
            await page.type('#prolivelink', 'https://chat.openai.com/?model=text-davinci-002-render-sha');
            await selectOption(page, '#proskills', 'MySQL');
            await selectOption(page, '#projspecialisation', 'Frontend');
            await selectOption(page, '#projauthor', 'Johnny Mitch Longly');
            await page.type('#projcontibutor', 'other test authors');
            
            //upload image and video 
            console.log("imageInput");
            const imageInput = await page.$('#photo1');
            const imagePath = path.resolve(__dirname, '../public/images/img/project1.jpg');
            await imageInput.uploadFile(imagePath);
            console.log('Project image path is ', imagePath); 

            const videoInput = await page.$('#video1');
            const videoPath = path.resolve(__dirname, '../public/images/img/project1.jpg');
            await videoInput.uploadFile(imagePath);
            console.log('project video path is ', videoPath);

            //submit form
            await page.click('#projectUpdatebtn');
            // Wait for the redirect to happen
            //Sawait page.waitForNavigation();
            // Get the current URL after the redirect
            const currentUrl = page.url();
            expect(currentUrl).toMatch('/portfolio/project');
    
        }
    });
});*/