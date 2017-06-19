var readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


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
	console.log("testSites: ", sites, iterations);
	console.log("Test started. Test handle: <handle>");
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