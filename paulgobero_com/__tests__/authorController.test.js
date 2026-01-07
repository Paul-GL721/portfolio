
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
let sampleAuthor;

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
        hostName: 'https://jestjs.io/docs/mongodb',
        yourKeyword: ['testKeyword'],
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
  //1. Create a sample specialisation and save it to the database
  sampleAuthor = new Author({ name: {
    first: 'testJohnny',
    middle: 'testMitch',
    last: 'Longly'
    },
    about: {
        short_description: 'Test user',
        full_description: 'User created to test select options'
    },
    brandName: 'Johnny',
    hostName: 'https://jestjs.io/docs/mongodb4',
    yourKeyword: ['testKeyworder', 'testKeyword2'],
    email: 'testmitch3@jonny.com',
    password: 'testjony67',
    authorStatus: 'normaluser',
    authorRole: 'member',
    socialmedia: {
        github: 'https://jestjs.io/docs/mongodb',
        linkedin: 'https://jestjs.io/docs/mongodb'
    },
    imageName: imageToString('../public/images/img/project1.jpg')
  });
  sampleAuthor.save();

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
  it('Get the Author form', function (done) {
    authenticatedSession.get('/portfolio/author/create')
      .expect(200)
      .end(done)
  });
    

  it('Post data to the author collection', function (done) {
    authenticatedSession.post('/portfolio/author/create')
      .field("authorfirstname", "testFirstName")
      .field("authormiddlename", "testMiddleName")
      .field("authorlastname", "testLastName")
      .field("authorshortdesc", "test short description about you")
      .field("authorfulldesc", "test more about yourself")
      .field("authorbrandname", "test brand name")
      .field("authorhostname", "https://jestjs.io/docs/mongodb4")
      .field("authorkeywords", "testKeyworder,testKeyword2")
      .field("authorstatus", "testAuthorStatus")
      .field("authorRole", "testAuthorRole")
      .field("authorpassword", "testAuthorRole")
      .field("githuburl", "https://jestjs.io/docs/puppeteer")
      .field("linkeninurl", "https://jestjs.io/docs/puppeteer")
      .field("authoremail", "test@testAuthorEmail.com")
      .attach('photo1', fs.createReadStream(path.resolve(__dirname, '../public/images/img/project1.jpg')))
      .set('Content-Type', 'multipart/form-data')
      .expect(302)
      .end(done);
  });

    it('Get a list of available authors', function (done) {
      authenticatedSession.get('/portfolio/author')
        .expect(200)
        .expect('Content-Type', /html/)
        .end(done)
    });

    it('Should successfully update a GET author in the portfolio', async () => {
      //1. Update the author name
      const updatedName = 'Updated author';
      sampleAuthor.first = updatedName;
      sampleAuthor.about.short_description = 'updated description';
      await sampleAuthor.save();
      //2. Convert the id to string to be used in the res.query
      const upid = sampleAuthor._id.toString()
      //3. Send the id to the given route
      const response = await authenticatedSession
          .get('/portfolio/author/update')
          .query({ updateid: upid  });
      //4. Retrieve the updated author from the database
      const updatedAuthor = await Author.findOne({ _id: upid }).exec();
      //5. Format createdAt and updatedAt as ISO 8601 strings
      const formatDateString = (date) => new Date(date).toISOString();
      // Using the spread format create a new array with a 
      //converted createdAt and updatedAt to formatted date strings
      const expectedauthor = {
        ...updatedAuthor.toJSON(),
        createdAt: formatDateString(updatedAuthor.createdAt),
        updatedAt: formatDateString(updatedAuthor.updatedAt),
        _id: updatedAuthor._id.toString(),
      };
      //6. Assert that the response contains the expected updated author
      expect(response.status).toBe(200);
      //expect(response.body).toEqual(expectedauthor);   
    });
    
    it('Should successfully update a POST author in the portfolio', async () => { 
      //Convert the id to string to be used in the res.query
      const upid = sampleAuthor._id.toString()
      //Send the update date to the given route
      const response = await authenticatedSession
        .post('/portfolio/author/update')
        .field("authorfirstname", "up Technical DevOps")
        .field("authormiddlename", "testMiddleName")
        .field("authorlastname", "testLastName")
        .field("authorshortdesc", "test short description about you")
        .field("authorfulldesc", "up Technically Ability to deploy to apps")
        .field("authorbrandname", "test brand name")
        .field("authorhostname", "https://jestjs.io/docs/mongodb4")
        .field("authorkeywords", "testKeyworder,testKeyword2")
        .field("authorstatus", "testAuthorStatus")
        .field("authorRole", "testAuthorRole")
        .field("authorpassword", "testAuthorRole")
        .field("githuburl", "https://jestjs.io/docs/puppeteer")
        .field("linkeninurl", "https://jestjs.io/docs/puppeteer")
        .field("authoremail", "test2@testAuthorEmail.com")
        .field('authorUpdateid', upid)
        .attach('photo1', fs.createReadStream(path.resolve(__dirname, '../public/images/img/project1.jpg')))
        .set('Content-Type', 'multipart/form-data')
        .expect(302);
      //Retrieve the updated specialisation from the database
      const updatedAuthor = await Author.findOne({ _id: upid }).exec();
      
      //Assert that the response contains the expected updated specialisation
      expect(response.status).toBe(302);
      const redirectPath = response.headers.location;
      expect(redirectPath).toBe('/portfolio/author');
      expect(updatedAuthor.name.first).toBe('up Technical DevOps');
      expect(updatedAuthor.about.full_description).toBe('up Technically Ability to deploy to apps');
    });

    const geturls = [
      '/portfolio/author/create',
      '/portfolio/author',
      '/portfolio/author/update'
    ];
    const posturls = [
      '/portfolio/author/create',
      '/portfolio/author/delete',
    ];
    
    //Using the authenticated session data, make the request, should fail with a 403
    for (const purl of posturls) {
        it(`Should return 403 error for unauthorized user trying to POST UPDATE author @ ${purl}`, async () => {
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
        it(`Should return 403 error for unauthorized user trying to GET UPDATE author  @ ${gurl}`, async () => {
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
        const delid = sampleAuthor._id.toString();
        const response = await authenticatedSession
            .post('/portfolio/author/delete')
            .send({skilid: delid  });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({success: "Successfully Deleted"});
        
    });
   
});


/*const { BASEURL} = require('../configs/config');
const path = require('path');
const testutils = require('../utils/testUtils');

jest.setTimeout(600000);
let isConnected;
const authoremail = "test@gmail.com";
const authorpassword = "test567";*/


/* END TO END TESTS 
describe('Index pages (portfolio/)', () => {
  beforeAll(async () => {
    await testutils.beforeAllTests(); 
    await page.goto(`${BASEURL}/`, { waitUntil: 'domcontentloaded' });
    //await testutils.beforeAllTests(); 
  });
  
  afterAll(
    testutils.afterAllTests
  );

  test('/ page should be titled "Portfolio" or "Default Page"', async () => {
    if (isConnected) {
      await page.goto(`${BASEURL}/`, {waitUntil: 'domcontentloaded'});
      const title = await page.title();
      expect(title).toMatch(/Portfolio|Default Page/);
    }
  });
  
  //tests specific to the index page
  describe('Default page specific tests', () => { 

    //tests for navbar buttons
    testNavbarBtns('#about_section', '#project_section', '#skill_section', '#contact_section', `${BASEURL}/` ); 
    //run tests if the default is loaded
    test('Run tests against default page', async () => {
      if (isConnected) {
        //check if the rendering page is the default
        await page.goto(`${BASEURL}/portfolio/`, {waitUntil: 'domcontentloaded'});
        //const isDefaultpage = await page.$('#defaultpage');
        const isDefaultpage  = await page.evaluate(() => {
          return document.querySelector('#defaultpage') !== null;
        });
        console.log('isdefaultpage', isDefaultpage);
        if (isDefaultpage) {
          const title = await page.title();
          expect(title).toBe('Default Page'); 
        }
      }
    });
  });
  //tests specific to the index page
  describe('Index page specific tests', () => {
    //tests for navbar buttons
    testNavbarBtns('#about_section', '#project_section', '#skill_section', '#contact_section', `${BASEURL}/` ); 
    //use for loop to test login/out buttons links
    const btnlinks = [
      { label: 'Admin login', labelid: '#projectlogin', loginbtn:'#loginbtn', pagetitle:'Login' },
      { label: 'Create Demo User', labelid: '#projectcreatedemouser', loginbtn:'#demousersubmitbutton', pagetitle:'Demo user' }
    ];
    for(const btnlink of btnlinks){
      test(`Clicking the ${btnlink.label} button, should display the ${btnlink.pagetitle} page`, async () => {
        const isIndexpage  = await page.evaluate(() => {
          return document.querySelector('#indexpage') == true;
        });
        console.log('isIndexpage', isIndexpage);
        if (isIndexpage) { 
          await page.goto(`${BASEURL}/portfolio/`, {waitUntil: 'domcontentloaded'});
          const btnid = await page.$(btnlink.labelid);
          await page.waitForSelector(btnlink.labelid);
          await btnid.click();
          //wait for page to load
          await page.waitForNavigation();
          //check if page is shown
          const logbtn = await page.$(btnlink.loginbtn);
          const logpagetitle = await page.title();
          expect(logbtn).not.toBeNull();
          expect(logpagetitle).toMatch(btnlink.pagetitle)
        }
      })
    }
  });
});


async function testNavbarBtns(about, project, skill, contact, gotopage) {
  //use for loop to test navbar button links
  const links = [
    { label: 'About', section: about },
    { label: 'Projects', section: project },
    { label: 'Skills', section: skill },
    { label: 'Contact', section: contact },
  ];
  for (const link of links) {
    it(`Clicking the ${link.label} link should navigate to the ${link.section} section`, async () => {
      await page.goto(gotopage, {waitUntil: 'domcontentloaded'});
      const btn = await page.$(`ul.navbar-nav li a.nav-link[href="${link.section}"]`);
      await btn.click();
      await page.waitForSelector(link.section);
      const section = await page.$(link.section);
      expect(section).not.toBeNull();
    });
  }
}


/*describe('Test that links on Author Authenticated page work', () => {
  let isConnected;

  const authoremail = "test@gmail.com";
  const authorpassword = "test567";

  async function testAuthLinkNavigation(about, project, skill, contact, gotopage) {
    //use for loop to test navbar button links
    const links = [
      { label: 'About', section: about },
      { label: 'Projects', section: project },
      { label: 'Skills', section: skill },
      { label: 'Contact', section: contact },
    ];
    for (const link of links) {
      test(`Clicking the ${link.label} link should navigate to the ${link.section} section`, async () => {
        if(isConnected) {
          const authoremail = "test@gmail.com";
          const authorpassword = "test567";
        
          await testutils.loginAndNavigate(authoremail, authorpassword);
          console.log('Testing links connection to db?', isConnected)
          await page.goto(gotopage, { waitUntil: 'domcontentloaded' });
          const linkbtn = await page.$(`a.nav-link[href="${link.section}"]`);
          console.log('btn is', linkbtn);
          await page.waitForSelector(linkbtn);
          await linkbtn.click();
          await page.waitForNavigation();
          const getauthorpage = await page.title();
          console.log('project test title', getauthorpage);
          expect(getauthorpage).toBe('Portfolio');
          const currentUrl = page.url();
          expect(currentUrl.endsWith(link.section)).toBeTruthy();

        }      
      });
    }
  }
  
  testAuthLinkNavigation('/#about_section', '/#project_section', '/#skill_section', '/#contact_section',  `${BASEURL}/portfolio/author/create`);

});

describe('Test that links on Author Authenticated page work', () => {
  async function testAuthLinkNavigation(section, goto) {
    if (isConnected) {
      await testutils.loginAndNavigate(authoremail, authorpassword);
      await page.goto(goto, { waitUntil: 'domcontentloaded' });
      const link = await page.$(`a.nav-link[href="${section}"]`);
      await page.waitForSelector(link);
      await link.click();
      await page.waitForNavigation();
      const currentUrl = page.url();
      expect(currentUrl.endsWith(section)).toBeTruthy();
      const isSectionLoaded = await page.$(`#${section}`);
      expect(isSectionLoaded).toBeNull();
      const getauthorpage = await page.title();
      console.log('Author test title', getauthorpage);
      expect(getauthorpage).toBe('Portfolio');
    }
  }

  test('Clicking the About link should navigate to the About section', async () => {
    testAuthLinkNavigation('about_section', `${BASEURL}/portfolio/author/create`);
    testAuthLinkNavigation('/#about_section', `${BASEURL}/portfolio/author`);
  });
  test('Clicking the Projects link should navigate to the Projects section', async () => {
    testAuthLinkNavigation('/#project_section', `${BASEURL}/portfolio/author/create`);
    testAuthLinkNavigation('/#project_section', `${BASEURL}/portfolio/author`);
  });
  test('Clicking the Skills link should navigate to the Skills section', async () => {
    testAuthLinkNavigation('/#skill_section', `${BASEURL}/portfolio/author/create`);
    testAuthLinkNavigation('/#skill_section', `${BASEURL}/portfolio/author`);
  });
  test('Clicking the Contact link should navigate to the Contact section', async () => {
    testAuthLinkNavigation('/#contact_section', `${BASEURL}/portfolio/author/create`);
    testAuthLinkNavigation('/#contact_section', `${BASEURL}/portfolio/author`);
  });

});

describe('Test CRUD operations on the Author model', () => {
 
  test('Gets the author create form', async () => {
    
    /*isConnected = await testutils.testconnection();
    console.log('Am testing is connected', isConnected);

    if (isConnected) {
      await page.goto(`${BASEURL}/portfolio/author/create`, {waitUntil: 'domcontentloaded'});
      const getauthorpage = await page.title();
      console.log("getauthropages", getauthorpage);
      expect(getauthorpage).toBe('Create au');
    }
    
    /*if (isConnected) {
      await page.goto(`${BASEURL}/portfolio/login`, {waitUntil: 'domcontentloaded'});
      const emailInput = await page.$('#loginemail');
      const passwdInput = await page.$('#loginpasswd');
      const loginbtn = await page.$('#loginbtn');
      await emailInput.type(authoremail);
      await passwdInput.type(authorpassword);
      await loginbtn.click();
      await page.waitForNavigation();
      // Assert if the JWT token cookie exists
      const jwtTokenCookie = await page.evaluate(() => {
        console.log('the jwt after login is', jwtTokenCookie);
        return document.cookie.includes('jwtTokens');
      });
      if (jwtTokenCookie) {
        console.log('Projects jwt token is available ', jwtTokenCookie);
        console.log('Author jwt token is available ', jwtTokenCookie);
        console.log('TEsting isconnected const', isConnected)
        await page.waitForSelector('#adminabout');
        await page.goto(`${BASEURL}/portfolio/author/create`, {waitUntil: 'domcontentloaded'});
        const getauthorpage = await page.title();
        console.log("getauthropages", getauthorpage);
        expect(getauthorpage).toBe('Create au');  
      } else {
        console.log('Failed to obtain JWT token cookie.');
        console.log('Is connected:', isConnected);
        console.log('JWT token cookie:', jwtTokenCookie);
        expect(isConnected && jwtTokenCookie).toBe(true); // Fails the test if the condition is not met
      }
    }
  });
    
      
    /*if (isConnected) {
      await page.goto(`${BASEURL}/portfolio/login`, { waitUntil: 'domcontentloaded' });
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
      if (jwtTokenCookie) {
        console.log('Author jwt token is available ', jwtTokenCookie);
        console.log('TEsting isconnected const', isConnected)
        await page.goto(`${BASEURL}/portfolio/author/create`, {waitUntil: 'domcontentloaded'});
        const getauthorpage = await page.title();
        console.log("getauthropages", getauthorpage);
        expect(getauthorpage).toBe('Create au');  
      }
    }
    else {
      console.log('failed authors1')
      console.log('TEsting isconnected const', isConnected)
      console.log('TEsting jwtTokenCookie const', jwtTokenCookie)
    }
  

  test('Test that form data is posted to database', async () => {
    if (isConnected) {
          await page.goto(`${BASEURL}/portfolio/author/create`, {waitUntil: 'domcontentloaded'});
      //fill in the owner registration form
      await page.type('#authorfirstname', 'Johnny');
      await page.type('#authormiddlename', 'Mitc');
      await page.type('#authorlastname', 'Longly');
      await page.type('#authorshortdesc', 'test brief description');
      await page.type('#authorfulldesc', 'test full description');
      await page.type('#authorbrandname', 'Johnny');
      await page.type('#authoremail', 'johnny4@getMax.com');
      await page.type('#authorpassword', 'jhony675#');
      await page.type('#githuburl', 'https://chat.openai.com/?model=text-davinci-002-render-sha');
      await page.type('#linkeninurl', 'https://chat.openai.com/?model=text-davinci-002-render-sha');
      //upload images 
      console.log("imageInput");
      const imageInput = await page.$('#photo1');
      const imagePath = path.resolve(__dirname, '../public/images/img/project1.jpg');
      await imageInput.uploadFile(imagePath);
      console.log('autho2',imagePath);
      //submit form
      await page.click('#authorsubmitbutton');
      // Wait for the form submission to complete
      await page.waitForFunction(() => {
        return document.querySelector('#createAuthormodal') !== null;
      });
      // Assert that the success message or modal is displayed
      const successElement = await page.$('#createAuhormodal');
      expect(successElement).toBeTruthy();
      /*
      //await page.waitForSelector('#project_section');
      //await page.waitForTimeout(8000);
      console.log('author form imagepath is',imagePath);
      // Wait for the redirect to complete
      await page.waitForNavigation();

      // Assert that the URL after the redirect is correct
      expect(await page.url()).toMatch(`${BASEURL}/portfolio/`);
    }
  });

  test("Test that author is deleted from database", async () => {
    if(isConnected){
      await page.goto(`${BASEURL}/portfolio/author`, {waitUntil: 'domcontentloaded'});

      //check the first-row first-column checkbox
      const firstcheckboxselector = '#authortable input[type="checkbox"]:first-child';
      //evaluate javascript code within the page context to check the checkbox
      await page.evaluate((selector) => {
        const firstcheckbox = document.querySelector(selector);
        if (firstcheckbox) {
          firstcheckbox.checked = true;
        }
      }, firstcheckboxselector);

      //click the delete button to remove the checked record
      await page.click('#authorbtnDelete');

      // Wait for the confirmation dialog to appear
      await page.waitForSelector('#deleteConfirmationModal', { visible: true });

      // Click the delete button on the confirmation dialog
      await page.click('#confirmDeleteButton');

      const serverResponse = await page.evaluate(async (baseUrl) => {
        const response = await fetch(`${baseUrl}/portfolio/author/delete`, {
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
      console.log('6.response is', serverResponse);

      // Assert that the server response is not null and contains the expected success message
      expect(serverResponse).not.toBeNull();
      expect(serverResponse.success).toBe('Successfully Deleted');
    }
  });

  test('Test that you can update the author record', async () => {
    if (isConnected) {
      await page.goto(`${BASEURL}/portfolio/author`, {waitUntil: 'domcontentloaded'});

      //click the update icon
      await page.click('.authoredit')

      //test that the update page is shown
      await page.waitForSelector('#authorUpdateModal', { visible: true });
      //fill in the owner registration form
      await page.type('#authorfirstname', 'Johnny1');
      await page.type('#authormiddlename', 'Mitc1');
      await page.type('#authorlastname', 'Longly1');
      await page.type('#authorshortdesc', 'update test brief description');
      await page.type('#authorfulldesc', 'update test full description');
      await page.type('#authorbrandname', 'Johnny1');
      await page.type('#authoremail', 'johnny7@getMax.com');
      await page.type('#authorpassword', 'jhony675#');
      await page.type('#githuburl', 'https://chat.openai.com/?model=text-davinci-002-render-sha');
      await page.type('#linkeninurl', 'https://chat.openai.com/?model=text-davinci-002-render-sha');
      //upload images 
      console.log("imageInput");
      const imageInput = await page.$('#photo1');
      const imagePath = path.resolve(__dirname, '../public/images/img/project2.jpg');
      await imageInput.uploadFile(imagePath);
      console.log('update author file path', imagePath);
      
      //clicking the submit button should post the data and redirect to all authors
      await page.click('#authorUpdatebtn');
      // Wait for the redirect to happen
      //Sawait page.waitForNavigation();
      // Get the current URL after the redirect
      const currentUrl = page.url();
      expect(currentUrl).toMatch('/portfolio/author');

    }
  });
});*/





/*//Import required modules
const request = require('supertest');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {  S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { BUCKET_NAME, BUCKET_REGION, ACCESS_KEY, SECRET_ACCESS_KEY } = require('../configs/config');
const app = require('../app');
const Author = require('../models/author');
const Project = require("../models/project");
const async = require('async');
const { query } = require('express');
const { index, author_list } = require('../controllers/authorController');
const controllerUtils = require("../utils/controllerUtils");
const author = require('../models/author');


jest.mock('../models/author');
jest.mock('../models/project');
jest.mock('../utils/controllerUtils');
jest.mock('@aws-sdk/s3-request-presigner');
jest.mock('async');

describe('Tests projects per Individual (exports.index)', () => {
  let req, res, next;
  let brandname;
  beforeEach(() => {
      req = {};
      res = {
          send: jest.fn(),
          render: jest.fn()
      };
      brandname = 'brandname';
  });

  afterEach(() => {
      jest.clearAllMocks();
  });
  test('render default page if owner is not signed up', async () => {
    //mock the Author.exists method to return null
    Author.exists.mockImplementationOnce((query, callback) => {
      callback(null, null);  
    });
    await index(req, res, next);
    expect(res.render).toHaveBeenCalledWith('default_index', { 
      Title: "Default Page", 
      brandname: 'brandname' 
    });
  });

  test('Render porfolio page if owner status exists', async () => {
    const authorId = 'author_id';
    const authorData = { _id: authorId }
    const projectData = [{ author: authorId, skill:[ ], mediaName: {} }];
    // Mock the getSignedUrl method to return a dummy signed URL
    getSignedUrl.mockImplementation(() => 'signed_url');
    const mockresults =
    {
      author: {
        name: { first: 'Paul', middle: 'Gobero', last: 'Lwanga' },
        about: {
          short_description: 'Full Stack Web Developer and DevOps Engineer',
          full_description: 'I am a versatile highly skilled full stack web developer and DevOps engineer with a passion for designing and developing scalable and secure web applications that streamline operations, improve efficiency and enhance customer satisfaction. \r\n' +
            'With proficiency in languages such as python, php, Javascript, I am skilled at developing both front and backend systems. Additionally, I am experienced in automating infrastructure and deployment processes using tools such as Docker, Jenkins and AWS cloud technologies.\r\n' +
            'I am dedicated to continuous learning, collaboration with teams and stakeholders to deliver high-quality innovative products and services that meet business goals.'
        },
        socialmedia: {
          github: 'https:&#x2F;&#x2F;mozilla.github.io&#x2F;nunjucks&#x2F;templating.html',
          linkedin: 'https:&#x2F;&#x2F;mozilla.github.io&#x2F;nunjucks&#x2F;templating.html'
        },
        _id: "642c919d10b1ed779de88f42",
        brandName: 'PaulGobero',
        email: 'paul@paulgobero.com',
        password: 'paul',
        authorStatus: 'owner',
        authorRole: 'admin',
        imageName: 'authorff23df14c8a9545d20965e1d070c6632c561129d39e8f3bdbe695ed888dfaa48',
        createdAt: '2023-04-04T21:07:41.559Z',
        updatedAt: '2023-04-05T09:02:52.354Z',
        __v: 0,
        imageUrl: 'https://dev-portfolio-paulgobero-com.s3.eu-west-1.amazonaws.com/authorff23df14c8a9545d20965e1d070c6632c561129d39e8f3bdbe695ed888dfaa48?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAYJ2APMF7JIW36YND%2F20230426%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Date=20230426T230259Z&X-Amz-Expires=3600&X-Amz-Signature=9d6dc7a98ad323895a29dfdfed30a655215220bb7c143b6199351dec6e9444fd&X-Amz-SignedHeaders=host&x-id=GetObject',
        brand: 'Paul Lwanga',
        url: '/portfolio/author/642c919d10b1ed779de88f42',
        id: '642c919d10b1ed779de88f42'
      },
      author_projects: [
        {
          mediaName: {
            videoName: 'test_video_name',
            imageName: 'test_image_name',
          },
          mediaUrl: {
            videoUrl: getSignedUrl,
            imageUrl: getSignedUrl,
          },
          _id: "6433c02c0f80f064bd872006",
          ptitle: 'project6',
          psummary: 'summary of project 6',
          problemStatement: 'problem of project 6',
          solution: 'solution to project 6',
          role: 'design',
          githubUrl: '',
          livelinkUrl: '',
          contributor: '',
          skill: [{
            name: 'Test skill name',
            imageName: 'test_skill_image_name',
            imageUrl: getSignedUrl,
          }],
          author: [{name: 'Test skill name',}],
          specialisation: [{name: 'Test skill name',}],
          createdAt: '2023-04-10T07:52:12.679Z',
          updatedAt: '2023-04-10T12:27:20.895Z',
          __v: 0,
          url: '/portfolio/project/6433c02c0f80f064bd872006',
          id: '6433c02c0f80f064bd872006'
        },
      ]
    }

    Author.exists.mockImplementation((query, callback) => {
      if (query.authorStatus === 'owner') {
        callback(null, authorData)
      }
    });

    // Mock the Author.findOne method to execute the callback with authorData as its second argument
    Author.findOne.mockImplementation((query, callback) => {
      callback(null, authorData);
    });
    // Mock the Project.find method to execute the callback with projectData as its second argument
    Project.find.mockImplementation((query, callback) => {
      callback(null, projectData);
    });
    // Mock the async.parallel method to execute the callback with mockresults as its second argument
    async.parallel.mockImplementation((tasks, callback) => {
      callback(null, mockresults);
    });

    // Call exports.index with the mocked data
    await index(req, res, next);
    
    // Assert that async.parallel was called with the expected arguments
    expect(async.parallel).toHaveBeenCalledWith({
      author: expect.any(Function),
      author_projects: expect.any(Function),
    }, expect.any(Function));

    // Assert that getSignedUrl was called three times (once for each media item in the mockresults)
    expect(getSignedUrl).toHaveBeenCalledTimes(2);

    /*console.log(res.render.mock.calls); 
    // Assert that res.render was called with the expected arguments
    expect(res.render).toHaveBeenCalledWith("portfolio_index", { Title: "Portfolio", index_data: mockresults, brandname }); 
   
  });
});*/

/*describe('Tests for message submission form (post.exports.index)', () => {
  test("It should return 302 if the form data is valid", async () => {
    const response = await request(app)
    .post("/portfolio/")
    .send({
      contactname: "John",
      contactemail: "john@email.com",
      contactmessage: "Hello, test message"
    });
    expect(response.status).toBe(302);
  }, 100000);

  test("Return an error message if data is invalid", async () => {
    const response = await request(app)
    .post("/portfolio/")
    .send({
      contactname: "Jo", //too short
      contactemail: "not_email", //invalid email
      contactmessage: "", //message is empty
    });
    expect(response.body.errors).toBeDefined();
  }, 100000); 

  test("Send an email if the form data is valid", async () => {
    const response = await request(app)
    .post("/portfolio/")
    .send({
      contactname: "John",
      contactemail: "john@email.com",
      contactmessage: "Hello, test message"
    });
    expect(response.body.failed).toBeFalsy();
  }, 100000);
}); */

/*describe('author_list', () => {
  // Mocks
  const author = [
    {
      _id: '1',
      name: 'John Doe',
      imageName: 'john_doe.jpg',
    },
    {
      _id: '2',
      name: 'Jane Doe',
      imageName: 'jane_doe.jpg',
    },
  ]
  //const s3Client = {};
  //const getSignedUrl = jest.fn(() => Promise.resolve('signed_url'));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const s3Client = {
    getSignedUrl: jest.fn().mockResolvedValue('https://signed-url'),
    // Add other mocked properties and methods of s3Client here as needed
  };
  
  jest.mock('../utils/controllerUtils', () => ({
    getBrandName: jest.fn().mockResolvedValue('MockBrandName'),
    s3Client: s3Client,
  }));
  
  // Test cases
  test('renders the author_Admin view with a list of authors', async () => {
    // Mocks
    const req = { userinfo: { role: 'admin' } };
    const res = { render: jest.fn() };
    const next = jest.fn();
    //const getBrandNameMock = jest.spyOn(controllerUtils, 'getBrandName').mockResolvedValue('MockBrandName');

    const findMock = jest.spyOn(Author, 'find').mockImplementation(() => ({
      sort: () => ({
        exec: jest.fn().mockResolvedValue([author])
      })
    }));
    /*const getSignedUrlMock = jest.fn().mockResolvedValue('https://signed-url');
    const s3ClientGetSignedUrlRestore = jest.replaceProperty(controllerUtils.s3Client, 'getSignedUrl', getSignedUrlMock);

    // Execution
    await author_list(req, res, next);
  
    // Expectations
    console.log(controllerUtils.getBrandName.mock.calls);
    console.log(findMock.mock.calls);
    //console.log(controllerUtils.s3ClientGetSignedUrlMock.mock.calls);
    expect(controllerUtils.getBrandName).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledTimes(1);
    expect(s3Client.getSignedUrl).toHaveBeenCalledTimes(2); // The function is called twice in the code
    expect(res.render).toHaveBeenCalledWith('author_Admin', {
      Title: 'Admin Author',
      abtauthor: [
        {
          _id: '1',
          name: 'John Doe',
          imageName: 'john_doe.jpg',
          imageUrl: 'https://signed-url',
        },
        {
          _id: '2',
          name: 'Jane Doe',
          imageName: 'jane_doe.jpg',
          imageUrl: 'https://signed-url',
        },
      ],
      brandname: 'MockBrandName'
    });
    expect(next).not.toHaveBeenCalled();
  });

  
  


  

  test('returns a 403 status if user is not an admin', async () => {
    // Mocks
    const req = { userinfo: { role: 'user' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    const next = jest.fn();

    // Execution
    await author_list(req, res, next);

    // Expectations
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({ message: 'Unauthorized User Trying to Login' });
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next with an error if there is an error in Author.find', async () => {
    // Mocks
    const req = { userinfo: { role: 'admin' } };
    const res = { render: jest.fn() };
    const next = jest.fn();
    const error = new Error('Database error');
    const findMock = jest.spyOn(Author, 'find').mockImplementation(() => ({
      sort: () => ({
        exec: callback => callback(error)
      })
    }));

    // Execution
    await author_list(req, res, next);

    // Expectations
    expect(next).toHaveBeenCalledWith(error);
    expect(findMock).toHaveBeenCalledTimes(1);
    expect(res.render).not.toHaveBeenCalled();
  });
});*/

/*describe("test GET /: shows the index pages", () => {
    //tests that everything works as expected
    test('If the code is successful', async () => {
        const response = await request(app).get('/portfolio/');
        expect(response.status).toBe(200); 
        //expect(response.text).toContain('Portfolio');
        //expect(response.body).toHaveProperty('index_data.author');
        //expect(response.body).toHaveProperty('index_data.author_projects');
    }, 100000)
});*/
/*{
  author: {
    name: { first: 'Paul', middle: 'Gobero', last: 'Lwanga' },
    about: {
      short_description: 'Full Stack Web Developer and DevOps Engineer',
      full_description: 'I am a versatile highly skilled full stack web developer and DevOps engineer with a passion for designing and developing scalable and secure web applications that streamline operations, improve efficiency and enhance customer satisfaction. \r\n' +
        'With proficiency in languages such as python, php, Javascript, I am skilled at developing both front and backend systems. Additionally, I am experienced in automating infrastructure and deployment processes using tools such as Docker, Jenkins and AWS cloud technologies.\r\n' +
        'I am dedicated to continuous learning, collaboration with teams and stakeholders to deliver high-quality innovative products and services that meet business goals.'
    },
    socialmedia: {
      github: 'https:&#x2F;&#x2F;mozilla.github.io&#x2F;nunjucks&#x2F;templating.html',
      linkedin: 'https:&#x2F;&#x2F;mozilla.github.io&#x2F;nunjucks&#x2F;templating.html'
    },
    _id: new ObjectId("642c919d10b1ed779de88f42"),
    brandName: 'PaulGobero',
    email: 'paul@paulgobero.com',
    password: 'paul',
    authorStatus: 'owner',
    authorRole: 'admin',
    imageName: 'authorff23df14c8a9545d20965e1d070c6632c561129d39e8f3bdbe695ed888dfaa48',
    createdAt: 2023-04-04T21:07:41.559Z,
    updatedAt: 2023-04-05T09:02:52.354Z,
    __v: 0,
    imageUrl: 'https://dev-portfolio-paulgobero-com.s3.eu-west-1.amazonaws.com/authorff23df14c8a9545d20965e1d070c6632c561129d39e8f3bdbe695ed888dfaa48?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAYJ2APMF7JIW36YND%2F20230426%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Date=20230426T230259Z&X-Amz-Expires=3600&X-Amz-Signature=9d6dc7a98ad323895a29dfdfed30a655215220bb7c143b6199351dec6e9444fd&X-Amz-SignedHeaders=host&x-id=GetObject',
    brand: 'Paul Lwanga',
    url: '/portfolio/author/642c919d10b1ed779de88f42',
    id: '642c919d10b1ed779de88f42'
  },
  author_projects: [
    {
      mediaName: [Object],
      mediaUrl: [Object],
      _id: new ObjectId("6433c02c0f80f064bd872006"),
      ptitle: 'project6',
      psummary: 'summary of project 6',
      problemStatement: 'problem of project 6',
      solution: 'solution to project 6',
      role: 'design',
      githubUrl: '',
      livelinkUrl: '',
      contributor: '',
      skill: [Array],
      author: [Array],
      specialisation: [],
      createdAt: 2023-04-10T07:52:12.679Z,
      updatedAt: 2023-04-10T12:27:20.895Z,
      __v: 0,
      url: '/portfolio/project/6433c02c0f80f064bd872006',
      id: '6433c02c0f80f064bd872006'
    },
  ]
}*/

