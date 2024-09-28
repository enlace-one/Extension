
function log(arg, level = "info", ...args) {
    console.log(level, arg, args.join(' '));
}

function dontlog(arg, level = "info", ...args) {
    // Intentionally does nothing
}

async function testGoogleDrive(log = log) {
    const testFileName = "test_file";
    const testData = { "testkey": "testvalue" };

    log(`Searching for test file: ${testFileName}`);
    let fileId = await gdSearchFile(testFileName);

    if (fileId) {
        log(`Deleting previous test file: ${testFileName} with ID ${fileId}`);
        await gdDeleteFile(fileId);
    } else {
        log(`No previous test file found`);
    }

    log(`Creating test file: ${testFileName}`);
    fileId = await gdCreateFile(testFileName, JSON.stringify(testData));

    log(`Retrieving test file: ${testFileName} with ID ${fileId}`);
    const fileContents = await gdGetFile(fileId);

    if (fileContents) {
        const fileText = await fileContents.text();
        log("Raw File Contents:", fileText);

        try {
            const parsedData = JSON.parse(fileText);
            log("Parsed File Contents:", parsedData);
            if (parsedData.testkey === 'testvalue') {
                log("TEST PASSED");
                return true;
            }
        } catch (error) {
            log("Error parsing file contents as JSON:", error);
        }
    } else {
        log("Error: File contents not retrieved or invalid Blob.", "ERROR");
    }
    
    return false;  // Indicate failure if no conditions are met
}

async function runTests() {
    const result = await testGoogleDrive(dontlog);
    if (result) {
        log("Passed - Google Drive Test Case");
    } else {
        log("FAILED - Google Drive Test Case", "ERROR");
    }
}
