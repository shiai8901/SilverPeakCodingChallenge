// var https = require('https');
// var fs = require('fs');

// var options = {
//   key: fs.readFileSync('key.pem'),
//   cert: fs.readFileSync('cert.pem')
// };

// var a = https.createServer(options, function (req, res) {
//   res.writeHead(200);
//   res.end("hello world\n");
//   console.log('listen to 8000');
// }).listen(8080);


const http = require('http');
const urlParser = require('url');

var headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10, // Seconds.
  'Content-Type': 'application/json'
};

// format is {testHandleName: {sites: [], iterations: Number, result: [], status: ""}}
var testInfo = {};

// a list of testHandleNames
var testHandles = [];

/**
 * generate unique handle
 * @return {String} handle
 */
function generateTestHandle() {

}

/**
 * validate input string
 * @param {String} input
 * @return {Boolean} is validate input
 */
function validateInput(input) {

}

/**
 * do the test on sites
 * @param {Array} sitesToTest
 * @param {Number} iterations
 */
function test(sitesToTest, iterations) {

}

/**
 * update test status when test is completed
 * @param {String} testHandle
 * @param {String} status
 */
function updateTestStatus(testHandle, status) {
	testInfo[testHandle].status = status;
}

/**
 * update test result when test is completed
 * @param {String} testHandle
 * @param {String} result
 */
function updateTestResult(testHandle, result) {
	testInfo[testHandle].result = result;
}

/**
 * save test result to disk
 */
function saveTestResult(testHandle, result, callback) {

}

/**
 * remove test result every 24 hours
 */
function removeTestResultWorker() {

}

const requestListener = function(req, res) {
	var url = urlParser.parse(req.url).pathname;
	var method = req.method;

	console.log('requestListener: url = ', url, 'method = ', method);

	if (method === 'POST') {
		// input format {sitesToTest: [http://www.google.com, http://cnn.com, http://espn.com], iterations: 10}
		var input = '';
		// need to generate unique testHandle
		var testHandle = generateTestHandle();
		req.on('error', function(err) {
			console.log('Error: ', err.message);
		});
		req.on('data', function(chunck) {
			input += chunk;
		});	
		req.on('end', function() {
			console.log(input);
			if (validateInput(input)) {
				testInfo[testHandle] = {sites: input.sitesToTest, iterations: input.iterations, result: [], status: "started"};
				testHandles.push(testHandle);
				// run the function on the input;
				// test(input.sitesToTest, input.iterations) {
				// }				
			} else {
				res.writeHead(406, headers);
				res.end('Input format is not acceptable.');
			}
		});
		res.writeHead(201, headers);
		res.end({testInfo: testHandle, status: testInfo[testHandle].status});
	} else if (method = 'GET') {
		if (url === 'allTests') {
			res.writeHead(200, headers);
			res.end(JSON.stringify({handles: testHandles}));
		} else if (testInfo[url] === undefined) {
			response.writeHead(404, headers);
			response.end('Cannot find the test with the testHandle = ' + url);
		} else {
			if (testHandles[url].status === "finished") {
				res.writeHead(400, headers);
				res.end(JSON.stringify(testInfo[url].result));
			} else {
				res.writeHead(200, headers);
				res.end({testHandle: url, status: testInfo[url].status});
			}
		}
	}
}






// const requestListener = function (req, res) {
//   res.writeHead(200);
//   res.end('Hello, World!\n');
// }

const server = http.createServer(requestListener);
server.listen(8080);