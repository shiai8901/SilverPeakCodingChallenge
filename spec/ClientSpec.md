# Client
  - Write a Java command line application which talks to this server using HTTPS.
  - The command line application should give users a prompt like a linux shell: ">"
  - If user types "help", he gets to see various commands he can type.
  - Implement following commands:
    - `testSites <site 1>, <site 2>, <site 3>, 10`
      - Last parameter is always iteration number
      - CLI should print output as: `Test started. Test handle: <handle>`
    - `getStatus <handle>`
      - CLI should print whether test has finished or is still running. For bonus points, you can modify the server to return percent so that user can see progress of the test
    - `getResults <handle>`
      - CLI should print the results in a table format:
        `<site name>, <iterations>, <min resp time>, <max resp time>, <avg resp time>, <test start time>, <test end time>`
    - `getAll`
      - CLI should print all the test handles currently server knows about