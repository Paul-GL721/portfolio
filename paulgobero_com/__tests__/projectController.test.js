
const request = require("supertest");
const myApp = require("../app");
const testutils = require("../utils/testUtils")
const session = require('supertest-session');
const Author = require('../models/author');
const Project = require('../models/project');
const Skill = require('../models/skill');
const Specialisation = require('../models/specialisation');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

var testSession = null;
let sampleProject;
let sampleSkill;
let sampleSpecialisation;
var authenticatedSession;
let projimagename;
let projvideoname;
let updateprojimagename;
let updateprojvideoname;

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
        hostName: 'https://jestjs.io/docs/mongodb',
        yourKeyword: ['testKeyword'],
        email: 'test4@gmail.com',
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
      hostName: 'https://jestjs.io/docs/mongodb3',
      yourKeyword: ['testKeyworder', 'testKeyword2'],
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
  sampleSkill = new Skill({ name: 'DevOps', description: 'Ability to deploy to apps', imageName: 'testcreateimgfilename.jpg' });
  sampleSkill.save();

  sampleSpecialisation = new Specialisation({ name: 'PostFrontend', description: 'Ability to perform frontend designs' });
  sampleSpecialisation.save();

  //1. Create a sample project and save it to the database
  sampleProject = new Project({
    ptitle: 'sample project',
    psummary: 'This summarises the sample project',
    problemStatement: 'The problem that solves the sample project',
    solution: 'THis is the solution to the sample project',
    role: 'testing',
    githubUrl: 'https://jestjs.io/docs/puppeteer',
    livelinkUrl: 'https://jestjs.io/docs/puppeteer',
    contributor: 'testing contrib',
    skill: sampleSkill._id,
    author: sampleSkill._id,
    specialisation: sampleSpecialisation._id,
    projectDates: {
      startDate: '2022-01-01',
      endDate: '2022-12-31',
    },
    checked: true,
    mediaName: {
      imageName:  imageToString('../public/images/img/project1.jpg'),
      videoName: imageToString('../public/videos/video1.mp4')
    }
  });
  sampleProject.save();

  testSession = session(myApp);
  testSession.post('/portfolio/login')
    .send({ email: "test4@gmail.com", password: "test567" })
    .expect(200)
    .end(function (err) {
        if (err) return done(err);
        authenticatedSession = testSession;
        return done();
    })
});


