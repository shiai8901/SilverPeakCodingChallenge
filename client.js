var readline = require('readline');
var http = require('http');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const hostname = "localhost";
const port = 8080;

/********* Build the client *********/
var CLI = function() {
	this.operations = {
		"'testSites <site 1>, <site 2>, <site 3>, <interations>'": "test sites", 
		"'getStatus <handle>'": "return test has finished or is still running",
		"'getResults <handle>'": "return '<site name>, <iterations>, <min resp time>, <max resp time>, <avg resp time>, <test start time>, <test end time>'",
		"'getAll'": "get all test handles currently server knows",
		"'help'": "get all valid operations"
	};	
}

CLI.prototype.testSites = function(sites, iterations) {
	var postData = JSON.stringify({
	  sitesToTest: sites,
	  iterations: iterations
	});
	console.log("testSites in client: ", JSON.parse(postData));

	var options = {
		hostname: hostname,
		port: port,
		path: '/testSites',
		method: 'POST',
		headers: {
    		'Content-Type': 'application/x-www-form-urlencoded',
    		'Content-Length': Buffer.byteLength(postData)
		}
	};

	var req = http.request(options, (res) => {
		// console.log(`STATUS: ${res.statusCode} \n`, ` HEADERS: ${JSON.stringify(res.headers)}`);
		// res.setEncoding('utf8');
		res.on('data', (chunk) => {
			// console.log(`BODY: ${chunk}`);
			console.log("test " + JSON.parse(chunk).status + ". Test handle: " + JSON.parse(chunk).testHandle);
		});
		res.on('end', () => {
			console.log('No more data in response.');
		});
	});

	req.on('error', (e) => {
	  console.log(`problem with request: ${e.message}`);
	});

	// write data to request body
	req.write(postData);
	req.end();

}

CLI.prototype.getStatus = function(handle) {
	console.log("getStatus: ", handle);
}

CLI.prototype.getResults = function(handle) {
	console.log("getResults: ", handle);
}

CLI.prototype.getAll = function() {
	console.log("getAll");
}

CLI.prototype.help = function() {
	let helpInfo = "";
	for (var operation in this.operations) {
		helpInfo += "* " + operation + " => " + this.operations[operation] + "\n";
	}
	return helpInfo;
}

/********* Start the client *********/
console.log("Welcome! Please enter operation and press enter.");
var cli = new CLI();

/**
 * process input string, and invoke the corresponding operation
 * @return {Boolean} is valid input
 */
var processInput = function(string) {
	var stringArr = string.split(" ");

	if (stringArr.length < 1) return false;
	if (stringArr[0] === "testSites") {
		var sites = stringArr.slice(1, stringArr.length - 1);
		var iterations = +stringArr[stringArr.length - 1];
		if (!Number.isInteger(iterations) || iterations < 1) return false;
		cli.testSites(sites, iterations);
		return true;
	} else if (stringArr[0] === "getStatus" && stringArr.length === 2) {
		cli.getStatus(stringArr[1]);
		return true;
	} else if (stringArr[0] === "getResults" && stringArr.length === 2) {
		cli.getResults(stringArr[1]);
		return true;
	} else if (stringArr[0] === "getAll") {
		cli.getAll();
		return true;
	} else if (stringArr[0] === "help") {
		console.log(cli.help());
		return true;
	} else {
		return false;
	}
}

var waitForInput = function() {
	rl.question('> ', function(answer) {
		console.log("waitForInput: ", answer);
		if (processInput(answer)) {
			waitForInput();
		} else {
			console.log("Invalid input. You can enter 'help' to check all valid operations");
			waitForInput();
		}
	});
}

waitForInput();