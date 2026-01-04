
const config = {
    preset: "jest-puppeteer",
    testEnvironment: "jest-environment-puppeteer",
    testMatch: ["<rootDir>/__e2e__/**/*test.js"],
    verbose: true,    
};
  
module.exports = config;