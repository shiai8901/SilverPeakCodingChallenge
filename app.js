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
const fs = require('fs');


const filepath = 'allTests.txt';
const cleanDataTimeInterval = 24 * 60 * 60 * 1000;
let nextClearDataTime = (new Date()).getTime() + cleanDataTimeInterval
let countdown;

/**
 * invoke removeTestResultFromMemory(listOfItems), removeTestResultFromDisk(filepath) repeatedly
 * @param {number} milliseconds: time interval
 * @param {array} funcs: functions to be invoked
 */
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
	}, milliseconds);
}

timer(nextClearDataTime);

/**
 * remove data in <listOfItems> on memory
 * @param {array} listOfItems
 */
function removeTestResultFromMemory(listOfItems) {
	listOfItems.forEach((item) => {
		if (Array.isArray(item)) {
			item = [];
		} else if (typeof item === 'object') {
			item = {};
		}
	});
	console.log('Data has been removed from memory');
}

/**
 * remove data on <filepath>
 */
function removeTestResultFromDisk(filepath) {
	fs.writeFile(filepath, '', function(){
		console.log('Data has been removed from disk');
	});
}

// format is {testHandleName: {sites: [], iterations: Number, result: [], status: ""}}
var testInfo = {};

// a list of testHandleNames
var testHandles = [];

/**
 * generate unique handle
 * @return {String} handle
 */

let count = 0;
function generateTestHandle() {
	count++;
	return count;
}

/**
 * validate if the input string is a valid url
 * @param {String} input
 * @return {Boolean} is validate input
 */
function validateInput(input) {
	try { 
		input = JSON.parse(input);
		// console.log("input in validation --------> ", input);
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
		return e;
	}	
}

/**
 * get the response times for a list of sites for <iterations> times
 * @param {Array} sitesToTest
 * @param {Number} iterations
 * @param {Number} testHandle
 * @return {Array} [{site: string, avg: number, max: number, min: number, startTestTime: string, endTestTime: string, interations: number}]
 */
function test(testHandle, sitesToTest, iterations, callback) {
	var promises = [];
	sitesToTest.forEach((site) => {
		var promise = new Promise((resolve, reject) => {
			resolve(getURL(site, iterations, callback));
		}); 		
		promises.push(promise);
	});
	var results = [];
	return Promise.all(promises).then((values) => {
		values.forEach((site) => {
			results.push(analyzeRawResults(site.url, iterations, site.testStartTime, site.respTimes));
		});
		return results;
	})
	.then((results) => {
		return results;
	});		
}

/**
 * Calculate the max, min, avg resposne time, start test time and end test time, and return the result in required format
 * @return [<site name>, <iterations>, <min resp time>, <max resp time>, <avg resp time>, <test start time>, <test end time>]
 */
function analyzeRawResults(url, iterations, testStartTime, timeArr) {
	var respMin = Number.MAX_VALUE, 
		respMax = Number.MIN_VALUE, 
		respAvg = 0, 
		testEndTime = timeArr[timeArr.length - 1], 
		totalTime = 0;

	for (var i = timeArr.length - 1; i > 0; i--) {
		timeArr[i] = timeArr[i] - timeArr[i - 1];
	}
	timeArr[0] = timeArr[0] - testStartTime;
	timeArr.forEach((time) => {
		totalTime += time;
		if (time < respMin) respMin = time;
		if (time > respMax) respMax = time;
	});
	var result = {
		site: url, 
		avg: totalTime / timeArr.length, 
		max: respMax, 
		min: respMin, 
		startTestTime: testStartTime, 
		endTestTime: testEndTime,
		iterations: iterations
	};
	return result;
}

/**
 * get the response time for one single url for <itertations> time
 * @return {object} {url: url, testStartTime: testStartTime, respTimes: respTimes}
 */
function getURL(url, iterations) {
	var testStartTime = (new Date()).getTime();
	var respTimes = [];
	var promises = [];

	while (iterations > 0) {
		var promise = new Promise((resolve, reject) => {
		
		http.get(url, (res) => {
			res.on('data', (chunk) => { 
				})
				.on('end', () => { 
					resolve(respTimes.push((new Date()).getTime()));
				})
				.on('error', (e) => { 
					// console.log(`problem with response: ${e}`); 
				});
			})
			.on('error', (e) => {
					// console.log(`problem with request: ${e}`);
			})
			.end();
		}); 
		promises.push(promise);
		iterations--;
	}
	return Promise.all(promises).then((values) => {		
		return {url: url, testStartTime: testStartTime, respTimes: respTimes};
	});
}

/**
 * update test status
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
function saveTestResultToDisk(filepath, data) {
	fs.appendFile(filepath, data + '\n', (err) => {
		if (err) return err;
	});
}

var headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10, // Seconds.
  'Content-Type': 'application/json'
};

const actions = {
	'POST': function(req, res, url, queryObject) {
		var input = '';
		var testHandle = generateTestHandle();
		req.on('error', function(err) {
			console.log('Error: ', err.message);
		});
		req.on('data', function(chunk) {
			input += chunk;
		});	
		req.on('end', function() {
			if (validateInput(input)) {
				input = JSON.parse(input);
				testInfo[testHandle] = {sites: input.sitesToTest, iterations: input.iterations, result: [], status: "started"};
				testHandles.push(testHandle);

				Promise
					.resolve(test(testHandle, input.sitesToTest, input.iterations))
					.then(results => {
						updateTestResult(testHandle, results);
						updateTestStatus(testHandle, "finished");						
						saveTestResultToDisk(filepath, JSON.stringify({handle: testHandle, data: results}));
					})
					.then(data => {
						console.log('data: ', data);
					})
					.catch(reject => {
						console.log('reject: ', reject);
					});
				sendResponse(201, headers, res, JSON.stringify({testHandle: testHandle, status: testInfo[testHandle].status}));
			} else {
				sendResponse(406, headers, res, 'Input format is not acceptable.');
			}
		});
	},
	'GET': function(req, res, url, queryObject) {
		if (url === '/allTests') {
			res.writeHead(200, headers);
			res.end(JSON.stringify(testHandles));
		} else if (url === "/testStatus") {
			var handle = queryObject.testHandle;

			if (testInfo[handle] === undefined) {
				sendResponse(404, headers, res, 'Cannot find the test with the testHandle = ' + handle);
			} else {
				sendResponse(200, headers, res, JSON.stringify({testHandle: handle, status: testInfo[handle].status}));
			}
		} else if (url === "/testResults") {
			var handle = queryObject.testHandle;
			if (testInfo[handle] === undefined) {
				sendResponse(404, headers, res, 'Cannot find the test with the testHandle = ' + handle);
			} else if (testInfo[handle].status === "finished") {
				sendResponse(200, headers, res, JSON.stringify(testInfo[handle].result));
			} else {
				sendResponse(400, headers, res, 'test is in progress');
			}
		} else {
			sendResponse(404, headers, res, 'Invalid operation ' + url);
		}
	}
}

function sendResponse(status, headers, res, data) {
	res.writeHead(status, headers);
	res.end(data);
}

const requestListener = function(req, res) {
	var url = urlParser.parse(req.url).pathname;
	var queryObject = urlParser.parse(req.url,true).query;
	var method = req.method;
	
	var handler = actions[method];
	if (handler) {
		handler(req, res, url, queryObject);
	} else {
		sendResponse(404, headers, res, '');
	}
}

const server = http.createServer(requestListener);
console.log("listening on 8080");
server.listen(8080);