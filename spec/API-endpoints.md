# Backend APIs

## `POST/startTest`
	- POST body is JSON
	- JSON is the following format: 
		```
		{
			sitesToTest: [http://www.google.com, http://www.cnn.com, http://www.espn.com],
			iterations: 10
		}
		```
	- On receiving this request, server will perform an HTTP GET from the sites in the input:
		- http://www.google.com
		- http://www.cnn.com
		- http://www.espn.com
	- It will perform these HTTP GETs multiple times as specified by "interations" parameter.
	- It will measure the response time of each iteration for each site.
	- These operations will be performed in the background.
	- Server will immediately return the response: 
		```
		{
			testHandle: <testhandle>,
			status: "started"
		}
		```
	- Clientes can use the test handle to poll for the status of the progress of the test.
	- Server will properly validate JSON input.

## `GET/testStatus?testHandle=<testhandle>`
	- Server will check the status of the currently running test referred to by test handle.
	- Server will respond with a JSON response if the testHandle is valid.
	- JSON format: 
		```
		{
			testHandle: <testHandle>,
			status: <value>
		}
		```
		- Status can take following values: "started", "finished"

## `GET/testResults?testHandle=<testhandle>`
	- If the test referred to by testHandle is complete, server will return test results in following format:
		- Response is JSON.
		- JSON format:
			```
			[
				{
					site: "http://www.google.com",
					avg: 5,
					max: 10,
					min: 1,
					startTestTime: <epochtime in milliseconds>,
					endTestTime: <epochtime in milliseconds>,
					iterations: 10
				},
				...
			]
			```
		- If the test is in progress, server returns HTTP error: 400.

## `GET/allTests`
	- This REST call returns all the test handles known to the server.
	- Response type is JSON.
	- Response format is:
		```
		{
			handle: [
								<test handle 1>,
								<test handle 2>,
								...
							]
		}
		```

## Additonal Info
	- Server will also persist the test results to disk in file "alltests.txt" after a test is complete.
	- Server will age out test results from memory and disk once every 24 hours.