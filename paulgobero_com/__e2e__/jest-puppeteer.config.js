module.exports = {
    launch: {
      headless: 'new',
        args: [ '--no-sandbox', '--disable-setuid-sandbox', "--window-size=1366,768" ],
    },
    browser: 'chromium',
}