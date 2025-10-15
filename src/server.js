const http = require('http');
const { parse } = require('url');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');
const querystring = require('querystring');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
    GET: {
        '/': htmlHandler.getIndex, 
        '/client.html': htmlHandler.getIndex,
        '/doc.html': htmlHandler.getDoc ,
        '/style.css': htmlHandler.getCSS,
        '/client.js': htmlHandler.getJS,
        '/bookTitles':jsonHandler.getBookTitles,
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
        '/books/rating': jsonHandler.addRating,
    },
    notFound: jsonHandler.notFound,
};

// handle HTTP requests
const parseBody = (request) => new Promise((resolve, reject) => {
    const contentType = request.headers['content-type'] || '';
    let body = '';

    request.on('data', (chunk) => {
        body += chunk;
    });

    request.on('end', () => {
        if (!body) return resolve({});
        try {
            if (contentType.includes('application/json')) {
                return resolve(JSON.parse(body));
            } else if (contentType.includes('application/x-www-form-urlencoded')) {
                return resolve(querystring.parse(body));
            } else {
                return reject(new Error('Unsupported Content-Type: ' + contentType));
            }
        } catch (err) {
            return reject(err);
        }
    });

    request.on('error', reject);
})
const onRequest = async (request, response) => {
    // full URL checking for https/http
    const protocol = request.connection.encrypted ? 'https' : 'http';
    const parsedURL = new URL(request.url, `${protocol}://${request.headers.host}`);
    const {pathname, searchParams} = parsedURL;

    //console.log(parsedURL);
  
    // parse query parameters (?key=value) into plain object
    request.query = Object.fromEntries(searchParams);
  
    const methodRoutes = urlStruct[request.method];

    // check if the path name (the /name part of the url) matches
    // any in url object -> call function || default to index
    const handler = methodRoutes && methodRoutes[pathname]
        ? methodRoutes[pathname]
        : urlStruct.notFound;

    if (request.method === 'POST') {
        try {
            request.body = await parseBody(request);
            return handler(request, response, request.query, request.body);
        } catch (err) {
            console.error('POST parse error:', err.message);
            response.writeHead(400, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({error: err.message}));
            return;
        }
    }

    return handler(request, response, request.query);
  };
  
  // start HTTP server
  http.createServer(onRequest).listen(port);
  
  console.log(`Listening on 127.0.0.1: ${port}`);
