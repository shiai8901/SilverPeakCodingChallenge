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

// format is {testHandleName: {result: [], status: ""}}
var testHandles = {};

function validateInput(input) {

}

function test(sitesToTest, iterations) {

}

const requestListener = function(req, res) {
	var url = urlParser.parse(req.url).pathname;
	var method = req.method;

	console.log('requestListener: url = ', url, 'method = ', method);

	if (method === 'POST') {
		// input format {sitesToTest: [http://www.google.com, http://cnn.com, http://espn.com], iterations: 10}
		var input = '';
		// need to generate unique testHandle
		var testHandle = ;
		req.on('error', function(err) {
			console.log('Error: ', err.message);
		});
		req.on('data', function(chunck) {
			input += chunk;
		});	
		req.on('end', function() {
			console.log(input);
			if (validateInput(input)) {
				testHandles[testHandle] = {result: [], status: "started"};
				// run the function on the input;
				// test(input.sitesToTest, input.iterations) {
				// }				
			} else {
				res.writeHead(406, headers);
				res.end('Input format is not acceptable.');
			}
		});
		res.writeHead(201, headers);
		res.end({testHandle: testHandle, status: testHandles[testHandle].status});
	} else if (method = 'GET') {

	}
}






// const requestListener = function (req, res) {
//   res.writeHead(200);
//   res.end('Hello, World!\n');
// }

const server = http.createServer(requestListener);
server.listen(8080);