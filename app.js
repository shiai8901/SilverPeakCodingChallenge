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
const request = require('request');

const filepath = 'allTests.txt';
const cleanDataTimeInterval = 24 * 60 * 60 * 1000;
let nextClearDataTime = (new Date()).getTime() + cleanDataTimeInterval
let countdown;

function timer(milliseconds) {
	clearInterval(countdown);
	
	countdown = setInterval(() => {
		const milliSecondsLeft = nextClearDataTime - Date.now();
		if (milliSecondsLeft < 0) {
			clearInterval(countdown);
			nextClearDataTime += cleanDataTimeInterval;
			timer(nextClearDataTime);
			removeTestResultFromMemory([testInfo, testHandles]);
			removeTestResultFromDisk(filepath);
			return;
		} 
	}, 1000);
}

timer(nextClearDataTime);

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
	try { 
		input = JSON.parse(input);
		if (typeof input !== 'object' || 
			input === null ||
			Array.isArray(input) ||
			input[sitesToTest] === undefined || 
			!Array.isArray(input[sitesToTest]) || 
			input[iterations] === undefined || 
			typeof input[iterations] !== "number" || 
			!Number.isInteger(input[iterations]) || 
			input[iterations] < 1) {
			return false;
		}

		var pattern = new RegExp('^(https?:\/\/)?'+ // protocol
			'((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|'+ // domain name
			'((\d{1,3}\.){3}\d{1,3}))'+ // OR ip (v4) address
			'(\:\d+)?(\/[-a-z\d%_.~+]*)*'+ // port and path
			'(\?[;&a-z\d%_.~+=-]*)?'+ // query string
			'(\#[-a-z\d_]*)?$','i'); // fragment locater

		for (var i = 0; i < input[sitesToTest].length; i++) {
			if (!pattern.test(input[sitesToTest][i])) return false;
		}
		return true;
	} catch (e) {
		return false;
	}	
}

/**
 * [{site: string, avg: number, max: number, min: number, startTestTime: string, endTestTime: string, interations: number}]
 * @param {Array} sitesToTest
 * @param {Number} iterations
 */
function test(testHandle, sitesToTest, iterations, callback) {
	
	var promises = sitesToTest.map((url) => {
		let startTestTime = (new Date()).getTime();
		return {site: url, startTestTime: startTestTime, endTestTime: getURL(url, iterations, generateEndTime)};
	});

	Promise.all(promises).then((result) => {
		let save = {};
		save[testHandle] = results;

		updateTestStatus(testHandle, "finished");
		updateTestResult(testHandle, result);
		callback(save);
	});

}

function generateEndTime() {
	return (new Date()).getTime();
}

function getURL(url, iterations, callback) {
	var n = iterations;
	var promises = [];		
	var promise = request({
			uri: url,
			method: "GET",
			timeout: 10000,
			followRedirect: true,
			maxRedirects: 10
		}, function(error, response, body) {
			// console.log(body);
		});
	while (n > 0) {
		promises.push(promise);
		n--;
	}

	return Promise.all(promises).then((values) => {
		return callback();
	});
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
function saveTestResultToDisk(filepath, result, callback) {
	fs.appendFile(filepath, result + '\n', function(err, file) {
		callback();
	});
}

/**
 * remove test result on memory every 24 hours
 */
function removeTestResultFromMemory(listOfItems) {
	listOfItems.forEach((item) => {
		if (Array.isArray(item)) {
			item = [];
		} else if (typeof item === 'object') {
			item = {};
		}
	});
}

/**
 * remove test result on dist every 24 hours
 */
function removeTestResultFromDisk(filepath) {
	fs.writeFile(filepath, '', function(){console.log('done')})
}

var headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10, // Seconds.
  'Content-Type': 'application/json'
};

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
				test(input.sitesToTest, input.iterations, function(result) {
					saveTestResultToDisk(filepath, result);
				});
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