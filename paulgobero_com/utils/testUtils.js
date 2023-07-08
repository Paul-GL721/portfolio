
const { BASEURL, TEST_DB_USER, TEST_DB_PASSWORD, TEST_DB_NAME, TEST_DB_HOST, TEST_DB_PORT } = require('../configs/config');
const Skill = require('../models/skill'); 
const Spec = require('../models/specialisation'); 
const Author = require('../models/author'); 
const Project = require('../models/project');
const  database_connection = require('../configs/loadb'); //testdb module
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const async = require("async"); //run async functions

async function testconnection() {
    try {
        const isConnected = await database_connection(TEST_DB_NAME, TEST_DB_USER, TEST_DB_PASSWORD, TEST_DB_HOST, TEST_DB_PORT );
        console.log('Is Test database connected?', isConnected);
        return isConnected;
    } catch {
        console.log('Cannot connect to test database');
    }   
}

async function beforeAllTests() {
    function imageToString(filepath) {
        //read image file
        const imagePath = path.resolve(__dirname, filepath);
        const imageData = fs.readFileSync(imagePath);
        //convert the imagedata to string
        const imageString = imageData.toString('base64');
        return imageString;
    }
    isConnected = await testconnection();

    //create two specilisation documents
    await Spec.create([
        { name: 'Frontend', description: 'Ability to perform frontend designs' },
        { name: 'Devops', description: 'Capable of deploying applications' },
    ])
    
    //create two new skills documents with the image string
    await Skill.create([
        { name: 'MySQL', description: 'Ability to handle operations with the MySQL database management system', imageName: imageToString('../public/images/img/project1.jpg') },
        { name: 'Python', description: 'Ability to handle operations with the python programming language', imageName: imageToString('../public/images/img/project1.jpg') }
    ]);

    //create an author document
    await Author.create([
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

};

async function afterAllTests() {
    //drop collections after
   // await mongoose.connection.dropCollection(Spec);
   // await mongoose.connection.dropCollection(Skill);
    //await Author.collection.drop(); 
    //await mongoose.connection.dropCollection(Project);

    // Drop the database
    await mongoose.connection.dropDatabase();
    // Close the Mongoose connection
    await mongoose.connection.close();
   
};

const loginAndNavigate = async (email, password) => {
    await page.goto(`${BASEURL}/portfolio/login`, {waitUntil: 'domcontentloaded'});
    const emailInput = await page.$('#loginemail');
    const passwdInput = await page.$('#loginpasswd');
    const loginbtn = await page.$('#loginbtn');
    await emailInput.type(email);
    await passwdInput.type(password);
    await loginbtn.click();
    await page.waitForNavigation();
    // Assert if the JWT token cookie exists
    const jwtTokenCookie = await page.evaluate(() => {
        return document.cookie.includes('jwtTokens');
    });
    if (jwtTokenCookie) {
        console.log('Projects jwt token is available ', jwtTokenCookie);
    }
}

module.exports = { beforeAllTests, afterAllTests, loginAndNavigate, testconnection };