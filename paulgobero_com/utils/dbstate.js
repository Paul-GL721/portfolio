/* Check and set database readiness state */
let isDbReady = false;

module.exports = {
    setReady: () => {
        isDbReady = true;
        console.log("Readiness Probe: DB marked READY");
    },
    setNotReady: () => {
        isDbReady = false;
        console.log("Readiness Probe: DB marked NOT READY");
    },
    isReady: () => isDbReady
};
