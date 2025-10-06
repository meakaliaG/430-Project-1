const http = require('http');
const { parse } = require('url');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
    GET: {
        '/': htmlHandler.getIndex,
        '/client.html': htmlHandler.getIndex,
        '/style.css': htmlHandler.getCSS,
        '/client.js': htmlHandler.getJS,
        '/books':jsonHandler.getBooks,
        '/books/search': jsonHandler.getBookSearch,
        '/genres': jsonHandler.getGenres,
    },
    HEAD: {
        '/books': (request, response) => {response.writeHead(200); response.end();},
        '/books/search': (request, response) => {response.writeHead(200); response.end();},
    },
    POST: {
        '/books': jsonHandler.addBook,
        '/books/:id': jsonHandler.updateBook,
        '/books/:id/delete': jsonHandler.deleteBook,
    },
    notFound: jsonHandler.notFound,
};

// handle HTTP requests
const onRequest = (request, response) => {
    // full URL checking for https/http
    const protocol = request.connection.encrypted ? 'https' : 'http';
    const parsedURL = new URL(request.url, `${protocol}://${request.headers.host}`);
    const {pathname, searchParams} = parsedURL;

    //console.log(parsedURL);
  
    // parse query parameters (?key=value) into plain object
    request.query = Object.fromEntries(searchParams);
  
    const methodRoutes = urlStruct[request.method];

    if (request.method === 'POST') {
        if (pathname.match(/^\/books\/\d+$/)) {
            return jsonHandler.updateBook(request, response);
        }
        if (pathname.match(/^\/books\/\d+\/delete$/)) {
            return jsonHandler.deleteBook(request, response);
        }
    }

    // check if the path name (the /name part of the url) matches
    // any in url object -> call function || default to index
    const handler = methodRoutes && methodRoutes[pathname]
        ? methodRoutes[pathname]
        : urlStruct.notFound;

    return handler(request, response, request.query);
  };
  
  // start HTTP server
  http.createServer(onRequest).listen(port);
  
  console.log(`Listening on 127.0.0.1: ${port}`);
