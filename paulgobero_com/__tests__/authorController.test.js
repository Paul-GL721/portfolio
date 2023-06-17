const testutils = require('../utils/testUtils');
const { BASEURL } = require('../configs/config');

jest.setTimeout(600000);

/* END TO END TESTS */
describe('Index pages (portfolio/)', () => {
  let isConnected;
  beforeAll(async () => {
    await testutils.beforeAllTests();
    await page.goto(`${BASEURL}/`, { waitUntil: 'domcontentloaded' });
  });
  afterAll(testutils.afterAllTests);

  test('/ page should be titled "Portfolio" or "Default Page"', async () => {
    await page.goto(`${BASEURL}/`, {waitUntil: 'domcontentloaded'});
    const title = await page.title();
    expect(title).toMatch(/Portfolio|Default Page/);
  });

  //tests specific to the index page
  describe('Default page specific tests', () => { 
    //tests for navbar buttons
    testNavbarBtns('#about_section', '#project_section', '#skill_section', '#contact_section', `${BASEURL}/` ); 
    //run tests if the default is loaded
    test('Run tests against default page', async () => {
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





describe('Test that links on Author Authenticated page work', () => {
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
/*
describe('Test that links on Author Authenticated page work', () => {
  let isConnected;

  const authoremail = "test@gmail.com";
  const authorpassword = "test567";

  async function testAuthLinkNavigation(label, section, goto) {
    if (isConnected) {
      testutils.loginAndNavigate;
      await page.goto(goto, { waitUntil: 'domcontentloaded' });
      const link = await page.$(`a.nav-link[href="${section}"]`);
      await page.waitForSelector(link);
      await link.click();
      await page.waitForNavigation();
      const currentUrl = page.url();
      expect(currentUrl.endsWith(section)).toBeTruthy();
    }
  }

  test('Clicking the About link should navigate to the About section', async () => {
    await testAuthLinkNavigation('About', '/#about_section', `${BASEURL}/portfolio/author/create`);
    await testAuthLinkNavigation('About', '/#about_section', `${BASEURL}/portfolio/author`);
  });
  test('Clicking the Projects link should navigate to the Projects section', async () => {
    await testAuthLinkNavigation('Projects', '/#project_section', `${BASEURL}/portfolio/author/create`);
    await testAuthLinkNavigation('Projects', '/#project_section', `${BASEURL}/portfolio/author`);
  });
  test('Clicking the Skills link should navigate to the Skills section', async () => {
    await testAuthLinkNavigation('Skills', '/#skill_section', `${BASEURL}/portfolio/author/create`);
    await testAuthLinkNavigation('Skills', '/#skill_section', `${BASEURL}/portfolio/author`);
  });
  test('Clicking the Contact link should navigate to the Contact section', async () => {
    await testAuthLinkNavigation('Contact', '/#contact_section', `${BASEURL}/portfolio/author/create`);
    await testAuthLinkNavigation('Contact', '/#contact_section', `${BASEURL}/portfolio/author`);
  });

});*/

describe('Test CRUD operations on the Author model', () => {
  let isConnected;

  const authoremail = "test@gmail.com";
  const authorpassword = "test567";
  
  test('Gets the author create form', async () => {
    if (isConnected) {
      await loginAndNavigate(authoremail, authorpassword);
      await page.goto(`${BASEURL}/portfolio/author/create`, {waitUntil: 'domcontentloaded'});
      const getauthorpage = await page.title();
      expect(getauthorpage).toMatch('Create author');
    }
  });

  test('Test that form data is posted to database', async () => {
    if (isConnected) {
      await loginAndNavigate(authoremail, authorpassword);
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
      console.log(imagePath);
      //submit form
      await page.click('#authorsubmitbutton');
      // Wait for the form submission to complete
      await page.waitForFunction(() => {
        return document.querySelector('#createAuthormodal') !== null;
      });
      // Assert that the success message or modal is displayed
      const successElement = await page.$('#createAuthormodal');
      expect(successElement).toBeTruthy();
      /*
      //await page.waitForSelector('#project_section');
      //await page.waitForTimeout(8000);
      console.log('author form imagepath is',imagePath);
      // Wait for the redirect to complete
      await page.waitForNavigation();

      // Assert that the URL after the redirect is correct
      expect(await page.url()).toMatch(`${BASEURL}/portfolio/`);*/
    }
  });

  test("Test that author is deleted from database", async () => {
    if(isConnected){
      await loginAndNavigate(authoremail, authorpassword)
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
      await loginAndNavigate(authoremail, authorpassword)
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
});





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