describe('Acessing authenticated pages', function () {
  it('Get the Project form', function (done) {
    authenticatedSession.get('/portfolio/project/create')
      .expect(200)
      .end(done)
  });
    

  it('Post data to the project collection', function (done) {
    const skiz = sampleSkill._id.toString()
    const specz = sampleSpecialisation._id.toString()
    const authz = sampleSkill._id.toString()
    authenticatedSession.post('/portfolio/project/create')
      .field("projtitle", "post Project title")
      .field("projsummary", "post Project summary")
      .field("projproblem", "post What problem was the project solving?")
      .field("projsoln", "post What solution did you provide?")
      .field("prorole", "post Your contribution to this project is required")
      .field("progithub", "https://jestjs.io/docs/puppeteer")
      .field("prolivelink", "https://jestjs.io/docs/puppeteer")
      .field("proskills", skiz)
      .field("projspecialisation", specz)
      .field("projauthor", authz)
      .field("projcontibutor", "post Any other authors")
      .attach('photo1', fs.createReadStream(path.resolve(__dirname, '../public/images/img/project1.jpg')))
      .attach('video1', fs.createReadStream(path.resolve(__dirname, '../public/videos/video1.mp4')))
      .set('Content-Type', 'multipart/form-data')
      .expect(302)
      .end(done);
  });

  it('Get a list of available projects', function (done) {
    authenticatedSession.get('/portfolio/project')
      .expect(200)
      .expect('Content-Type', /html/)
      .end(done)
  });

  it('Should successfully update a GET project in the portfolio', async () => {
    //1. Update the author name
    const updatedName = 'Updated project';
    sampleProject.ptitle = updatedName;
    sampleProject.psummary = 'updated suammary';
    await sampleProject.save();
    //2. Convert the id to string to be used in the res.query
    const upid = sampleProject._id.toString()
    //3. Send the id to the given route
    const response = await authenticatedSession
        .get('/portfolio/project/update')
        .query({ updateid: upid  });
    //4. Retrieve the updated author from the database
    const updatedProject = await Project.findOne({ _id: upid }).exec();
    //5. Format createdAt and updatedAt as ISO 8601 strings
    const formatDateString = (date) => new Date(date).toISOString();
    // Using the spread format create a new array with a 
    //converted createdAt and updatedAt to formatted date strings
    const expectedproject = {
      ...updatedProject.toJSON(),
      createdAt: formatDateString(updatedProject.createdAt),
      updatedAt: formatDateString(updatedProject.updatedAt),
      _id: updatedProject._id.toString(),
    };
    //6. Assert that the response contains the expected updated author
    expect(response.status).toBe(200);
    //expect(response.body).toEqual(expectedauthor);   
  });
    
  it('Should successfully update a POST project in the portfolio', async () => { 
    //Convert the id to string to be used in the res.query
    const upid = sampleProject._id.toString()
    const skiz = sampleSkill._id.toString()
    const specz = sampleSpecialisation._id.toString()
    const authz = sampleSkill._id.toString()
    //Send the update date to the given route
    const response = await authenticatedSession
      .post('/portfolio/project/update')
      .field("projtitle", "post Project title")
      .field("projsummary", "post Project summary")
      .field("projproblem", "post What problem was the project solving?")
      .field("projsoln", "post What solution did you provide?")
      .field("prorole", "post Your contribution to this project is required")
      .field("progithub", "https://jestjs.io/docs/puppeteer")
      .field("prolivelink", "https://jestjs.io/docs/puppeteer")
      .field("proskills", skiz)
      .field("projspecialisation", specz)
      .field("projauthor", authz)
      .field("projcontibutor", "post Any other authors")
      .field('projectUpdateid', upid)
      .attach('photo1', fs.createReadStream(path.resolve(__dirname, '../public/images/img/project1.jpg')))
      .attach('video1', fs.createReadStream(path.resolve(__dirname, '../public/videos/video1.mp4')))
      .set('Content-Type', 'multipart/form-data')
      .expect(302);
    //Retrieve the updated project from the database
    const updatedProject = await Project.findOne({ _id: upid }).exec();
    
    //Assert that the response contains the expected updated specialisation
    expect(response.status).toBe(302);
    const redirectPath = response.headers.location;
    expect(redirectPath).toBe('/portfolio/project');
    expect(updatedProject.ptitle).toBe('post Project title');
    expect(updatedProject.psummary).toBe('post Project summary');
  });

  const geturls = [
    '/portfolio/project/create',
    '/portfolio/project',
    '/portfolio/project/update'
  ];
  const posturls = [
    '/portfolio/project/create',
    '/portfolio/project/delete',
  ];
  
  //Using the authenticated session data, make the request, should fail with a 403
  for (const purl of posturls) {
      it(`Should return 403 error for unauthorized user trying to POST UPDATE proejct @ ${purl}`, async () => {
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
      it(`Should return 403 error for unauthorized user trying to GET UPDATE proejct  @ ${gurl}`, async () => {
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
    const delid = sampleProject._id.toString();
    const response = await authenticatedSession
        .post('/portfolio/project/delete')
        .send({skilid: delid  });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({success: "Successfully Deleted"});
      
  });
});


/*const testutils = require('../utils/testUtils');
const path = require('path');
const { BASEURL } = require('../configs/config');

jest.setTimeout(600000);
describe('Test that links on Project Authenticated page work', () => {
    let isConnected;
    const authoremail = "test4@gmail.com";
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
  
    const authoremail = "test4@gmail.com";
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