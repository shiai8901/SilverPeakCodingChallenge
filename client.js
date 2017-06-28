var readline = require('readline');
var http = require('http');
// const https = require('https');
// const ca = fs.readFileSync(path.join(__dirname, 'my-private-root-ca.cert.pem')
var Table = require('cli-table');

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

	return Promise.resolve(this.POSTRequest(options, postData));
}
CLI.prototype.POSTRequest = function(options, postData) {
	var promise = new Promise((resolve, reject) => {
		var req = https.request(options, (res) => {
			res.on('data', (chunk) => {
			})
			.on('end', () => { 
				resolve('No more data in response.'); 
			});
		});

		req.on('error', (e) => {
		  console.log(`problem with request: ${e.message}`);
		});

		req.write(postData);
		req.end();		
	});
	return Promise.resolve(promise);
}

CLI.prototype.GETRequest = function(options) {
	var str = '';
	var promise = new Promise((resolve, reject) => {
		https.request(options, (res) => {
			res.on('data', (chunk) => { 
				str += chunk; 
				})
				.on('end', () => { 
					resolve(str);
				})
				.on('error', (e) => { 
					console.log(`problem with response: ${e.message}`); 
				});
		})
		.on('error', (e) => {
				console.log(`problem with request: ${e.message}`);
		})
		.end();		
	});
	return Promise.resolve(promise).then((str) => {
		return str;
	});
}

CLI.prototype.getStatus = function(handle) {
	var options = {
		hostname: hostname,
		port: port,
		path: '/testStatus?testHandle=' + handle,
		method: 'GET'
	};

	return Promise.resolve(this.GETRequest(options));
}

CLI.prototype.getResults = function(handle) {
	var options = {
		hostname: hostname,
		port: port,
		path: '/testResults?testHandle=' + handle,
		method: 'GET'
	};

	return Promise.resolve(this.GETRequest(options));
}

CLI.prototype.getAll = function() {
	var options = {
		hostname: hostname,
		port: port,
		path: '/allTests',
		method: 'GET'
	};

	return Promise.resolve(this.GETRequest(options))
		.then((results) => {
			return "All handles " + results
		});
}

CLI.prototype.help = function() {
	let helpInfo = "";
	for (var operation in this.operations) {
		helpInfo += "* " + operation + " => " + this.operations[operation] + "\n";
	}
	return helpInfo;
}

CLI.prototype.printTable = function(arr) {
	arr = JSON.parse(arr);
	var table = new Table({
		head: ['site', 'iterations', 'minRespTime', 'maxRespTime', 'avgRespTime', 'testStartTime', 'testEndTime'],
	});
	arr.forEach((e) => {
		table.push([e.site, e.iterations, e.min, e.max, e.avg, e.startTestTime, e.endTestTime]);
	});
	return table.toString();
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
		Promise.resolve(cli.testSites(sites, iterations))
			.then((message) => {
				console.log(message);
			});
		return true;
	} else if (stringArr[0] === "getStatus" && stringArr.length === 2) {
		Promise.resolve(cli.getStatus(stringArr[1]))
			.then((results) => {
				console.log(results);
			});
		return true;
	} else if (stringArr[0] === "getResults" && stringArr.length === 2) {
		Promise.resolve(cli.getResults(stringArr[1]))
			.then((results) => {
				console.log(cli.printTable(results));
			});
		return true;
	} else if (stringArr[0] === "getAll") {
		Promise.resolve(cli.getAll())
			.then((results) => {
				console.log(results);
			});
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
		if (processInput(answer)) {
			waitForInput();
		} else {
			console.log("Invalid input. You can enter 'help' to check all valid operations");
			waitForInput();
		}
	});
}

waitForInput();