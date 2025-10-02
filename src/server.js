const http = require('http');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
    '/': htmlHandler.getIndex,
    '/style.css': htmlHandler.getCSS,
    '/client.js': htmlHandler.getJS,
    notFound: jsonHandler.notFound,
};

// handle HTTP requests
const onRequest = (request, response) => {
    // full URL checking for https/http
    const protocol = request.connection.encrypted ? 'https' : 'http';
    const parsedURL = new URL(request.url, `${protocol}://${request.headers.host}`);
  
    // parse query parameters (?key=value) into plain object
    request.query = Object.fromEntries(parsedURL.searchParams);
  
    // check if the path name (the /name part of the url) matches
    // any in url object -> call function || default to index
    const handler = urlStruct[parsedURL.pathname] || urlStruct.notFound;
    handler(request, response, request.query);
  };
  
  // start HTTP server
  http.createServer(onRequest).listen(port);
  
  console.log(`Listening on 127.0.0.1: ${port}`);
